// Minimal ID3v2.3/2.4 reader (MP3): title, artist, cover. Other formats fall back to the file name.
export interface Tags { title?: string; artist?: string; cover?: Blob }
const dec = (b: Uint8Array, enc: number) =>
  new TextDecoder(enc === 1 ? 'utf-16' : enc === 2 ? 'utf-16be' : enc === 3 ? 'utf-8' : 'iso-8859-1').decode(b).replace(/\0+$/, '').replace(/^\uFEFF/, '')
const str = (b: Uint8Array) => String.fromCharCode(...b)
export async function readTags(file: File): Promise<Tags> {
  const h = new Uint8Array(await file.slice(0, 10).arrayBuffer())
  if (str(h.slice(0, 3)) !== 'ID3') return {}
  const ver = h[3], size = (h[6] << 21) | (h[7] << 14) | (h[8] << 7) | h[9]
  const buf = new Uint8Array(await file.slice(10, 10 + Math.min(size, 8_000_000)).arrayBuffer())
  const out: Tags = {}
  let p = 0
  while (p + 10 <= buf.length) {
    const id = str(buf.slice(p, p + 4))
    if (!/^[A-Z0-9]{4}$/.test(id)) break
    const fs = ver === 4 ? (buf[p + 4] << 21) | (buf[p + 5] << 14) | (buf[p + 6] << 7) | buf[p + 7] : buf[p + 4] * 2 ** 24 + (buf[p + 5] << 16) + (buf[p + 6] << 8) + buf[p + 7]
    const d = buf.slice(p + 10, p + 10 + fs); p += 10 + fs
    if (id === 'TIT2' || id === 'TPE1') out[id === 'TIT2' ? 'title' : 'artist'] = dec(d.slice(1), d[0])
    else if (id === 'APIC') {
      const enc = d[0]; let i = 1
      while (d[i]) i++
      const mime = str(d.slice(1, i)); i += 2
      if (enc === 0 || enc === 3) { while (d[i]) i++; i++ } else { while (!(d[i] === 0 && d[i + 1] === 0) && i < d.length) i += 2; i += 2 }
      out.cover = new Blob([d.slice(i)], { type: mime.includes('/') ? mime : 'image/jpeg' })
    }
  }
  return out
}
