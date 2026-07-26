import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width: number, height: number, r: number, g: number, b: number): Buffer {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type 2 (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data with scanlines
  const rawRowLength = width * 3 + 1;
  const rawData = Buffer.alloc(height * rawRowLength);
  for (let y = 0; y < height; y++) {
    const rowStart = y * rawRowLength;
    rawData[rowStart] = 0; // no filter
    for (let x = 0; x < width; x++) {
      const pixelStart = rowStart + 1 + x * 3;
      const cx = width / 2;
      const cy = height / 2;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const maxR = width / 2;

      if (dist <= maxR) {
        const factor = 1 - dist / maxR;
        rawData[pixelStart] = Math.min(255, Math.floor(r * (0.8 + factor * 0.4)));
        rawData[pixelStart + 1] = Math.min(255, Math.floor(g * (0.8 + factor * 0.4)));
        rawData[pixelStart + 2] = Math.min(255, Math.floor(b * (0.8 + factor * 0.4)));
      } else {
        rawData[pixelStart] = 15;
        rawData[pixelStart + 1] = 23;
        rawData[pixelStart + 2] = 42;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const crc = calcCRC(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([length, typeBuf, data, crcBuf]);
}

function calcCRC(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function generateIconsFromSource(sourceIconPath: string, outputDir: string) {
  const sizes = [16, 48, 128];
  const pythonScript = `
from PIL import Image
import sys
source = sys.argv[1]
out = sys.argv[2]
size = int(sys.argv[3])
img = Image.open(source).convert('RGBA')
w, h = img.size
crop = min(w, h)
left = (w - crop) // 2
top = (h - crop) // 2
right = left + crop
bottom = top + crop
img = img.crop((left, top, right, bottom)).resize((size, size), Image.LANCZOS)
img.save(out, format='PNG')
`;

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon${size}.png`);
    execFileSync('python3', ['-c', pythonScript, sourceIconPath, outputPath, String(size)], { stdio: 'inherit' });
  }
}

const iconsDir = path.resolve(process.cwd(), 'public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const sourceIconPath = path.join(iconsDir, 'icon.png');
if (fs.existsSync(sourceIconPath)) {
  generateIconsFromSource(sourceIconPath, iconsDir);
} else {
  fs.writeFileSync(path.join(iconsDir, 'icon16.png'), createPNG(16, 16, 99, 102, 241));
  fs.writeFileSync(path.join(iconsDir, 'icon48.png'), createPNG(48, 48, 99, 102, 241));
  fs.writeFileSync(path.join(iconsDir, 'icon128.png'), createPNG(128, 128, 99, 102, 241));
}

console.log('Successfully generated icons in public/icons');
