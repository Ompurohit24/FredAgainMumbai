// Converts photos-src/* to public/images/<name>-640.webp and -1200.webp
import sharp from 'sharp'; import fs from 'fs'; import path from 'path'
const src = 'photos-src', out = 'public/images'; fs.mkdirSync(out, { recursive: true })
for (const f of fs.readdirSync(src)) {
  const n = path.parse(f).name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  for (const w of [640, 1200]) await sharp(path.join(src, f)).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toFile(`${out}/${n}-${w}.webp`)
}
console.log('images done')
