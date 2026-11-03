import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CHAPTERS, ATTEMPTS, type Media } from './data/wait'
import { imgSrc, vidSrc } from './lib/media'

const tile = (m: Media, i: number) => {
  const r = `style="--r:${i % 2 ? 1.6 : -1.6}deg"`
  return m.k === 'img'
    ? `<figure class="tile" ${r}><img src="${imgSrc(m.n)}" alt="${m.cap}" loading="lazy"><figcaption>${m.cap}</figcaption></figure>`
    : `<figure class="tile" ${r}><video src="${vidSrc(m.n)}" poster="${imgSrc('vid-' + m.n)}" muted loop playsinline preload="metadata" aria-label="${m.cap}"></video><figcaption>${m.cap}</figcaption></figure>`
}
export function initWait(reduce: boolean) {
  document.querySelector('#wait')!.innerHTML = `<div class="sec"><div class="shead rs"><span class="no">07</span><h2>The <em>wait</em></h2></div>
    ${CHAPTERS.map((c) => `<article class="ch rs"><div class="dt"><span>${c.d}</span></div><div class="cb"><h3>${c.t}</h3><p>${c.p}</p>
      ${c.chips ? `<div class="chips">${c.chips.map((x) => `<span>${x}</span>`).join('')}<small>as on our booking page</small></div>` : ''}
      ${c.stamps ? `<div class="sold">${c.stamps.map((x) => `<span>${x}<i>SOLD OUT</i></span>`).join('')}</div>` : ''}
      ${c.m ? `<div class="${c.m.length > 2 ? 'mosaic' : 'media'}">${c.m.map(tile).join('')}</div>` : ''}</div></article>`).join('')}
    <article class="ch fin rs"><div class="dt"><span>30 JUN → 7 JUL</span></div><div class="cb"><h3>Five tries</h3><p>Five queues in eight days. Four heartbreaks, one yes. This is how it went.</p>
      <div class="arow">${ATTEMPTS.map((a, i) => `<div class="at${a.ok ? ' ok' : ''}"><span class="an">ATTEMPT ${i + 1}</span><b class="aw">${a.when}</b><small>${a.show}</small><div class="thm">${a.imgs.map((n) => `<img src="${imgSrc(n)}" alt="BookMyShow screenshot, attempt ${i + 1}" loading="lazy">`).join('')}</div><p>${a.cap}</p><span class="stampx">${a.ok ? '✓' : '✗'}</span></div>`).join('')}</div>
      <div class="tkrow"><figure class="tk"><img src="${imgSrc('wait-mticket')}" alt="BookMyShow M-Ticket confirmation, with name and booking ID hidden"><span class="conf">CONFIRMED</span></figure></div>
      <p class="sum">4 × GA · ₹15,652 · Tue 8 Dec 2026 · 3:00 PM</p><a class="btn" href="#night">See you on 8 December</a></div></article></div>`
  if (!reduce) {
    gsap.from('.stampx', { scale: 3, rotation: -40, opacity: 0, stagger: 0.35, duration: 0.5, ease: 'back.out(2.2)', scrollTrigger: { trigger: '.arow', start: 'top 70%', once: true } })
    gsap.from('.conf', { scale: 2.5, rotation: -25, opacity: 0, duration: 0.6, ease: 'back.out(2)', scrollTrigger: { trigger: '.tk', start: 'top 75%', once: true } })
  }
  // lazy images change the page height as they load, so re-measure the scroll triggers (debounced)
  let rt: number | undefined
  const remeasure = () => { clearTimeout(rt); rt = window.setTimeout(() => ScrollTrigger.refresh(), 250) }
  document.querySelectorAll<HTMLImageElement>('#wait img').forEach((im) => { if (!im.complete) im.addEventListener('load', remeasure, { once: true }) })
  const vio = new IntersectionObserver((es) => es.forEach((e) => { const v = e.target as HTMLVideoElement; if (e.isIntersecting && !reduce) void v.play().catch(() => 0); else v.pause() }), { threshold: 0.3 })
  document.querySelectorAll('#wait video').forEach((v) => vio.observe(v))
}
