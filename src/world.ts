import { ALBUMS, COLLABS } from './data/world'

const col = (v: string) => `var(${v})`
export function initWorld(reduce: boolean) {
  const el = document.querySelector<HTMLElement>('#world')!
  el.innerHTML = `<div class="sec"><div class="shead wv"><span class="no">02</span><h2>Fred’s <em>world</em></h2></div>
    <p class="wlead wv">Albums built from real life, and the friends who made songs with him. Tap a record to flip it.</p>
    <div class="shelf wv">${ALBUMS.map((a, i) => `<button class="slv" style="--c:${col(a.c)}" aria-expanded="false"><span class="sn">0${i + 1}</span><b>${a.t}</b><small>${a.s}</small><span class="sy">${a.y}</span><span class="sd">${a.p}</span></button>`).join('')}</div>
    <h3 class="wh wv">The collab wall</h3>
    <div class="wall wv">${COLLABS.map((c, i) => `<div class="stk${c.india ? ' in' : ''}" style="--c:${col(c.c)};--r:${((i * 37) % 7) - 3}deg"><b>${c.a}</b><span>${c.s}</span>${c.india ? '<em>our link to India ✦</em>' : ''}<button data-q="${c.q}">▶ my library</button></div>`).join('')}</div></div>`
  el.querySelectorAll<HTMLButtonElement>('.slv').forEach((b) => b.addEventListener('click', () => { const o = b.classList.toggle('open'); b.setAttribute('aria-expanded', String(o)) }))
  el.querySelector('.wall')!.addEventListener('click', (e) => { const b = (e.target as HTMLElement).closest<HTMLElement>('[data-q]'); if (b) dispatchEvent(new CustomEvent('play-track', { detail: b.dataset.q })) })
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: 0.15 })
  el.querySelectorAll('.wv').forEach((n) => (reduce ? n.classList.add('in') : io.observe(n)))
}
