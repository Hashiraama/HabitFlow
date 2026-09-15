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

function createPNG(width, height, drawPixel) {
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixel(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Draw clean preview screenshot
function drawScreenshotMobile(x, y, w, h) {
  // Mobile app preview (clean light background, emerald header, cards)
  if (y < h * 0.08) {
    // Header
    return [16, 185, 129, 255]; // Emerald
  } else if (y < h * 0.45 && x > w * 0.08 && x < w * 0.92) {
    // Top calendar card
    return [255, 255, 255, 255];
  } else if (y > h * 0.48 && y < h * 0.88 && x > w * 0.08 && x < w * 0.92) {
    // Habits card
    return [255, 255, 255, 255];
  } else {
    // Light gray background
    return [244, 244, 245, 255];
  }
}

function drawScreenshotDesktop(x, y, w, h) {
  if (y < h * 0.08) {
    return [16, 185, 129, 255];
  } else if (x > w * 0.25 && x < w * 0.75 && y > h * 0.12 && y < h * 0.88) {
    return [255, 255, 255, 255];
  } else {
    return [244, 244, 245, 255];
  }
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate Screenshots required by PWABuilder store readiness
fs.writeFileSync(
  path.join(publicDir, 'screenshot-mobile.png'),
  createPNG(540, 960, drawScreenshotMobile)
);
fs.writeFileSync(
  path.join(publicDir, 'screenshot-desktop.png'),
  createPNG(1024, 768, drawScreenshotDesktop)
);

console.log('Successfully generated screenshots in /public');
