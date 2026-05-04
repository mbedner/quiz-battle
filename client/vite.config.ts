import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['quiz-battle-logo.png', 'sprites/*.png', 'music/*.mp3'],
      manifest: {
        name: 'Quiz Battle',
        short_name: 'Quiz Battle',
        description: 'Kids multiplayer battle quiz game',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        orientation: 'landscape',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // Don't cache socket.io traffic
        navigateFallbackDenylist: [/^\/socket\.io/],
        runtimeCaching: [
          {
            urlPattern: /\.(png|mp3|woff2?)$/,
            handler: 'CacheFirst',
            options: { cacheName: 'assets', expiration: { maxEntries: 60 } },
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
      },
    },
  },
});
