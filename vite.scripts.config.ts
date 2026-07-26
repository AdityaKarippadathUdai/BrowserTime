// Vite config for bundling the background and content scripts as self-contained IIFE files.
import { defineConfig } from 'vite';
import { resolve } from 'path';

const entryName = process.env.BUILD_ENTRY || 'background';
const entry = entryName === 'content'
  ? resolve(__dirname, 'src/content/content.ts')
  : resolve(__dirname, 'src/background/background.ts');

export default defineConfig({
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  build: {
    outDir: process.env.DIST_DIR || 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        [entryName]: entry,
      },
      output: {
        format: 'iife',
        entryFileNames: '[name].js',
        manualChunks: undefined,
      },
    },
    minify: true,
  },
});
