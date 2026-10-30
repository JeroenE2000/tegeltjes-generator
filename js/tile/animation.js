/** Vertaalt een animatietype en tijdstip (t = 0..1 binnen één loop) naar een frame voor renderTile. */

const WRITE_PORTION = 0.62; // deel van de loop waarin geschreven wordt; daarna blijft de tekst staan
const SHINE_PORTION = 0.7;
const WOBBLE_ANGLE = 0.06; // radialen, ongeveer 3,4 graden

export function frameAt(animation, t) {
  switch (animation) {
    case "schrijven":
      return { reveal: Math.min(1, t / WRITE_PORTION) };
    case "glans": {
      const progress = t / SHINE_PORTION;
      return progress <= 1 ? { shine: progress } : {};
    }
    case "wiebel":
      return { rotation: Math.sin(t * 2 * Math.PI) * WOBBLE_ANGLE };
    default:
      return {};
  }
}
