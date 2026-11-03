// In the single-file preview, media is injected as data URIs (window.__IMG / __VID). In the real project these fall back to /public files.
type W = { __IMG?: Record<string, string>; __VID?: Record<string, string> }
const w = window as unknown as W
export const imgSrc = (n: string) => w.__IMG?.[n] ?? `/images/${n}-640.webp`
export const vidSrc = (n: string) => w.__VID?.[n] ?? `/video/${n}.mp4`
