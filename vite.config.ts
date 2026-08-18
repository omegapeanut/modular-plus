import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// `base` must match the GitHub repo name for GitHub Pages project sites
// (e.g. https://<user>.github.io/modular-plus/). It's overridden at build
// time in CI via the VITE_BASE_PATH env var set in the deploy workflow,
// so this default only matters for local `npm run build`.
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/modular-plus/',
  plugins: [react(), tailwindcss()],
})
