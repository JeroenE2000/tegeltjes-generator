/** Centrale instellingen: verfkleuren, lettertypes, spreuken en animaties. */

export const INKS = {
  blauw: "#1F3D92",
  mangaan: "#5A3550",
  groen: "#2D5E46",
  rood: "#9A2E25",
};

/** f = CSS-fontstack, lh = regelhoogte, scale = startgrootte ten opzichte van klassiek. */
export const FONTS = {
  klassiek: { f: '"IM Fell English", Georgia, serif', lh: 1.12, scale: 1 },
  sierlijk: { f: '"Pinyon Script", "Brush Script MT", cursive', lh: 1.28, scale: 1.12 },
  hand: { f: 'Caveat, "Comic Sans MS", cursive', lh: 1.02, scale: 1.15 },
  gotisch: { f: 'UnifrakturMaguntia, "Old English Text MT", serif', lh: 1.14, scale: 1 },
};

export const CAPTION_FONT = '"IM Fell English", Georgia, serif';

export const SAYINGS = [
  "Oost west,\nthuis best",
  "Doe maar gewoon, dan doe je al gek genoeg",
  "Haastige spoed is zelden goed",
  "Beter een goede buur dan een verre vriend",
  "Achter de wolken schijnt de zon",
  "Na regen komt zonneschijn",
  "Waar een wil is, is een weg",
  "Wie dit leest is gek",
  "Gezelligheid kent geen tijd",
  "Liever lui dan moe",
  "Eerst koffie,\ndan praten",
  "Ook dit gaat voorbij",
  "Geen gezeur, koffie door de deur",
  "Wie het kleine niet eert, is het grote niet weerd",
  "Ik heb hier niet voor gestudeerd",
  "Elk nadeel heb z’n voordeel",
  "Zo de ouden zongen, piepen de jongen",
  "Wat de boer niet kent, dat eet hij niet",
];

/** T = duur van één loop in seconden, fps = frames per seconde in de gif. */
export const ANIMATIONS = {
  schrijven: { T: 3.6, fps: 10 },
  glans: { T: 2.4, fps: 12 },
  wiebel: { T: 1.6, fps: 15 },
};

export const EXPORT_SIZE = { png: 1200, gif: 480 };
