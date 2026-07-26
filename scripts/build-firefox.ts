import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🦊 Building Mozilla Firefox Extension...');

const rootDir = process.cwd();
const distDir = path.resolve(rootDir, 'firefox-dist');
const manifestSrc = path.resolve(rootDir, 'manifests/manifest.firefox.json');
const manifestDest = path.resolve(distDir, 'manifest.json');
const env = { ...process.env, DIST_DIR: 'firefox-dist' };

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

console.log('✅ Firefox build completed successfully at firefox-dist/');
