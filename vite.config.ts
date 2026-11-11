import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Catatan — Pelacak Pekerjaan',
        short_name: 'Catatan',
        description: 'Pelacak pekerjaan dan proyek pribadi. Berjalan offline, data tersimpan di perangkat.',
        lang: 'id',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#0f1115',
        background_color: '#0f1115',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Semua aset statis di-precache (cache-first). Belum ada panggilan API:
        // data hidup di localStorage, jadi aplikasi berjalan penuh saat offline.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
})
