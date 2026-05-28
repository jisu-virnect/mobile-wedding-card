import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import tailwindcss from '@tailwindcss/vite'

// basic-ssl gives the dev server a self-signed certificate so iOS Safari
// treats the page as a *secure context* — without that the Clipboard
// API, crypto.randomUUID, ServiceWorker registration etc. are all
// either missing or quietly refuse to run. The cert is per-machine and
// not committed; first visit shows a "not trusted" warning that the
// owner taps through once.
export default defineConfig({
  plugins: [react(), basicSsl(), tailwindcss()],
  // Pin the dev port so the Kakao Developer Console domain allow-list
  // doesn't drift each time a zombie process leaves an earlier port in use.
  // strictPort: true → fail loudly if 5177 is already taken (so we know to
  // kill the offender) instead of silently falling forward to 5178/5179/…
  server: {
    port: 5177,
    strictPort: true,
  },
  preview: {
    port: 5177,
    strictPort: true,
  },
})
