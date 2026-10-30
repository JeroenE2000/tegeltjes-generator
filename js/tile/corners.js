/**
 * Hoekornamenten. Elke functie tekent één kwart, met de hoek op (0,0)
 * en de tegel in de richting +x/+y. drawCorners draait ze naar alle vier hoeken.
 */

const CORNER_STYLES = { ossenkop: drawOxHead, spin: drawSpider };

export function drawCorners(ctx, w, style, ink, wash) {
  const draw = CORNER_STYLES[style];
  if (!draw) return;
  const u = w * 0.15;
  const corners = [
    [0, 0],
    [w, 0],
    [w, w],
    [0, w],
  ];
  corners.forEach(([x, y], quarter) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((quarter * Math.PI) / 2);
    ctx.strokeStyle = ink;
    ctx.fillStyle = ink;
    draw(ctx, u, ink, wash);
    ctx.restore();
  });
}

function drawOxHead(ctx, u, ink, wash) {
  const quarter = Math.PI / 2;

  ctx.fillStyle = wash;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, u * 0.42, 0, quarter);
  ctx.closePath();
  ctx.fill();
  ctx.lineWidth = u * 0.035;
  ctx.beginPath();
  ctx.arc(0, 0, u * 0.42, 0, quarter);
  ctx.stroke();

  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, u * 0.2, 0, quarter);
  ctx.closePath();
  ctx.fill();

  // Middelste blad langs de diagonaal
  const d0 = u * 0.36;
  const d1 = u * 0.95;
  const k = u * 0.17;
  ctx.beginPath();
  ctx.moveTo(d0, d0);
  ctx.quadraticCurveTo(d0 + k * 1.6, d0 - k * 0.2, d1, d1);
  ctx.quadraticCurveTo(d0 - k * 0.2, d0 + k * 1.6, d0, d0);
  ctx.fill();

  // Zijbladen langs beide randen (de tweede is gespiegeld in de diagonaal)
  for (const mirrored of [false, true]) {
    ctx.save();
    if (mirrored) ctx.transform(0, 1, 1, 0, 0, 0);
    ctx.beginPath();
    ctx.moveTo(u * 0.46, u * 0.05);
    ctx.quadraticCurveTo(u * 0.8, u * 0.02, u * 1.08, u * 0.1);
    ctx.quadraticCurveTo(u * 0.78, u * 0.28, u * 0.46, u * 0.2);
    ctx.closePath();
    ctx.fillStyle = wash;
    ctx.fill();
    ctx.lineWidth = u * 0.03;
    ctx.stroke();
    dot(ctx, u * 1.16, u * 0.12, u * 0.04, ink);
    ctx.restore();
  }
  dot(ctx, d1 + u * 0.08, d1 + u * 0.08, u * 0.045, ink);
}

function drawSpider(ctx, u, ink) {
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, u * 0.17, 0, Math.PI / 2);
  ctx.closePath();
  ctx.fill();

  ctx.lineWidth = u * 0.035;
  [8, 26, 45, 64, 82].forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const length = u * (i === 2 ? 1.02 : 0.82);
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const endX = cos * length;
    const endY = sin * length;
    ctx.beginPath();
    ctx.moveTo(cos * u * 0.2, sin * u * 0.2);
    ctx.quadraticCurveTo(cos * length * 0.55 - sin * u * 0.1, sin * length * 0.55 + cos * u * 0.1, endX, endY);
    ctx.stroke();
    dot(ctx, endX, endY, u * 0.05, ink);
  });
}

function dot(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
