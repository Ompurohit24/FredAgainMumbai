import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // base: '/your-repo-name/',   // only for GitHub Pages project sites
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'again.. MUMBAI', short_name: 'again..', description: 'Fan tribute site for our Fred again.. Mumbai night',
        theme_color: '#F5F1E8', background_color: '#F5F1E8', display: 'standalone', start_url: '/',
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }],
      },
      workbox: {
        // app shell, fonts and photos are precached so the site opens with no internet
        globPatterns: ['**/*.{js,css,html,png,svg,webp,woff2}'],
        globIgnores: ['images/*-1200.webp', 'audio/**'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          { urlPattern: ({ url }) => url.pathname === '/audio/playlist.json', handler: 'StaleWhileRevalidate', options: { cacheName: 'playlist-v1' } },
          { urlPattern: ({ url }) => url.pathname.startsWith('/video/'), handler: 'CacheFirst', options: { cacheName: 'video-v1', rangeRequests: true, cacheableResponse: { statuses: [200] } } },
          { urlPattern: ({ url }) => url.pathname.startsWith('/audio/'), handler: 'CacheFirst', options: { cacheName: 'audio-v1', rangeRequests: true, cacheableResponse: { statuses: [200] }, expiration: { maxEntries: 100 } } },
        ],
      },
    }),
  ],
})
