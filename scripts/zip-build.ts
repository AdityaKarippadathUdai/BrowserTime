import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

function zipFolder(sourceFolder: string, outZipPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(sourceFolder)) {
      return reject(new Error(`Source folder ${sourceFolder} does not exist.`));
    }

    const output = fs.createWriteStream(outZipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`📦 Archived ${sourceFolder} -> ${outZipPath} (${archive.pointer()} total bytes)`);
      resolve();
    });

    archive.on('error', (err) => reject(err));

    archive.pipe(output);
    archive.directory(sourceFolder, false);
    archive.finalize();
  });
}

async function runZip() {
  console.log('📦 Packaging build distributions into zip archives...');
  const root = process.cwd();

  const chromeDist = path.resolve(root, 'chrome-dist');
  const firefoxDist = path.resolve(root, 'firefox-dist');

  if (fs.existsSync(chromeDist)) {
    await zipFolder(chromeDist, path.resolve(root, 'chrome-extension.zip'));
  } else {
    console.warn('⚠️ chrome-dist/ missing. Run "npm run build:chrome" first.');
  }

  if (fs.existsSync(firefoxDist)) {
    await zipFolder(firefoxDist, path.resolve(root, 'firefox-extension.zip'));
  } else {
    console.warn('⚠️ firefox-dist/ missing. Run "npm run build:firefox" first.');
  }
}

runZip().catch((err) => {
  console.error('Failed to create zip packages:', err);
  process.exit(1);
});
