import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { img } from './story'
import { EVENT } from './data/event'
import { FILM, SAY, STATS, REASONS, TOUR, PACK } from './data/show'
import { api } from './lib/api'
import { INDIA } from './data/indiaMap'

const q = <T extends HTMLElement>(s: string) => document.querySelector<T>(s)!
const hd = (n: string, a: string, b: string) => `<div class="shead rs"><span class="no">${n}</span><h2>${a} <em>${b}</em></h2></div>`

export function initShow(reduce: boolean) {
  q('#generational').innerHTML = `<div class="sec">${hd('05', 'Generational', 'talent')}<p class="say rs">${SAY}</p></div>
    <div class="film" id="film" aria-label="Crowd photos"><div class="fstrip">${[0, 1].map((k) => FILM.map((n, i) => `<figure class="fp" style="--r:${(i + k) % 2 ? 1.8 : -1.8}deg"${k ? ' aria-hidden="true"' : ''}>${img(n, k ? '' : 'Fred again.. crowd and stage')}</figure>`).join('')).join('')}</div></div>
    <div class="sec"><div class="stats">${STATS.map((s) => `<div class="rs"><b data-n="${s.n}">0</b><small>${s.l}</small></div>`).join('')}</div>
    <ol class="why">${REASONS.map((r, i) => `<li class="rs"><span>0${i + 1}</span><div><h3>${r.t}</h3><p>${r.p}</p></div></li>`).join('')}</ol></div>`

  const pins = { d: INDIA.pins.delhi, m: INDIA.pins.mumbai, b: INDIA.pins.bengaluru }
  q('#india').innerHTML = `<div class="sec">${hd('06', 'India,', 'again..')}
    <div class="lock rs"><span class="l1">again..</span><span class="l2">फिर से..</span><span class="l3">पुन्हा..</span><span class="l4">ಮತ್ತೆ..</span></div>
    <div class="ingrid"><svg class="map rs" viewBox="${INDIA.vb}" role="img" aria-label="Stylised map of India with pins at Delhi NCR, Mumbai and Bengaluru">
      <path class="land" d="${INDIA.path}"/>
      <path class="route" d="M${pins.d} L${pins.m} L${pins.b}"/>
      <g class="mpin"><circle cx="${pins.d[0]}" cy="${pins.d[1]}" r="7"/><text x="${pins.d[0] + 12}" y="${pins.d[1] + 4}">Delhi NCR</text></g>
      <g class="mpin us"><circle class="pulse" cx="${pins.m[0]}" cy="${pins.m[1]}" r="12"/><circle cx="${pins.m[0]}" cy="${pins.m[1]}" r="9"/><text x="${pins.m[0] + 16}" y="${pins.m[1] + 4}">MUMBAI · OUR NIGHT</text></g>
      <g class="mpin"><circle cx="${pins.b[0]}" cy="${pins.b[1]}" r="7"/><text x="${pins.b[0] + 12}" y="${pins.b[1] + 4}">Bengaluru</text></g></svg>
    <div class="info"><p class="rs">The India run is announced: five shows across three cities. Produced and promoted by BookMyShow Live x Sunburn.</p>
      <ul class="tour">${TOUR.map((t) => `<li class="rs${t.ours ? ' ours' : ''}"><b>${t.d}</b><span>${t.v}<small>${t.c}</small></span>${t.ours ? '<em>OUR NIGHT</em>' : ''}</li>`).join('')}</ul></div></div></div>`

  q('#night').innerHTML = `<div class="sec">${hd('08', 'Our', 'night')}
    <div class="ticket rs"><div class="tmain"><span class="tag">we’re going</span><h3>Fred again..</h3><p>${EVENT.venue}, ${EVENT.city}</p><p id="tdate"></p><div class="tcount" id="tcount"></div>
      <div class="tbtns"><button class="btn" id="ics">Save the date</button><a class="gc" id="gcal" target="_blank" rel="noopener">Add to Google Calendar</a></div><small>Show time per our M-Ticket: 3:00 PM. 4 tickets, GA.</small></div>
      <div class="tstub"><span>No. 0001</span><div class="bc"></div><span>MUMBAI</span></div></div>
    <div class="cols"><div class="panel rs"><h3>Pack list <small id="pc"></small></h3><ul class="chk" id="pack"></ul></div>
      <div class="panel rs"><h3>Meet-up note</h3><textarea id="meet" rows="6" placeholder="Where do we meet? Which gate, what time, who brings what…" aria-label="Meet-up note"></textarea><small id="saved">Saved on this device only.</small></div></div>
    <p class="fine">Fan-made tribute, not affiliated with the artist. Photos belong to their owners. Produced &amp; promoted by BookMyShow Live x Sunburn.</p></div>`

  // reveals
  if (!reduce) {
    gsap.set('.rs', { opacity: 0, y: 40 })
    ScrollTrigger.batch('.rs', { start: 'top 90%', once: true, onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' }) })
    gsap.from('.mpin', { scale: 0, opacity: 0, stagger: 0.25, duration: 0.6, ease: 'back.out(2)', scrollTrigger: { trigger: '.map', start: 'top 75%', once: true } })
  } else q('#film').classList.add('static')
  document.querySelectorAll<HTMLElement>('.stats b').forEach((b) => {
    const n = Number(b.dataset.n), o = { v: 0 }
    const run = () => gsap.to(o, { v: n, duration: 1.4, ease: 'power2.out', onUpdate: () => (b.textContent = String(Math.round(o.v))) })
    reduce ? (b.textContent = String(n)) : ScrollTrigger.create({ trigger: b, start: 'top 90%', once: true, onEnter: run })
  })

  // countdown + calendar
  const ED = new Date(EVENT.dateISO), EE = new Date(+ED + 4 * 36e5), tc = q('#tcount')
  q('#tdate').textContent = ED.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  tc.innerHTML = ['Days', 'Hrs', 'Min', 'Sec'].map((l) => `<div><b>00</b><small>${l}</small></div>`).join('')
  const nb = tc.querySelectorAll('b')
  const tick = () => { const d = Math.max(0, +ED - Date.now()); [d / 864e5, (d / 36e5) % 24, (d / 6e4) % 60, (d / 1e3) % 60].forEach((v, i) => (nb[i].textContent = String(Math.floor(v)).padStart(2, '0'))) }
  tick(); setInterval(tick, 1000)
  const f8 = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, '')
  q<HTMLAnchorElement>('#gcal').href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Fred again.. in Mumbai')}&dates=${f8(ED)}/${f8(EE)}&location=${encodeURIComponent(EVENT.venue + ', ' + EVENT.city)}`
  q('#ics').addEventListener('click', () => {
    const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//again Mumbai//EN', 'BEGIN:VEVENT', `UID:again-${f8(ED)}@mumbai`, `DTSTAMP:${f8(new Date())}`, `DTSTART:${f8(ED)}`, `DTEND:${f8(EE)}`, 'SUMMARY:Fred again.. in Mumbai', `LOCATION:${EVENT.venue}\\, ${EVENT.city}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' })); a.download = 'fred-again-mumbai.ics'; document.body.appendChild(a); a.click(); a.remove()
  })

  // pack list + meet-up note (saved on this device via api.ts)
  void (async () => {
    const done = new Set(await api.get<string[]>('pack', [])), ul = q('#pack'), pc = q('#pc')
    const count = () => (pc.textContent = `${done.size}/${PACK.length}`)
    PACK.forEach((t) => {
      const li = document.createElement('li'), l = document.createElement('label'), c = document.createElement('input'), s = document.createElement('span')
      c.type = 'checkbox'; c.checked = done.has(t); s.textContent = t
      c.addEventListener('change', () => { c.checked ? done.add(t) : done.delete(t); void api.set('pack', [...done]); count() })
      l.append(c, s); li.appendChild(l); ul.appendChild(li)
    })
    count()
    const m = q<HTMLTextAreaElement>('#meet'); m.value = await api.get('meet', '')
    let timer: number | undefined
    m.addEventListener('input', () => { clearTimeout(timer); timer = window.setTimeout(() => { void api.set('meet', m.value); q('#saved').textContent = 'Saved on this device only.' }, 400) })
  })()
}
