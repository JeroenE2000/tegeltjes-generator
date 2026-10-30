/**
 * De kale tegel: glazuur, spikkels, craquelé en een afgeschuinde rand.
 * Dit verandert nooit, dus we tekenen het één keer per formaat en cachen het.
 */
import { mulberry32, roundRect } from "../utils.js";

const cache = new Map();
const MAX_CACHE = 6;

export function getGlazedTile(w) {
  if (!cache.has(w)) {
    if (cache.size >= MAX_CACHE) cache.clear();
    cache.set(w, paintGlazedTile(w));
  }
  return cache.get(w);
}

function paintGlazedTile(w) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = w;
  const ctx = canvas.getContext("2d");
  const radius = w * 0.022;
  const rnd = mulberry32(11);

  ctx.save();
  roundRect(ctx, 0, 0, w, w, radius);
  ctx.clip();
  paintGlaze(ctx, w);
  paintSpeckles(ctx, w, rnd);
  paintCrackle(ctx, w, rnd);
  paintBevel(ctx, w);
  ctx.restore();

  ctx.strokeStyle = "rgba(110,95,70,.4)";
  ctx.lineWidth = w * 0.003;
  roundRect(ctx, w * 0.0015, w * 0.0015, w - w * 0.003, w - w * 0.003, radius);
  ctx.stroke();
  return canvas;
}

function paintGlaze(ctx, w) {
  const g = ctx.createRadialGradient(w * 0.42, w * 0.38, w * 0.05, w * 0.5, w * 0.5, w * 0.8);
  g.addColorStop(0, "#FDFCF8");
  g.addColorStop(0.62, "#F5F1E6");
  g.addColorStop(1, "#E2D9C4");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, w);
}

function paintSpeckles(ctx, w, rnd) {
  for (let i = 0; i < 460; i++) {
    ctx.fillStyle = `rgba(120,105,80,${(0.05 + rnd() * 0.13).toFixed(3)})`;
    const size = w * (0.0007 + rnd() * 0.0022);
    ctx.beginPath();
    ctx.arc(rnd() * w, rnd() * w, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function paintCrackle(ctx, w, rnd) {
  ctx.lineWidth = Math.max(0.6, w * 0.0011);
  ctx.lineJoin = "round";
  for (let i = 0; i < 36; i++) {
    let x = rnd() * w;
    let y = rnd() * w;
    let angle = rnd() * Math.PI * 2;
    ctx.strokeStyle = `rgba(125,112,88,${(0.06 + rnd() * 0.09).toFixed(3)})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    const segments = 5 + Math.floor(rnd() * 9);
    for (let k = 0; k < segments; k++) {
      angle += (rnd() - 0.5) * 1.3;
      const length = w * (0.015 + rnd() * 0.035);
      x += Math.cos(angle) * length;
      y += Math.sin(angle) * length;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

/** Licht aan de boven- en linkerkant, schaduw rechts en onder. */
function paintBevel(ctx, w) {
  const e = w * 0.04;
  const edges = [
    { from: [0, 0, 0, e], rect: [0, 0, w, e], color: "255,255,255", alpha: 0.95 },
    { from: [0, 0, e, 0], rect: [0, 0, e, w], color: "255,255,255", alpha: 0.8 },
    { from: [0, w, 0, w - e], rect: [0, w - e, w, e], color: "105,90,65", alpha: 0.38 },
    { from: [w, 0, w - e, 0], rect: [w - e, 0, e, w], color: "105,90,65", alpha: 0.3 },
  ];
  for (const edge of edges) {
    const g = ctx.createLinearGradient(...edge.from);
    g.addColorStop(0, `rgba(${edge.color},${edge.alpha})`);
    g.addColorStop(1, `rgba(${edge.color},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(...edge.rect);
  }
}
