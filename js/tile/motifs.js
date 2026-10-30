/**
 * Plaatjes in Delfts-blauwe stijl. Elk motief tekent in een eenheidsvierkant
 * (0..1); drawMotif schaalt het naar de juiste plek op de tegel.
 */

const MOTIFS = { molen: drawWindmill, schip: drawShip, tulp: drawTulip, hart: drawHeart };

export function drawMotif(ctx, type, centerX, centerY, size, ink, wash) {
  const draw = MOTIFS[type];
  if (!draw) return;
  ctx.save();
  ctx.translate(centerX - size / 2, centerY - size / 2);
  ctx.scale(size, size);
  ctx.lineWidth = 0.022;
  ctx.strokeStyle = ink;
  ctx.fillStyle = wash;
  draw(ctx, ink, wash);
  ctx.restore();
}

function polygon(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for (const point of points.slice(1)) ctx.lineTo(...point);
  ctx.closePath();
}

function dot(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawWindmill(ctx, ink, wash) {
  // Grond met grassprietjes
  ctx.beginPath();
  ctx.moveTo(0.08, 0.93);
  ctx.bezierCurveTo(0.3, 0.88, 0.7, 0.98, 0.92, 0.92);
  ctx.stroke();
  ctx.lineWidth = 0.014;
  for (let i = 0; i < 7; i++) {
    const x = 0.14 + i * 0.12;
    ctx.beginPath();
    ctx.moveTo(x, 0.95);
    ctx.lineTo(x + 0.025, 0.9);
    ctx.stroke();
  }

  // Romp, deur, raampje en kap
  ctx.lineWidth = 0.022;
  polygon(ctx, [[0.39, 0.92], [0.61, 0.92], [0.565, 0.47], [0.435, 0.47]]);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.moveTo(0.47, 0.92);
  ctx.lineTo(0.47, 0.84);
  ctx.arc(0.5, 0.84, 0.03, Math.PI, 0);
  ctx.lineTo(0.53, 0.92);
  ctx.closePath();
  ctx.fill();
  dot(ctx, 0.5, 0.66, 0.025);
  ctx.beginPath();
  ctx.moveTo(0.42, 0.48);
  ctx.quadraticCurveTo(0.5, 0.32, 0.58, 0.48);
  ctx.closePath();
  ctx.fill();

  // Vier wieken met hekwerk
  const hubX = 0.5;
  const hubY = 0.42;
  const length = 0.37;
  const start = 0.1;
  for (let k = 0; k < 4; k++) {
    const a = 0.35 + (k * Math.PI) / 2;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const nx = -sin * 0.075;
    const ny = cos * 0.075;
    const at = (t) => [hubX + cos * t, hubY + sin * t];

    ctx.lineWidth = 0.022;
    ctx.beginPath();
    ctx.moveTo(hubX, hubY);
    ctx.lineTo(...at(length));
    ctx.stroke();

    const [sx, sy] = at(start);
    const [ex, ey] = at(length);
    polygon(ctx, [[sx, sy], [ex, ey], [ex + nx, ey + ny], [sx + nx, sy + ny]]);
    ctx.fillStyle = wash;
    ctx.fill();
    ctx.lineWidth = 0.014;
    ctx.stroke();
    for (let j = 1; j < 5; j++) {
      const [px, py] = at(start + ((length - start) * j) / 5);
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + nx, py + ny);
      ctx.stroke();
    }
  }
  ctx.fillStyle = ink;
  dot(ctx, hubX, hubY, 0.03);
}

function drawShip(ctx, ink, wash) {
  // Golven
  ctx.beginPath();
  ctx.moveTo(0.06, 0.88);
  for (let i = 0; i < 6; i++) ctx.quadraticCurveTo(0.06 + i * 0.15 + 0.075, 0.83, 0.06 + (i + 1) * 0.15, 0.88);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0.16, 0.95);
  for (let i = 0; i < 5; i++) ctx.quadraticCurveTo(0.16 + i * 0.14 + 0.07, 0.9, 0.16 + (i + 1) * 0.14, 0.95);
  ctx.lineWidth = 0.016;
  ctx.stroke();
  ctx.lineWidth = 0.022;

  // Romp en mast
  ctx.beginPath();
  ctx.moveTo(0.16, 0.7);
  ctx.lineTo(0.84, 0.7);
  ctx.quadraticCurveTo(0.78, 0.83, 0.68, 0.84);
  ctx.lineTo(0.32, 0.84);
  ctx.quadraticCurveTo(0.22, 0.83, 0.16, 0.7);
  ctx.closePath();
  ctx.fillStyle = ink;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0.5, 0.7);
  ctx.lineTo(0.5, 0.1);
  ctx.stroke();

  // Zeilen
  ctx.fillStyle = wash;
  ctx.beginPath();
  ctx.moveTo(0.53, 0.16);
  ctx.quadraticCurveTo(0.8, 0.36, 0.74, 0.64);
  ctx.lineTo(0.53, 0.64);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0.47, 0.22);
  ctx.lineTo(0.47, 0.64);
  ctx.lineTo(0.24, 0.64);
  ctx.quadraticCurveTo(0.3, 0.4, 0.47, 0.22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Vlaggetje en naden in het zeil
  ctx.fillStyle = ink;
  polygon(ctx, [[0.5, 0.1], [0.62, 0.13], [0.5, 0.16]]);
  ctx.fill();
  ctx.lineWidth = 0.012;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(0.56, 0.3 + i * 0.11);
    ctx.lineTo(0.7, 0.32 + i * 0.11);
    ctx.stroke();
  }
}

function drawTulip(ctx, ink, wash) {
  // Steel
  ctx.beginPath();
  ctx.moveTo(0.5, 0.95);
  ctx.quadraticCurveTo(0.47, 0.72, 0.5, 0.46);
  ctx.lineWidth = 0.03;
  ctx.stroke();
  ctx.lineWidth = 0.022;

  // Bladeren
  ctx.fillStyle = wash;
  ctx.beginPath();
  ctx.moveTo(0.49, 0.9);
  ctx.quadraticCurveTo(0.18, 0.78, 0.24, 0.5);
  ctx.quadraticCurveTo(0.4, 0.7, 0.49, 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0.51, 0.92);
  ctx.quadraticCurveTo(0.84, 0.82, 0.78, 0.56);
  ctx.quadraticCurveTo(0.62, 0.74, 0.51, 0.83);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bloem
  ctx.beginPath();
  ctx.moveTo(0.33, 0.22);
  ctx.quadraticCurveTo(0.31, 0.5, 0.5, 0.5);
  ctx.quadraticCurveTo(0.69, 0.5, 0.67, 0.22);
  ctx.lineTo(0.59, 0.31);
  ctx.lineTo(0.5, 0.12);
  ctx.lineTo(0.41, 0.31);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = ink;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.moveTo(0.41, 0.31);
  ctx.quadraticCurveTo(0.5, 0.48, 0.59, 0.31);
  ctx.lineTo(0.5, 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawHeart(ctx, ink) {
  const heartPath = () => {
    ctx.beginPath();
    ctx.moveTo(0.5, 0.86);
    ctx.bezierCurveTo(0.12, 0.6, 0.08, 0.3, 0.3, 0.2);
    ctx.bezierCurveTo(0.42, 0.15, 0.5, 0.24, 0.5, 0.32);
    ctx.bezierCurveTo(0.5, 0.24, 0.58, 0.15, 0.7, 0.2);
    ctx.bezierCurveTo(0.92, 0.3, 0.88, 0.6, 0.5, 0.86);
    ctx.closePath();
  };
  heartPath();
  ctx.fill();
  ctx.lineWidth = 0.03;
  ctx.stroke();

  ctx.save();
  ctx.translate(0.5, 0.5);
  ctx.scale(0.62, 0.62);
  ctx.translate(-0.5, -0.47);
  heartPath();
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = ink;
  for (const [x, y] of [[0.5, 0.06], [0.14, 0.12], [0.86, 0.12]]) dot(ctx, x, y, 0.025);
}
