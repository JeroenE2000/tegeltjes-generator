/**
 * Kleine, afhankelijkheidsvrije GIF-encoder.
 *
 * - Eén gedeeld palet van 255 kleuren via median cut over alle frames.
 * - Index 255 is transparant: pixels die gelijk blijven aan het vorige frame
 *   worden doorzichtig, waardoor LZW ze heel klein inpakt.
 * - Frames die precies gelijk zijn aan het vorige worden samengevoegd (langere delay).
 *
 * Gebruik:
 *   const gif = new GifEncoder(480, 480);
 *   gif.addFrame(imageData.data, 10);   // delay in honderdsten van een seconde
 *   const blob = await gif.finish(progress => ...);
 */
import { nextTick } from "../utils.js";

const PALETTE_SIZE = 255;
const TRANSPARENT = 255;
const MIN_CODE_SIZE = 8;

export class GifEncoder {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.frames = [];
    this.histogram = new Uint32Array(32768);
  }

  /** @param {Uint8ClampedArray} rgba  pixeldata van getImageData */
  addFrame(rgba, delay) {
    const colors = new Uint16Array(this.width * this.height);
    for (let p = 0, i = 0; i < colors.length; p += 4, i++) {
      const key = toColorKey(rgba[p], rgba[p + 1], rgba[p + 2]);
      colors[i] = key;
      this.histogram[key]++;
    }
    this.frames.push({ colors, delay });
  }

  async finish(onProgress = () => {}) {
    const palette = medianCut(this.histogram, PALETTE_SIZE);
    const toIndex = createNearestLookup(palette);
    const frames = this.indexFrames(toIndex);

    const chunks = [];
    const push = (bytes) => chunks.push(new Uint8Array(bytes));
    push([...ascii("GIF89a"), ...u16(this.width), ...u16(this.height), 0xf7, 0, 0]);
    chunks.push(colorTable(palette));
    push([0x21, 0xff, 0x0b, ...ascii("NETSCAPE2.0"), 0x03, 0x01, 0, 0, 0]); // oneindig herhalen

    for (let f = 0; f < frames.length; f++) {
      const { indices, delay, previous } = frames[f];
      const pixels = previous ? maskUnchanged(indices, previous) : indices;
      const flags = previous ? 0x05 : 0x04; // niet wissen (+ transparantie bij diff-frames)
      push([0x21, 0xf9, 0x04, flags, ...u16(delay), TRANSPARENT, 0]);
      push([0x2c, 0, 0, 0, 0, ...u16(this.width), ...u16(this.height), 0]);
      chunks.push(imageData(lzwEncode(pixels, MIN_CODE_SIZE)));
      onProgress((f + 1) / frames.length);
      await nextTick();
    }
    push([0x3b]);
    return new Blob(chunks, { type: "image/gif" });
  }

  indexFrames(toIndex) {
    const frames = [];
    let previous = null;
    for (const { colors, delay } of this.frames) {
      const indices = new Uint8Array(colors.length);
      for (let i = 0; i < colors.length; i++) indices[i] = toIndex(colors[i]);
      if (previous && arraysEqual(indices, previous)) {
        frames[frames.length - 1].delay += delay;
        continue;
      }
      frames.push({ indices, delay, previous });
      previous = indices;
    }
    return frames;
  }
}

/* ---------- kleuren ---------- */

/** 15-bits sleutel: 5 bits per kanaal. */
function toColorKey(r, g, b) {
  return ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
}

function fromColorKey(key) {
  return [((key >> 10) & 31) * 8 + 4, ((key >> 5) & 31) * 8 + 4, (key & 31) * 8 + 4];
}

/** Median cut: splitst steeds het "belangrijkste" kleurenblok op de mediaan van zijn langste as. */
function medianCut(histogram, maxColors) {
  const colors = [];
  for (let key = 0; key < histogram.length; key++) {
    if (histogram[key]) colors.push([...fromColorKey(key), histogram[key]]);
  }
  if (colors.length <= maxColors) return colors.map(([r, g, b]) => [r, g, b]);

  const boxes = [colors];
  while (boxes.length < maxColors) {
    const pick = pickBoxToSplit(boxes);
    if (!pick) break;
    const box = boxes[pick.index];
    box.sort((a, b) => a[pick.axis] - b[pick.axis]);
    const cut = medianIndex(box);
    boxes.splice(pick.index, 1, box.slice(0, cut), box.slice(cut));
  }
  return boxes.map(averageColor);
}

function pickBoxToSplit(boxes) {
  let best = null;
  boxes.forEach((box, index) => {
    if (box.length < 2) return;
    const min = [255, 255, 255];
    const max = [0, 0, 0];
    let count = 0;
    for (const color of box) {
      for (let c = 0; c < 3; c++) {
        if (color[c] < min[c]) min[c] = color[c];
        if (color[c] > max[c]) max[c] = color[c];
      }
      count += color[3];
    }
    const ranges = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
    const axis = ranges.indexOf(Math.max(...ranges));
    const score = ranges[axis] * Math.sqrt(count);
    if (!best || score > best.score) best = { index, axis, score };
  });
  return best;
}

function medianIndex(box) {
  const total = box.reduce((sum, color) => sum + color[3], 0);
  let seen = 0;
  for (let i = 0; i < box.length - 1; i++) {
    seen += box[i][3];
    if (seen >= total / 2) return i + 1;
  }
  return 1;
}

function averageColor(box) {
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (const color of box) {
    r += color[0] * color[3];
    g += color[1] * color[3];
    b += color[2] * color[3];
    n += color[3];
  }
  return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
}

/** Zoekt per kleursleutel de dichtstbijzijnde paletkleur (gewogen naar hoe het oog kleur ziet), met cache. */
function createNearestLookup(palette) {
  const lookup = new Int16Array(32768).fill(-1);
  return (key) => {
    if (lookup[key] >= 0) return lookup[key];
    const [r, g, b] = fromColorKey(key);
    let bestIndex = 0;
    let bestDistance = Infinity;
    palette.forEach(([pr, pg, pb], i) => {
      const distance = (pr - r) ** 2 * 2 + (pg - g) ** 2 * 4 + (pb - b) ** 2 * 3;
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    });
    lookup[key] = bestIndex;
    return bestIndex;
  };
}

/* ---------- frames ---------- */

function arraysEqual(a, b) {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function maskUnchanged(indices, previous) {
  const out = new Uint8Array(indices.length);
  for (let i = 0; i < indices.length; i++) out[i] = indices[i] === previous[i] ? TRANSPARENT : indices[i];
  return out;
}

/* ---------- bytes ---------- */

function ascii(text) {
  return Array.from(text, (ch) => ch.charCodeAt(0));
}

function u16(value) {
  return [value & 255, (value >> 8) & 255];
}

function colorTable(palette) {
  const table = new Uint8Array(256 * 3);
  palette.forEach(([r, g, b], i) => table.set([r, g, b], i * 3));
  return table;
}

/** LZW-data in sub-blokken van maximaal 255 bytes. */
function imageData(data) {
  const block = new Uint8Array(1 + data.length + Math.ceil(data.length / 255) + 1);
  let offset = 0;
  block[offset++] = MIN_CODE_SIZE;
  for (let p = 0; p < data.length; p += 255) {
    const length = Math.min(255, data.length - p);
    block[offset++] = length;
    block.set(data.subarray(p, p + length), offset);
    offset += length;
  }
  block[offset++] = 0;
  return block.subarray(0, offset);
}

/** Variabele-breedte LZW zoals de GIF-specificatie die voorschrijft. */
function lzwEncode(indices, minCodeSize) {
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let nextCode = endCode + 1;
  let dictionary = new Map();

  const out = [];
  let buffer = 0;
  let bits = 0;
  const write = (code) => {
    buffer |= code << bits;
    bits += codeSize;
    while (bits >= 8) {
      out.push(buffer & 255);
      buffer >>>= 8;
      bits -= 8;
    }
  };

  write(clearCode);
  let prefix = indices[0];
  for (let i = 1; i < indices.length; i++) {
    const symbol = indices[i];
    const key = prefix * 256 + symbol;
    const known = dictionary.get(key);
    if (known !== undefined) {
      prefix = known;
      continue;
    }
    write(prefix);
    if (nextCode < 4096) {
      dictionary.set(key, nextCode++);
      if (nextCode > 1 << codeSize && codeSize < 12) codeSize++;
    } else {
      write(clearCode);
      dictionary = new Map();
      codeSize = minCodeSize + 1;
      nextCode = endCode + 1;
    }
    prefix = symbol;
  }
  write(prefix);
  write(endCode);
  if (bits > 0) out.push(buffer & 255);
  return Uint8Array.from(out);
}
