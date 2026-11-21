import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The site is served from a custom domain (see public/CNAME), so it lives at
  // the root of that domain. If it is ever deployed to
  // https://<username>.github.io/<repo-name>/ instead, change this to '/<repo-name>/'.
  base: '/',
})
