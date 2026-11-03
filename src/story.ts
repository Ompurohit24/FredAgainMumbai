import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { WHO, STEPS } from './data/story'

const q = <T extends HTMLElement>(s: string) => document.querySelector<T>(s)!
const pre = (n: string): string => (window as unknown as { __IMG?: Record<string, string> }).__IMG?.[n] ?? `/images/${n}-640.webp` // __IMG only exists in the single-file preview
export const img = (n: string, alt: string) => `<img src="${pre(n)}" alt="${alt}" loading="lazy" width="640" height="800">`
const bars = Array.from({ length: 26 }, (_, k) => `<s style="height:${20 + Math.abs(Math.sin(k * 1.9)) * 80}%;animation-delay:${k * 0.05}s"></s>`).join('')
const head = (n: string, a: string, b: string) => `<div class="shead rv"><span class="no">${n}</span><h2>${a} <em>${b}</em></h2></div>`

export function initStory(reduce: boolean) {
  q('#story').innerHTML = `<div class="sec">${head('01', 'Who is', 'Fred?')}
    <div class="whogrid"><div class="stack rv"><figure class="pp p1">${img('f8', 'Fred again.. looking up at the sky')}</figure><figure class="pp p2">${img('f4', 'Fred again.. on stage with a huge crowd')}</figure><span class="note">${WHO.chant}</span></div>
    <div class="copy rv"><p class="born">${WHO.born}</p><p class="lead">${WHO.lead}</p><p>${WHO.body}</p><p>${WHO.work}</p><ul class="awards">${WHO.awards.map((x) => `<li>${x}</li>`).join('')}</ul><div class="tags">${WHO.tags.map((t) => `<span>${t}</span>`).join('')}</div></div></div></div>`
  q('#make').innerHTML = `<div class="pin">${head('03', 'How he', 'makes it')}<div class="stage">${STEPS.map((s, i) => `<article class="st"><figure class="mph">${img(s.img, 'Fred again.. ' + s.k)}</figure><div class="mtx"><span class="cnt">0${i + 1}/0${STEPS.length} · ${s.k}</span><h3>${s.t}</h3><p>${s.p}</p><div class="wf">${bars}</div></div></article>`).join('')}</div><div class="prog"><i></i></div></div>`
  q('#lab').innerHTML = `<div class="sec">${head('04', 'Try the', 'sampler')}
    <div class="panel rv"><p>Record 5 seconds of anything (your voice, a clap, the room). It gets chopped into 8 pads. Tap them, or press 1 to 8. Nothing is uploaded; it stays on your device.</p>
    <button class="rec" id="rec">● Record 5s</button><p class="status" id="status" aria-live="polite">Mic is only used when you press record.</p>
    <div class="pads" id="pads">${Array.from({ length: 8 }, (_, i) => `<button class="pad" disabled aria-label="Pad ${i + 1}">${i + 1}</button>`).join('')}</div></div></div>`

  // scroll reveals
  if (!reduce) {
    gsap.set('.rv', { opacity: 0, y: 50 })
    ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' }) })
  }

  // pinned "how he makes music" story
  const make = q('#make'), sts = gsap.utils.toArray<HTMLElement>('.st')
  if (reduce) make.classList.add('static')
  else {
    gsap.set(sts, { autoAlpha: 0, y: 40 }); gsap.set(sts[0], { autoAlpha: 1, y: 0 })
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: make, start: 'top top', end: `+=${sts.length * 80}%`, pin: true, scrub: 0.6 } })
    sts.slice(0, -1).forEach((s, i) => tl.to(s, { autoAlpha: 0, y: -40, duration: 0.4 }, i + 0.8).fromTo(sts[i + 1], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.4 }, i + 0.8))
    tl.fromTo('.prog i', { scaleX: 0 }, { scaleX: 1, duration: tl.duration() }, 0)
  }
  addEventListener('load', () => ScrollTrigger.refresh())

  // sampler: record 5s from the mic, slice into 8 pads
  const rec = q<HTMLButtonElement>('#rec'), status = q('#status'), pads = [...document.querySelectorAll<HTMLButtonElement>('.pad')]
  let ctx: AudioContext | undefined, buf: AudioBuffer | undefined
  const play = (i: number) => {
    if (!ctx || !buf) return
    const s = ctx.createBufferSource(), d = buf.duration / 8
    s.buffer = buf; s.connect(ctx.destination); s.start(0, i * d, d)
    pads[i].classList.add('on'); setTimeout(() => pads[i].classList.remove('on'), 160)
  }
  pads.forEach((p, i) => p.addEventListener('click', () => play(i)))
  addEventListener('keydown', (e) => { const n = Number(e.key); if (n >= 1 && n <= 8 && !(e.target instanceof HTMLInputElement)) play(n - 1) })
  rec.addEventListener('click', async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      ctx ??= new AudioContext(); await ctx.resume()
      const mr = new MediaRecorder(stream), chunks: Blob[] = []
      mr.ondataavailable = (e) => chunks.push(e.data)
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop()); rec.disabled = false
        try { buf = await ctx!.decodeAudioData(await new Blob(chunks).arrayBuffer()); pads.forEach((p) => (p.disabled = false)); status.textContent = 'Ready. Play the pads!' }
        catch { status.textContent = 'Couldn’t read that recording. Try again.' }
      }
      mr.start(); rec.disabled = true
      let s = 5; status.textContent = `Recording… ${s}`
      const iv = setInterval(() => { s--; status.textContent = s > 0 ? `Recording… ${s}` : 'Chopping…'; if (s <= 0) clearInterval(iv) }, 1000)
      setTimeout(() => mr.stop(), 5000)
    } catch { status.textContent = 'Mic access is blocked. Allow the microphone in your browser to try this.' }
  })
}
