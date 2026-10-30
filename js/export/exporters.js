/** Maakt van een ontwerp een PNG- of GIF-bestand. */
import { ANIMATIONS, EXPORT_SIZE } from "../config.js";
import { fontsReady } from "../fonts.js";
import { frameAt } from "../tile/animation.js";
import { renderTile } from "../tile/render.js";
import { nextTick } from "../utils.js";
import { GifEncoder } from "./gif-encoder.js";

const CAPTURE_SHARE = 0.35; // deel van de voortgangsbalk voor het tekenen van frames

function createCanvas(size, options) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  return { canvas, ctx: canvas.getContext("2d", options) };
}

export async function createPng(design) {
  await fontsReady;
  const size = EXPORT_SIZE.png;
  const { canvas, ctx } = createCanvas(size);
  renderTile(ctx, size, design, {}, { background: true });
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("PNG maken mislukt"))), "image/png")
  );
}

export async function createGif(design, onProgress = () => {}) {
  await fontsReady;
  const size = EXPORT_SIZE.gif;
  const { T, fps } = ANIMATIONS[design.anim];
  const frameCount = Math.round(T * fps);
  const delay = Math.round(100 / fps);
  const { ctx } = createCanvas(size, { willReadFrequently: true });
  const encoder = new GifEncoder(size, size);

  for (let i = 0; i < frameCount; i++) {
    renderTile(ctx, size, design, frameAt(design.anim, i / frameCount), { background: true });
    encoder.addFrame(ctx.getImageData(0, 0, size, size).data, delay);
    if (i % 3 === 0) {
      onProgress((i / frameCount) * CAPTURE_SHARE);
      await nextTick();
    }
  }
  return encoder.finish((p) => onProgress(CAPTURE_SHARE + p * (1 - CAPTURE_SHARE)));
}
