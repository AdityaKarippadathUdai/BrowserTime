import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🦊 Building Mozilla Firefox Extension...');

const rootDir = process.cwd();
const distDir = path.resolve(rootDir, 'firefox-dist');
const manifestSrc = path.resolve(rootDir, 'manifests/manifest.firefox.json');
const manifestDest = path.resolve(distDir, 'manifest.json');

// Run icon generator first
execSync('npx tsx scripts/generate-icons.ts', { stdio: 'inherit' });

// Run Vite build targeting firefox-dist
process.env.DIST_DIR = 'firefox-dist';
execSync('npx vite build', { stdio: 'inherit', env: { ...process.env, DIST_DIR: 'firefox-dist' } });

// Copy Manifest
fs.copyFileSync(manifestSrc, manifestDest);

console.log('✅ Firefox build completed successfully at firefox-dist/');
