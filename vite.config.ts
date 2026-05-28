import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// HTTPS via @vitejs/plugin-basic-ssl was attempted to unlock the Clipboard
// API on mobile dev, but iOS Safari refused to accept the self-signed
// cert for module fetches (HTML loads, JS chunks blank-page). The
// production deploy on Vercel is HTTPS by default so clipboard works
// there — until then, the dev server is HTTP and clipboard is verified
// on PC at http://localhost:5177 (which IS a secure context).
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
