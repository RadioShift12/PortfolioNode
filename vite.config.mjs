import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const page = (file) => fileURLToPath(new URL(file, import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      // One entry per HTML page (multi-page app)
      input: {
        main: page('./index.html'),
        projects: page('./projects.html'),
        resume: page('./resume.html'),
        contact: page('./contact.html'),
      },
    },
  },
  server: {
    // Forward API calls to your Express server during development
    proxy: { '/api': 'http://localhost:3000' },
  },
});