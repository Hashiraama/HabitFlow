import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// CRC32 calculation for PNG chunks
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);

  return Buffer.concat([len, typeAndData, crc]);
}

function generatePNG(size, isMaskable = false) {
  const width = size;
  const height = size;

  // Scanlines with filter byte 0 at beginning of each row
  // Row size = 1 (filter byte) + width * 4 (RGBA)
  const rawData = Buffer.alloc(height * (1 + width * 4));

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = isMaskable ? width * 0.46 : width * 0.44;
  const innerRadius = width * 0.28;

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background rounded squircle / circle: Emerald gradient #059669 to #10B981
      if (isMaskable) {
        // Maskable icon has full bleed background
        const gradT = (y / height);
        const r = Math.round(5 + gradT * (16 - 5));
        const g = Math.round(150 + gradT * (185 - 150));
        const b = Math.round(105 + gradT * (129 - 105));

        // Draw checkmark / emblem inside safe zone (dist <= innerRadius)
        // Checkmark coordinates:
        // Left arm: from (-width*0.12, dy ~ 0) to (0, +width*0.12)
        // Right arm: from (0, +width*0.12) to (+width*0.18, -width*0.12)
        const inCheckmark = isPointInCheckmark(x - centerX, y - centerY, width * 0.35);

        if (inCheckmark) {
          rawData[offset++] = 255;
          rawData[offset++] = 255;
          rawData[offset++] = 255;
          rawData[offset++] = 255;
        } else {
          rawData[offset++] = r;
          rawData[offset++] = g;
          rawData[offset++] = b;
          rawData[offset++] = 255;
        }
      } else {
        // Non-maskable with smooth rounded badge
        // Squircle corner radius
        const cornerR = width * 0.22;
        const inBadge = isInsideRoundedRect(x, y, width, height, cornerR);

        if (inBadge) {
          const gradT = (y / height);
          const r = Math.round(5 + gradT * (16 - 5));
          const g = Math.round(150 + gradT * (185 - 150));
          const b = Math.round(105 + gradT * (129 - 105));

          const inCheckmark = isPointInCheckmark(x - centerX, y - centerY, width * 0.35);
          if (inCheckmark) {
            rawData[offset++] = 255;
            rawData[offset++] = 255;
            rawData[offset++] = 255;
            rawData[offset++] = 255;
          } else {
            rawData[offset++] = r;
            rawData[offset++] = g;
            rawData[offset++] = b;
            rawData[offset++] = 255;
          }
        } else {
          // Transparent outside badge
          rawData[offset++] = 0;
          rawData[offset++] = 0;
          rawData[offset++] = 0;
          rawData[offset++] = 0;
        }
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: RGBA (6)
  ihdrData[10] = 0; // Compression method: deflate (0)
  ihdrData[11] = 0; // Filter method: 0
  ihdrData[12] = 0; // Interlace method: none (0)
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT chunk
  const idatChunk = makeChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function isInsideRoundedRect(x, y, w, h, r) {
  if (x < r && y < r) return Math.hypot(x - r, y - r) <= r;
  if (x > w - r && y < r) return Math.hypot(x - (w - r), y - r) <= r;
  if (x < r && y > h - r) return Math.hypot(x - r, y - (h - r)) <= r;
  if (x > w - r && y > h - r) return Math.hypot(x - (w - r), y - (h - r)) <= r;
  return x >= 0 && x <= w && y >= 0 && y <= h;
}

function isPointInCheckmark(px, py, scale) {
  // Checkmark consists of two line segments with thickness
  // Pt1: (-scale * 0.5, 0) -> Pt2: (-scale * 0.05, scale * 0.4)
  // Pt2: (-scale * 0.05, scale * 0.4) -> Pt3: (scale * 0.55, -scale * 0.35)
  const thickness = scale * 0.22;

  const d1 = distToSegment(px, py, -scale * 0.48, 0, -scale * 0.08, scale * 0.38);
  const d2 = distToSegment(px, py, -scale * 0.08, scale * 0.38, scale * 0.52, -scale * 0.38);

  return Math.min(d1, d2) <= thickness / 2;
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Generate PNGs
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePNG(192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePNG(512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePNG(512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePNG(180, false));

// 2. Generate SVG
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#059669" flood-opacity="0.35" />
    </filter>
  </defs>
  <rect width="512" height="512" rx="120" fill="url(#grad)" filter="url(#shadow)" />
  <circle cx="256" cy="256" r="160" fill="white" fill-opacity="0.15" />
  <path d="M165 260 L230 325 L350 195" fill="none" stroke="#ffffff" stroke-width="48" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');

console.log('Successfully generated PWA icon assets in /public');
