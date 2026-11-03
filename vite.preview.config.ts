// Single-file preview build (Google Fonts instead of bundled fonts). Not for production.
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import path from 'path'
export default defineConfig({
  plugins: [viteSingleFile(), { name: 'gf', transformIndexHtml: () => [{ tag: 'link', attrs: { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Noto+Sans+Devanagari:wght@800&family=Noto+Sans+Kannada:wght@800&family=Space+Mono:wght@400;700&family=Caveat:wght@600&display=swap' }, injectTo: 'head' }] }],
  resolve: { alias: { './fonts': path.resolve('src/fonts.preview.ts') } },
  build: { outDir: 'dist-preview' },
})
