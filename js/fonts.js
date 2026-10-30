/** Wacht tot de webfonts geladen zijn, zodat canvas-tekst er meteen goed uitziet. */

const FONT_SPECS = [
  '48px "IM Fell English"',
  'italic 48px "IM Fell English"',
  '48px "Pinyon Script"',
  "48px Caveat",
  "48px UnifrakturMaguntia",
];

export const fontsReady = (async () => {
  try {
    await document.fonts.ready;
    await Promise.all(
      FONT_SPECS.map((spec) => document.fonts.load(spec, "Aa’ëé").catch(() => {}))
    );
  } catch {
    // Zonder webfonts tekenen we met de fallback-lettertypes.
  }
})();
