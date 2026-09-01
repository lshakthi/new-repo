import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Dev proxies for NCBI. The public BLAST endpoint does not send CORS headers,
// so a browser blocks direct calls and the app falls back to illustrative
// data. Proxying through the dev server makes these calls same-origin, so the
// client's "paste a sequence → get real matching sequences in-app" BLAST flow
// works end-to-end without the user leaving the app.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/ncbi-blast': {
        target: 'https://blast.ncbi.nlm.nih.gov',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/ncbi-blast/, '/Blast.cgi'),
      },
      '/ncbi-eutils': {
        target: 'https://eutils.ncbi.nlm.nih.gov',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/ncbi-eutils/, '/entrez/eutils'),
      },
    },
  },
})
