import { readTags, type Tags } from './lib/id3'
import { loadMeta, saveMeta, putBlob, getBlob, delBlob, type Meta } from './lib/db'

const $ = <T extends HTMLElement>(s: string) => document.querySelector<T>(s)!
const fmt = (s: number) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00')
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

export async function initLibrary() {
  $('#library').innerHTML = `<div class="sec"><div class="shead"><span class="no">09</span><h2>My <em>library</em></h2></div>
  <div class="libwrap" id="libwrap"><div class="libgrid">
   <div class="deck"><div class="cass" id="cass"><div class="reel"><i></i></div><div class="lbl"><b id="ct">Nothing playing</b><small id="ca">Add a song to start</small></div><div class="reel"><i></i></div></div>
    <canvas id="vz" aria-hidden="true"></canvas><canvas id="wf" aria-label="Seek bar"></canvas>
    <div class="tm"><span id="tc">0:00</span><span id="td">0:00</span></div>
    <div class="ctl"><button id="shuf" aria-label="Shuffle" aria-pressed="false">⇄</button><button id="prv" aria-label="Previous">⏮</button><button id="ppl" class="big" aria-label="Play">▶</button><button id="nxt" aria-label="Next">⏭</button><button id="rep" aria-label="Repeat">↻</button></div></div>
   <div class="queue"><div class="drop" id="drop"><b>Drop songs here</b><span>or</span><button class="btn" id="addb">Add songs</button><input type="file" id="fin" accept="audio/*,.mp3,.m4a,.aac,.wav,.ogg,.flac,.opus" multiple hidden><small>Saved on this device only. Plays offline.</small></div>
    <ol id="qlist"></ol><p class="qmsg" id="qmsg" role="status"></p><small class="tip">iPhone tip: add this site to your Home Screen so Safari keeps your songs.</small></div></div></div></div>`
  document.body.insertAdjacentHTML('beforeend', `<div class="mini" id="mini" hidden><div class="mbar"><i id="mpi"></i></div><button id="mprv" aria-label="Previous">⏮</button><button id="mpp" aria-label="Play">▶</button><button id="mnx" aria-label="Next">⏭</button><span id="mt"></span></div>`)

  let list: Meta[] = [], cur = -1, shuf = false, rep: 'off' | 'all' | 'one' = 'off', peaksData: number[] | null = null, curUrl = ''
  const mem = new Map<string, Blob>(), audio = new Audio()
  const msg = (t: string) => ($('#qmsg').textContent = t)
  try { list = await loadMeta() } catch { msg('Saving songs is not available in this browser.') }
  // tidy older untagged songs named "Artist - Title"
  let fixed = false
  list.forEach((m) => { if (m.artist === 'Unknown artist') { const sp = m.title.split(/\s+-\s+/); if (sp.length > 1) { m.artist = sp[0]; m.title = sp.slice(1).join(' - '); fixed = true } } })
  if (fixed) await saveMeta(list).catch(() => 0)
  try {
    const r = await fetch('/audio/playlist.json')
    if (r.ok) ((await r.json()) as { title: string; artist: string; file: string }[]).forEach((t) => list.unshift({ id: 'b:' + t.file, title: t.title, artist: t.artist, size: 0, url: '/audio/' + t.file }))
  } catch { /* no bundled playlist */ }

  let actx: AudioContext, an: AnalyserNode
  const ensure = () => { if (actx) return; actx = new AudioContext(); an = actx.createAnalyser(); an.fftSize = 128; actx.createMediaElementSource(audio).connect(an); an.connect(actx.destination) }

  async function peaks(b: Blob) {
    if (b.size > 40e6) return null
    try {
      const buf = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(await b.arrayBuffer()), ch = buf.getChannelData(0), n = 140, step = Math.floor(ch.length / n)
      const a = Array.from({ length: n }, (_, i) => { let m = 0; for (let j = i * step; j < (i + 1) * step; j += 64) m = Math.max(m, Math.abs(ch[j])); return m })
      const mx = Math.max(...a) || 1; return a.map((v) => v / mx)
    } catch { return null }
  }
  async function coverInfo(b: Blob) {
    try {
      const bm = await createImageBitmap(b), s = Math.min(1, 300 / Math.max(bm.width, bm.height)), c = document.createElement('canvas')
      c.width = bm.width * s; c.height = bm.height * s
      const g = c.getContext('2d')!; g.drawImage(bm, 0, 0, c.width, c.height)
      const px = g.getImageData(0, 0, c.width, c.height).data; let r = 0, gr = 0, bl = 0, n = 0
      for (let i = 0; i < px.length; i += 16) { const a = (px[i] + px[i + 1] + px[i + 2]) / 3; if (a > 30 && a < 225) { r += px[i]; gr += px[i + 1]; bl += px[i + 2]; n++ } }
      return { url: c.toDataURL('image/jpeg', 0.8), color: n ? `rgb(${(r / n) | 0},${(gr / n) | 0},${(bl / n) | 0})` : undefined }
    } catch { return null }
  }

  function renderQueue() {
    $('#qlist').innerHTML = list.map((m, i) => `<li class="${i === cur ? 'cur' : ''}" data-i="${i}"><span class="th">${m.cover ? `<img src="${m.cover}" alt="">` : '♪'}</span><button class="rowmain" data-act="play"><b>${esc(m.title)}</b><small>${esc(m.artist)}</small></button><em>${m.url ? 'Bundled' : 'Offline ✓'}</em>${m.url ? '' : '<button data-act="ren" aria-label="Rename">✎</button><button data-act="del" aria-label="Delete">✕</button>'}</li>`).join('')
    if (!list.length) $('#qlist').innerHTML = '<li class="emptyrow">Your library is empty. Drop your first song above.</li>'
  }
  function ui(m: Meta) {
    $('#ct').textContent = m.title; $('#ca').textContent = m.artist; $('#mt').textContent = `${m.title} · ${m.artist}`; $('#mini').hidden = false
    $('#libwrap').style.setProperty('--wash', m.color ? `color-mix(in srgb, ${m.color} 30%, #F5F1E8)` : 'var(--yellow)')
    document.body.classList.add('has-mini')
    if ('mediaSession' in navigator) navigator.mediaSession.metadata = new MediaMetadata({ title: m.title, artist: m.artist, artwork: m.cover ? [{ src: m.cover, sizes: '300x300', type: 'image/jpeg' }] : [] })
  }
  async function play(i: number) {
    if (i < 0 || i >= list.length) return
    ensure(); await actx.resume()
    const m = list[i]; cur = i; let src = m.url, blob: Blob | undefined
    if (!src) {
      blob = mem.get(m.id) ?? (await getBlob(m.id))
      if (!blob) { msg('That song file is missing. Delete it and add it again.'); return }
      if (curUrl) URL.revokeObjectURL(curUrl)
      src = curUrl = URL.createObjectURL(blob)
    }
    audio.src = src
    await audio.play().catch(() => msg('This device could not play that file format.'))
    ui(m); renderQueue(); peaksData = null
    void (async () => { const b = blob ?? (await (await fetch(m.url!)).blob()); const p = await peaks(b); if (list[cur] === m) peaksData = p })()
  }
  const nextIdx = (auto: boolean) => {
    if (!list.length) return -1
    if (auto && rep === 'one') return cur
    if (shuf && list.length > 1) { let n; do n = Math.floor(Math.random() * list.length); while (n === cur); return n }
    return cur + 1 < list.length ? cur + 1 : rep === 'all' || !auto ? 0 : -1
  }
  const next = (auto = false) => { const n = nextIdx(auto); if (n >= 0) void play(n) }
  const prev = () => { if (audio.currentTime > 3) audio.currentTime = 0; else void play(cur > 0 ? cur - 1 : list.length - 1) }
  const toggle = () => { if (cur < 0) { void play(0); return } audio.paused ? void audio.play() : audio.pause() }
  async function add(files: File[]) {
    const fs = files.filter((f) => f.type.startsWith('audio/') || /\.(mp3|m4a|aac|wav|ogg|flac|opus)$/i.test(f.name))
    if (!fs.length) { msg('No audio files found.'); return }
    void navigator.storage?.persist?.()
    let saved = true; const first = list.length
    for (const f of fs) {
      const id = crypto.randomUUID(), t: Tags = await readTags(f).catch(() => ({}))
      const base = f.name.replace(/\.[^.]+$/, ''), sp = base.split(/\s+-\s+/)
      const m: Meta = { id, title: t.title || (sp.length > 1 ? sp.slice(1).join(' - ') : base), artist: t.artist || (sp.length > 1 ? sp[0] : 'Unknown artist'), size: f.size }
      if (t.cover) { const c = await coverInfo(t.cover); if (c) { m.cover = c.url; m.color = c.color } }
      mem.set(id, f); list.push(m)
      try { await putBlob(id, f) } catch { saved = false }
    }
    try { await saveMeta(list.filter((m) => !m.url)) } catch { saved = false }
    msg(saved ? `${fs.length} song(s) saved on this device.` : 'Playing now, but this browser could not save them for offline.')
    renderQueue(); if (cur < 0) void play(first)
  }
  audio.addEventListener('play', () => { document.body.classList.add('playing'); $('#ppl').textContent = '⏸'; $('#mpp').textContent = '⏸' })
  audio.addEventListener('pause', () => { document.body.classList.remove('playing'); $('#ppl').textContent = '▶'; $('#mpp').textContent = '▶' })
  audio.addEventListener('ended', () => next(true))
  audio.addEventListener('timeupdate', () => { $('#tc').textContent = fmt(audio.currentTime); $('#td').textContent = fmt(audio.duration); $('#mpi').style.width = (audio.duration ? (audio.currentTime / audio.duration) * 100 : 0) + '%' })
  $('#ppl').onclick = $('#mpp').onclick = toggle; $('#nxt').onclick = $('#mnx').onclick = () => next(); $('#prv').onclick = $('#mprv').onclick = prev
  $('#shuf').onclick = () => { shuf = !shuf; $('#shuf').setAttribute('aria-pressed', String(shuf)); $('#shuf').classList.toggle('on', shuf) }
  $('#rep').onclick = () => { rep = rep === 'off' ? 'all' : rep === 'all' ? 'one' : 'off'; $('#rep').textContent = rep === 'one' ? '↻1' : '↻'; $('#rep').classList.toggle('on', rep !== 'off') }
  addEventListener('play-track', (e) => {
    const k = String((e as CustomEvent<string>).detail).toLowerCase()
    const i = list.findIndex((x) => (k === 'ten' ? x.title.toLowerCase() === 'ten' : x.title.toLowerCase().replace(/[’']/g, "'").includes(k.replace(/[’']/g, "'"))))
    if (i >= 0) void play(i)
    else { msg(`“${k}” is not in your library yet. Add the song to play it.`); document.getElementById('library')?.scrollIntoView({ behavior: 'smooth' }) }
  })
  const fin = $<HTMLInputElement>('#fin'), drop = $('#drop')
  $('#addb').onclick = () => fin.click(); fin.onchange = () => { void add([...(fin.files ?? [])]); fin.value = '' }
  drop.ondragover = (e) => { e.preventDefault(); drop.classList.add('over') }; drop.ondragleave = () => drop.classList.remove('over')
  drop.ondrop = (e) => { e.preventDefault(); drop.classList.remove('over'); void add([...(e.dataTransfer?.files ?? [])]) }
  $('#qlist').addEventListener('click', async (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-act]'), li = b?.closest<HTMLElement>('li'); if (!b || !li) return
    const i = Number(li.dataset.i), m = list[i]
    if (b.dataset.act === 'play') void play(i)
    else if (b.dataset.act === 'ren') { const n = prompt('Rename song', m.title); if (n?.trim()) { m.title = n.trim(); await saveMeta(list.filter((x) => !x.url)).catch(() => 0); renderQueue(); if (i === cur) ui(m) } }
    else if (b.dataset.act === 'del' && confirm(`Delete "${m.title}" from this device?`)) {
      await delBlob(m.id).catch(() => 0); mem.delete(m.id); list.splice(i, 1); await saveMeta(list.filter((x) => !x.url)).catch(() => 0)
      if (i === cur) { audio.pause(); audio.removeAttribute('src'); cur = -1; $('#ct').textContent = 'Nothing playing'; $('#ca').textContent = 'Add a song to start'; $('#mini').hidden = true; document.body.classList.remove('has-mini') } else if (i < cur) cur--
      renderQueue()
    }
  })
  const wf = $<HTMLCanvasElement>('#wf'), vz = $<HTMLCanvasElement>('#vz'), data = new Uint8Array(64)
  const seek = (e: PointerEvent) => { const r = wf.getBoundingClientRect(); if (audio.duration) audio.currentTime = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * audio.duration }
  wf.addEventListener('pointerdown', (e) => { wf.setPointerCapture(e.pointerId); seek(e) }); wf.addEventListener('pointermove', (e) => { if (e.buttons) seek(e) })
  const fit = (c: HTMLCanvasElement) => { const d = Math.min(devicePixelRatio || 1, 2), r = c.getBoundingClientRect(); if (c.width !== Math.round(r.width * d)) { c.width = Math.round(r.width * d); c.height = Math.round(r.height * d) } return c.getContext('2d')! }
  const frame = (t: number) => {
    const v = fit(vz), w = fit(wf), live = an && !audio.paused
    if (live) an.getByteFrequencyData(data); else for (let i = 0; i < 64; i++) data[i] = 18 + 10 * Math.sin(t / 700 + i * 0.4)
    v.clearRect(0, 0, vz.width, vz.height)
    const n = 32, bw = vz.width / n
    for (let i = 0; i < n; i++) { const h = Math.max(4, (data[i] / 255) * vz.height); v.fillStyle = i % 2 ? '#2547FF' : '#FF5A1F'; v.fillRect(i * bw + bw * 0.15, vz.height - h, bw * 0.7, h) }
    w.clearRect(0, 0, wf.width, wf.height)
    const ratio = audio.duration ? audio.currentTime / audio.duration : 0
    if (peaksData) { const bw2 = wf.width / peaksData.length; peaksData.forEach((p, i) => { const h = Math.max(3, p * wf.height * 0.9); w.fillStyle = i / peaksData!.length < ratio ? '#FF5A1F' : '#11111155'; w.fillRect(i * bw2 + 1, (wf.height - h) / 2, Math.max(1, bw2 - 2), h) }) }
    else { w.fillStyle = '#11111133'; w.fillRect(0, wf.height / 2 - 3, wf.width, 6); w.fillStyle = '#FF5A1F'; w.fillRect(0, wf.height / 2 - 3, wf.width * ratio, 6) }
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
  if ('mediaSession' in navigator) { const ms = navigator.mediaSession; ms.setActionHandler('play', toggle); ms.setActionHandler('pause', toggle); ms.setActionHandler('previoustrack', prev); ms.setActionHandler('nexttrack', () => next()) }
  renderQueue()
}
