# again.. MUMBAI
Vite + TypeScript fan site. Installable offline PWA.

    npm install
    npm run dev                          # dev (service worker is off here)
    npm run build && npm run preview     # test offline mode: DevTools > Application > Service Workers > Offline

## My Library (songs stay on your device)
Add songs with the button or drag and drop. They are saved in the browser (IndexedDB) and play offline. Nothing is uploaded.
Optional: put files you own in `public/audio/` and list them in `public/audio/playlist.json`:
    [{ "title": "My Track", "artist": "Artist", "file": "my-track.mp3" }]

## Edit your details
`src/data/event.ts` (date, venue, time), `src/data/story.ts`, `src/data/show.ts`.

## Deploy (needs HTTPS for the mic sampler and offline mode)
Vercel / Netlify: import the repo, build command `npm run build`, output directory `dist`.
GitHub Pages: set `base` in vite.config.ts to `/repo-name/`.
