import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building Google Chrome Extension (Manifest V3)...');

const rootDir = process.cwd();
const distDir = path.resolve(rootDir, 'chrome-dist');
const manifestSrc = path.resolve(rootDir, 'manifests/manifest.chrome.json');
const manifestDest = path.resolve(distDir, 'manifest.json');
const env = { ...process.env, DIST_DIR: 'chrome-dist' };

// Run icon generator first
execSync('npx tsx scripts/generate-icons.ts', { stdio: 'inherit' });

// 1. Build UI (popup, dashboard, newtab) — ES modules
execSync('npx vite build --config vite.config.ts', { stdio: 'inherit', env });

// 2. Build background + content as self-contained IIFE scripts
execSync('npx vite build --config vite.scripts.config.ts', {
  stdio: 'inherit',
  env: { ...env, BUILD_ENTRY: 'background' },
});
execSync('npx vite build --config vite.scripts.config.ts', {
  stdio: 'inherit',
  env: { ...env, BUILD_ENTRY: 'content' },
});

// Copy Manifest
fs.copyFileSync(manifestSrc, manifestDest);

const requiredFiles = ['manifest.json', 'background.js', 'content.js'];
for (const relPath of requiredFiles) {
  const fullPath = path.resolve(distDir, relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Expected build artifact missing: ${relPath}`);
  }
}

console.log('✅ Chrome build completed successfully at chrome-dist/');
