/**
 * Tekent een complete tegel op een canvas: achtergrond, schaduw, glazuur,
 * beschildering (lijst, hoekjes, plaatje, tekst) en glans.
 */
import { CAPTION_FONT, FONTS, INKS } from "../config.js";
import { rgba, roundRect } from "../utils.js";
import { drawCorners } from "./corners.js";
import { getGlazedTile } from "./glaze.js";
import { drawMotif } from "./motifs.js";
import { fitText } from "./text.js";

const CORNER_RADIUS = 0.022;
const MARGIN = 0.085;

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} size              breedte/hoogte van het canvas in pixels
 * @param {object} design            keuzes uit het formulier
 * @param {object} [frame]           animatiestand: { reveal, shine, rotation }
 * @param {object} [options]         { background: true } voor exports
 */
export function renderTile(ctx, size, design, frame = {}, { background = false } = {}) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (background) paintBackground(ctx, size);
  else ctx.clearRect(0, 0, size, size);

  const w = Math.round(size * (1 - 2 * MARGIN));
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.rotate(frame.rotation || 0);
  ctx.translate(-w / 2, -w / 2);

  paintShadow(ctx, w);
  ctx.drawImage(getGlazedTile(w), 0, 0);

  ctx.save();
  roundRect(ctx, 0, 0, w, w, w * CORNER_RADIUS);
  ctx.clip();
  paintDecoration(ctx, w, design, frame.reveal ?? 1);
  paintGloss(ctx, w);
  if (frame.shine != null) paintShine(ctx, w, frame.shine);
  ctx.restore();

  ctx.restore();
}

function paintBackground(ctx, size) {
  const g = ctx.createLinearGradient(0, 0, size, size);
  g.addColorStop(0, "#EEF0EC");
  g.addColorStop(1, "#D5D9D2");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
}

function paintShadow(ctx, w) {
  ctx.save();
  ctx.shadowColor = "rgba(30,25,15,.32)";
  ctx.shadowBlur = w * 0.045;
  ctx.shadowOffsetY = w * 0.022;
  ctx.fillStyle = "#E6E0D0";
  roundRect(ctx, 0, 0, w, w, w * CORNER_RADIUS);
  ctx.fill();
  ctx.restore();
}

/** Alles wat met verf op de tegel staat. reveal (0..1) bepaalt hoeveel tekst al geschreven is. */
function paintDecoration(ctx, w, design, reveal) {
  const ink = INKS[design.color];
  const wash = rgba(ink, 0.3);
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // Een vleugje blur laat de verf iets uitlopen, zoals op echt glazuur.
  ctx.shadowColor = rgba(ink, 0.5);
  ctx.shadowBlur = Math.max(0.5, w * 0.0025);

  if (design.border) paintBorder(ctx, w);
  drawCorners(ctx, w, design.corner, ink, wash);

  const hasCorners = design.corner !== "geen";
  const padding = hasCorners ? w * 0.175 : design.border ? w * 0.12 : w * 0.1;
  const caption = design.caption.trim();
  const text = design.text.trim();
  const top = padding;
  const bottom = w - padding - (caption ? w * 0.055 : 0);

  let textTop = top;
  if (design.motif !== "geen") {
    const motifHeight = (bottom - top) * (text ? 0.4 : 1);
    drawMotif(ctx, design.motif, w / 2, top + motifHeight / 2, motifHeight * 0.96, ink, wash);
    textTop = top + motifHeight + w * 0.015;
  }

  if (text) {
    const maxWidth = w - 2 * padding - (hasCorners ? 0 : w * 0.02);
    paintText(ctx, w, text, FONTS[design.font], ink, maxWidth, textTop, bottom - textTop, reveal);
  }
  if (caption && reveal >= 1) paintCaption(ctx, w, caption, ink, bottom, padding);
  ctx.restore();
}

function paintBorder(ctx, w) {
  const outer = w * 0.055;
  ctx.lineWidth = w * 0.007;
  ctx.strokeRect(outer, outer, w - 2 * outer, w - 2 * outer);
  const inner = outer + w * 0.017;
  ctx.lineWidth = w * 0.0028;
  ctx.strokeRect(inner, inner, w - 2 * inner, w - 2 * inner);
}

function paintText(ctx, w, text, font, ink, maxWidth, top, height, reveal) {
  const { size, lines } = fitText(ctx, text, maxWidth, height, font);
  ctx.font = `${size}px ${font.f}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";

  const lineHeight = size * font.lh;
  const totalChars = lines.reduce((sum, line) => sum + line.length, 0);
  let charsLeft = Math.floor(reveal * totalChars + 1e-6);
  let y = top + (height - lines.length * lineHeight) / 2 + lineHeight / 2;

  for (const line of lines) {
    // Links uitlijnen vanaf de volle regelbreedte, zodat de tekst niet verschuift tijdens het "schrijven".
    const x = w / 2 - ctx.measureText(line).width / 2;
    const visible = line.slice(0, Math.max(0, charsLeft));
    charsLeft -= line.length;
    if (visible) {
      ctx.fillStyle = ink;
      ctx.globalAlpha = 0.94;
      ctx.fillText(visible, x, y);
      ctx.globalAlpha = 0.18;
      ctx.fillText(visible, x + w * 0.0012, y + w * 0.001);
      ctx.globalAlpha = 1;
    }
    y += lineHeight;
  }
}

function paintCaption(ctx, w, caption, ink, bottom, padding) {
  ctx.font = `italic ${w * 0.036}px ${CAPTION_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = ink;
  ctx.globalAlpha = 0.92;
  ctx.fillText(caption, w / 2, bottom + w * 0.032, w - 2 * padding);
  ctx.globalAlpha = 1;
}

function paintGloss(ctx, w) {
  const g = ctx.createLinearGradient(0, 0, w * 0.7, w * 0.7);
  g.addColorStop(0, "rgba(255,255,255,.28)");
  g.addColorStop(0.45, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, w);
}

/** Een lichtstreep die diagonaal over de tegel schuift (progress 0..1). */
function paintShine(ctx, w, progress) {
  const position = 0.08 + progress * 0.84;
  const strength = Math.sin(Math.PI * progress) * 0.75;
  const g = ctx.createLinearGradient(0, 0, w, w);
  g.addColorStop(Math.max(0, position - 0.08), "rgba(255,255,255,0)");
  g.addColorStop(position, `rgba(255,255,255,${strength.toFixed(3)})`);
  g.addColorStop(Math.min(1, position + 0.08), "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, w);
}
