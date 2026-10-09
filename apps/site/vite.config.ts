import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';

const DEV_PORT = 5174;
const CONTACT_API_DEV_URL = 'http://localhost:8787';

export default defineConfig({
  plugins: [reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    // Small font subsets would otherwise be inlined as data: URIs, which a strict
    // `font-src 'self'` CSP blocks.
    assetsInlineLimit: (filePath) =>
      filePath.endsWith('.woff2') ? false : undefined,
  },
  server: {
    port: DEV_PORT,
    strictPort: true,
    proxy: {
      '/api': CONTACT_API_DEV_URL,
    },
  },
});
