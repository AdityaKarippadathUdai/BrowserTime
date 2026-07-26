import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

// ─── Shared path aliases ───────────────────────────────────────────────────────
const alias = { '@': resolve(__dirname, 'src') };

// ─── Main extension UI build (popup, dashboard, newtab) ───────────────────────
// These are HTML entries → bundled as ES modules loaded by the browser normally.
const uiConfig = defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias },
  build: {
    outDir: process.env.DIST_DIR || 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        newtab: resolve(__dirname, 'newtab.html'),
      },
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});

export default uiConfig;
