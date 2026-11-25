import * as THREE from 'three';

const textureCache = new Map<string, THREE.CanvasTexture>();

function seededNoise(x: number, y: number, seed = 1337): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return n - Math.floor(n);
}

function smoothNoise(x: number, y: number, seed = 1337): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = seededNoise(ix, iy, seed);
  const b = seededNoise(ix + 1, iy, seed);
  const c = seededNoise(ix, iy + 1, seed);
  const d = seededNoise(ix + 1, iy + 1, seed);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

function fbm(x: number, y: number, octaves = 5, seed = 1337): number {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    value += amp * smoothNoise(x * freq, y * freq, seed + i * 19);
    freq *= 2.02;
    amp *= 0.5;
  }
  return value;
}

/**
 * Weathered Carrara / Warm Museum Marble texture (diffuse + bump)
 */
export function getMarbleTextures(): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const keyMap = 'marble-map';
  const keyBump = 'marble-bump';
  if (textureCache.has(keyMap) && textureCache.has(keyBump)) {
    return { map: textureCache.get(keyMap)!, bumpMap: textureCache.get(keyBump)! };
  }

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(size, size);

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;
  const bImg = bCtx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x / size) * 4.2;
      const ny = (y / size) * 4.2;
      const warp = fbm(nx, ny, 5, 42) * 3.8;
      const vein = Math.pow(Math.abs(Math.sin((nx * 1.4 + ny * 0.8 + warp) * Math.PI)), 0.35);
      const grain = fbm(nx * 5, ny * 5, 3, 99) * 0.12;
      const tone = Math.min(1, Math.max(0, 0.58 + vein * 0.34 - grain));

      const r = Math.round(230 * tone + 16);
      const g = Math.round(221 * tone + 14);
      const b = Math.round(205 * tone + 12);

      const idx = (y * size + x) * 4;
      img.data[idx] = r;
      img.data[idx + 1] = g;
      img.data[idx + 2] = b;
      img.data[idx + 3] = 255;

      const bumpVal = Math.round((vein * 0.5 + grain * 2.2) * 195 + 30);
      bImg.data[idx] = bumpVal;
      bImg.data[idx + 1] = bumpVal;
      bImg.data[idx + 2] = bumpVal;
      bImg.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  bCtx.putImageData(bImg, 0, 0);

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.colorSpace = THREE.SRGBColorSpace;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;

  textureCache.set(keyMap, map);
  textureCache.set(keyBump, bumpMap);
  return { map, bumpMap };
}

/**
 * Rough dark architectural stone texture for monoliths, halls, and stairs
 */
export function getStoneTextures(): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const keyMap = 'stone-map';
  const keyBump = 'stone-bump';
  if (textureCache.has(keyMap) && textureCache.has(keyBump)) {
    return { map: textureCache.get(keyMap)!, bumpMap: textureCache.get(keyBump)! };
  }

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(size, size);

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;
  const bImg = bCtx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x / size) * 7;
      const ny = (y / size) * 7;
      const base = fbm(nx, ny, 5, 207);
      const fine = fbm(nx * 6, ny * 6, 3, 512);
      const strata = Math.sin(ny * 2.4 + base * 2.1) * 0.08;
      const v = Math.min(1, Math.max(0, 0.22 + base * 0.24 + fine * 0.12 + strata));

      const idx = (y * size + x) * 4;
      img.data[idx] = Math.round(v * 112 + 16);
      img.data[idx + 1] = Math.round(v * 107 + 15);
      img.data[idx + 2] = Math.round(v * 97 + 13);
      img.data[idx + 3] = 255;

      const bv = Math.round((base * 0.65 + fine * 0.35) * 255);
      bImg.data[idx] = bv;
      bImg.data[idx + 1] = bv;
      bImg.data[idx + 2] = bv;
      bImg.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  bCtx.putImageData(bImg, 0, 0);

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 2);
  map.colorSpace = THREE.SRGBColorSpace;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2, 2);

  textureCache.set(keyMap, map);
  textureCache.set(keyBump, bumpMap);
  return { map, bumpMap };
}

function fillRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

/**
 * 18th-century Königsberg cobblestone texture
 */
export function getCobblestoneTextures(): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const keyMap = 'cobble-map';
  const keyBump = 'cobble-bump';
  if (textureCache.has(keyMap) && textureCache.has(keyBump)) {
    return { map: textureCache.get(keyMap)!, bumpMap: textureCache.get(keyBump)! };
  }

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  ctx.fillStyle = '#0d0c0a';
  ctx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#141414';
  bCtx.fillRect(0, 0, size, size);

  const rows = 16;
  const cols = 12;
  const rowH = size / rows;
  const colW = size / cols;

  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (colW * 0.5);
    for (let c = -1; c <= cols; c++) {
      const jitterX = (seededNoise(c, r, 11) - 0.5) * 4;
      const jitterY = (seededNoise(c, r, 23) - 0.5) * 3;
      const x = c * colW + offset + jitterX + 3;
      const y = r * rowH + jitterY + 3;
      const w = colW - 6;
      const h = rowH - 6;

      const shade = 28 + Math.floor(seededNoise(c, r, 37) * 26);
      ctx.fillStyle = `rgb(${shade + 5}, ${shade + 2}, ${shade - 2})`;
      fillRoundedRect(ctx, x, y, w, h, 5);

      const bShade = 155 + Math.floor(seededNoise(c, r, 47) * 75);
      bCtx.fillStyle = `rgb(${bShade}, ${bShade}, ${bShade})`;
      fillRoundedRect(bCtx, x, y, w, h, 5);
    }
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(5, 10);
  map.colorSpace = THREE.SRGBColorSpace;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(5, 10);

  textureCache.set(keyMap, map);
  textureCache.set(keyBump, bumpMap);
  return { map, bumpMap };
}

/**
 * 18th-century antique ivory & bronze clock face with Roman numerals
 */
export function getClockFaceTexture(): THREE.CanvasTexture {
  const key = 'clock-face';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const cx = size / 2;
  const cy = size / 2;

  // Aged parchment/enamel dial gradient
  const grad = ctx.createRadialGradient(cx, cy, 40, cx, cy, size * 0.49);
  grad.addColorStop(0, '#27231d');
  grad.addColorStop(0.68, '#1b1814');
  grad.addColorStop(0.92, '#13110e');
  grad.addColorStop(1, '#0b0a09');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Concentric antique gold rings
  ctx.strokeStyle = '#b79b68';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.46, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(183, 155, 104, 0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.42, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.29, 0, Math.PI * 2);
  ctx.stroke();

  // Minute ticks
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const isHour = i % 5 === 0;
    const r1 = size * (isHour ? 0.422 : 0.435);
    const r2 = size * 0.454;
    ctx.strokeStyle = isHour ? '#d4bc8c' : 'rgba(183, 155, 104, 0.45)';
    ctx.lineWidth = isHour ? 4 : 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    ctx.stroke();
  }

  // Roman numerals (traditional horological IIII)
  const numerals = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  ctx.fillStyle = '#eae4d8';
  ctx.font = '500 58px Georgia, "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  numerals.forEach((num, idx) => {
    const a = (idx / 12) * Math.PI * 2 - Math.PI / 2;
    const r = size * 0.355;
    const nx = cx + Math.cos(a) * r;
    const ny = cy + Math.sin(a) * r;
    ctx.save();
    ctx.translate(nx, ny);
    ctx.rotate(a + Math.PI / 2);
    ctx.fillText(num, 0, 0);
    ctx.restore();
  });

  // Subtle Königsberg inscription
  ctx.fillStyle = 'rgba(183, 155, 104, 0.68)';
  ctx.font = '400 22px Georgia, serif';
  ctx.fillText('KÖNIGSBERG · MDCCXXIV', cx, cy + size * 0.16);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  textureCache.set(key, tex);
  return tex;
}

export function disposeCachedTextures() {
  textureCache.forEach((tex) => tex.dispose());
  textureCache.clear();
}
