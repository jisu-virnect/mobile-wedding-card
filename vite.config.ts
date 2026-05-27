import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

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
