import './fonts'
import './styles/tokens.css'
import './styles/hero.css'
import './styles/story.css'
import './styles/show.css'
import './styles/world.css'
import './styles/wait.css'
import { initWorld } from './world'
import { initWait } from './wait'
import './styles/extras.css'
import { initExtras } from './extras'
import { initStory } from './story'
import { initShow } from './show'
import './styles/lib.css'
import { initLibrary } from './library'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { EVENT } from './data/event'

gsap.registerPlugin(ScrollTrigger)
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const $ = <T extends HTMLElement>(s: string) => document.querySelector<T>(s)!

// smooth scroll
let lenis: Lenis | null = null
if (!reduce) {
  lenis = new Lenis({ lerp: 0.1 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis!.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  // keep Lenis' scroll limit in sync when the page grows after load (lazy images, fonts, videos)
  new ResizeObserver(() => lenis?.resize()).observe(document.body)
  addEventListener('load', () => lenis?.resize())
}
initExtras()
initStory(reduce)
initWorld(reduce)
initWait(reduce)
initShow(reduce)
void initLibrary()
$('#enter').addEventListener('click', (e) => { if (lenis) { e.preventDefault(); lenis.scrollTo('#story') } })

// countdown
const cd = $('#count')
cd.innerHTML = ['Days', 'Hrs', 'Min', 'Sec'].map((l) => `<div><b>00</b><small>${l}</small></div>`).join('')
const nums = cd.querySelectorAll('b')
const target = new Date(EVENT.dateISO).getTime()
const tick = () => {
  const d = Math.max(0, target - Date.now())
  ;[d / 864e5, (d / 36e5) % 24, (d / 6e4) % 60, (d / 1e3) % 60].forEach((v, i) => (nums[i].textContent = String(Math.floor(v)).padStart(2, '0')))
}
tick(); setInterval(tick, 1000)

// marquee
const mq = $('#mq'); mq.innerHTML = mq.innerHTML.repeat(4)

// multilingual "again.." morph
const words = gsap.utils.toArray<HTMLElement>('.morph .w')
gsap.set(words, { yPercent: 110, autoAlpha: 0 })
gsap.set(words[0], { yPercent: 0, autoAlpha: 1 })
if (!reduce) {
  const tl = gsap.timeline({ repeat: -1 })
  words.forEach((w, i) => {
    const next = words[(i + 1) % words.length]
    tl.to(w, { yPercent: -110, autoAlpha: 0, duration: 0.7, ease: 'power3.in' }, '+=1.8')
      .fromTo(next, { yPercent: 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out' }, '<+0.35')
  })
}

// photo frames: tilt, intro pop, scroll parallax
document.querySelectorAll<HTMLElement>('.fr').forEach((f) => {
  gsap.set(f, { rotation: Number(f.dataset.r) })
  if (reduce) return
  gsap.to(f, { y: () => Number(f.dataset.s) * innerHeight, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
})
if (!reduce) {
  gsap.from('.fr', { scale: 0.5, opacity: 0, duration: 1, ease: 'back.out(1.6)', stagger: 0.12, delay: 0.2 })
  gsap.from('.center > *', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 })
}

// magnetic button
const btn = $('#enter')
if (!reduce && matchMedia('(pointer:fine)').matches) {
  btn.addEventListener('mousemove', (e) => { const r = btn.getBoundingClientRect(); gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.3 }) })
  btn.addEventListener('mouseleave', () => gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.5)' }))
}
