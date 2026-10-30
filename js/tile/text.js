/**
 * Tekst-layout: zoekt de grootste lettergrootte die in het vak past
 * en verdeelt de woorden zo gelijkmatig mogelijk over de regels.
 */

const cache = new Map();
const MAX_CACHE = 200;
const SHRINK_STEP = 0.95;
const MAX_ATTEMPTS = 70;

export function fitText(ctx, text, maxWidth, maxHeight, font) {
  const key = [text, Math.round(maxWidth), Math.round(maxHeight), font.f].join("|");
  if (cache.has(key)) return cache.get(key);

  let size = Math.min(maxHeight * 0.42, maxWidth * 0.24) * font.scale;
  let lines = [text];
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    ctx.font = `${size}px ${font.f}`;
    lines = wrapLines(ctx, text, maxWidth);
    const fitsWidth = lines.every((line) => ctx.measureText(line).width <= maxWidth);
    const fitsHeight = lines.length * size * font.lh <= maxHeight;
    if (fitsWidth && fitsHeight) break;
    size *= SHRINK_STEP;
  }

  const result = { size, lines: balanceLines(ctx, text, lines, maxWidth) };
  if (cache.size >= MAX_CACHE) cache.clear();
  cache.set(key, result);
  return result;
}

export function clearTextCache() {
  cache.clear();
}

/** Gretige woordomloop; harde enters van de gebruiker blijven staan. */
function wrapLines(ctx, text, maxWidth) {
  const lines = [];
  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push("");
      continue;
    }
    let line = words[0];
    for (const word of words.slice(1)) {
      const candidate = `${line} ${word}`;
      if (ctx.measureText(candidate).width <= maxWidth) {
        line = candidate;
      } else {
        lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }
  return lines;
}

/** Maakt de regels even lang door de smalst mogelijke breedte te zoeken met hetzelfde aantal regels. */
function balanceLines(ctx, text, lines, maxWidth) {
  const count = lines.length;
  if (count < 2) return lines;
  let low = maxWidth * 0.35;
  let high = maxWidth;
  for (let i = 0; i < 14; i++) {
    const mid = (low + high) / 2;
    const attempt = wrapLines(ctx, text, mid);
    const fits = attempt.length <= count && attempt.every((line) => ctx.measureText(line).width <= mid);
    if (fits) high = mid;
    else low = mid;
  }
  const balanced = wrapLines(ctx, text, high);
  return balanced.length === count ? balanced : lines;
}
