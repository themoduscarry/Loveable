import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Relative asset paths so the same build works unmodified whether it's
  // served from a domain root (virtualbridgeconnect.com) or a GitHub Pages
  // project subpath (themoduscarry.github.io/Loveable/).
  base: './',
})
