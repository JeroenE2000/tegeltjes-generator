/** Live voorbeeld op het grote canvas, inclusief de animatie als "gif" gekozen is. */
import { ANIMATIONS } from "./config.js";
import { frameAt } from "./tile/animation.js";
import { renderTile } from "./tile/render.js";

const MIN_SIZE = 300;
const MAX_SIZE = 1100;

export function createPreview(canvas) {
  const ctx = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let design = null;
  let size = 800;
  let running = false;
  let startTime = performance.now();

  const isAnimating = () => design?.format === "gif" && !reducedMotion.matches;

  function drawStill() {
    if (design) renderTile(ctx, size, design);
  }

  function loop(now) {
    if (!isAnimating()) {
      running = false;
      drawStill();
      return;
    }
    const duration = ANIMATIONS[design.anim].T * 1000;
    const t = ((now - startTime) % duration) / duration;
    renderTile(ctx, size, design, frameAt(design.anim, t));
    requestAnimationFrame(loop);
  }

  function refresh() {
    if (!isAnimating()) {
      drawStill();
    } else if (!running) {
      running = true;
      requestAnimationFrame(loop);
    }
  }

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const next = Math.max(MIN_SIZE, Math.min(MAX_SIZE, Math.round(canvas.clientWidth * dpr)));
    if (next !== canvas.width) canvas.width = canvas.height = next;
    size = next;
    refresh();
  }

  new ResizeObserver(resize).observe(canvas);
  reducedMotion.addEventListener?.("change", refresh);

  return {
    /** @param {object} next  nieuw ontwerp; restartAnimation laat de animatie opnieuw beginnen */
    update(next, { restartAnimation = false } = {}) {
      design = next;
      if (restartAnimation) startTime = performance.now();
      refresh();
    },
    refresh,
  };
}
