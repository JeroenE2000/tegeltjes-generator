/**
 * Opslaan en delen van een gemaakt bestand.
 *
 * - Als losse website: gewone browserdownload.
 * - Binnen een Claude-artifact: via de downloads-capability van Claude
 *   (een gewone download werkt daar niet).
 * - Lukt geen van beide: "manual", dan toont de UI de afbeelding zodat
 *   je hem zelf kunt opslaan.
 */

let downloadsCapability;

function getClaudeDownloads() {
  if (downloadsCapability === undefined) {
    const claude = window.claude;
    downloadsCapability =
      claude && typeof claude.use === "function"
        ? claude.use("downloads").catch(() => null)
        : Promise.resolve(null);
  }
  return downloadsCapability;
}

/** @returns {Promise<"saved"|"declined"|"busy"|"manual">} */
export async function saveFile(blob, filename) {
  if (!window.claude) {
    browserDownload(blob, filename);
    return "saved";
  }
  const downloads = await getClaudeDownloads();
  if (!downloads) return "manual";
  try {
    await downloads.save({ filename, data: blob });
    return "saved";
  } catch (error) {
    if (error?.code === "declined") return "declined";
    if (error?.code === "rate_limited") return "busy";
    return "manual";
  }
}

function browserDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function canShareFiles() {
  try {
    const probe = new File([new Blob(["x"], { type: "image/png" })], "probe.png", { type: "image/png" });
    return Boolean(navigator.share && navigator.canShare?.({ files: [probe] }));
  } catch {
    return false;
  }
}

/** @returns {Promise<"shared"|"cancelled"|"failed">} */
export async function shareFile(blob, filename) {
  try {
    const file = new File([blob], filename, { type: blob.type });
    await navigator.share({ files: [file], title: "Tegeltje" });
    return "shared";
  } catch (error) {
    return error?.name === "AbortError" ? "cancelled" : "failed";
  }
}

// Alvast opvragen, zodat de eerste klik op "Opslaan" niet hoeft te wachten.
getClaudeDownloads();
