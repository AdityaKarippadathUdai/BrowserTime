import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building Google Chrome Extension (Manifest V3)...');

const rootDir = process.cwd();
const distDir = path.resolve(rootDir, 'chrome-dist');
const manifestSrc = path.resolve(rootDir, 'manifests/manifest.chrome.json');
const manifestDest = path.resolve(distDir, 'manifest.json');

// Run icon generator first
execSync('npx tsx scripts/generate-icons.ts', { stdio: 'inherit' });

// Run Vite build targeting chrome-dist
process.env.DIST_DIR = 'chrome-dist';
execSync('npx vite build', { stdio: 'inherit', env: { ...process.env, DIST_DIR: 'chrome-dist' } });

// Copy Manifest
fs.copyFileSync(manifestSrc, manifestDest);

console.log('✅ Chrome build completed successfully at chrome-dist/');
