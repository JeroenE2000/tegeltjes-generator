/** Koppelt het formulier aan het voorbeeld en de opslaan/delen-knoppen. */
import { SAYINGS } from "./config.js";
import { createGif, createPng } from "./export/exporters.js";
import { canShareFiles, saveFile, shareFile } from "./export/share.js";
import { fontsReady } from "./fonts.js";
import { createPreview } from "./preview.js";
import { clearTextCache } from "./tile/text.js";
import { slugify } from "./utils.js";

const $ = (id) => document.getElementById(id);
const form = $("controls");
const textInput = $("text");
const counter = $("count");
const saveButton = $("saveBtn");
const shareButton = $("shareBtn");
const statusLine = $("status");
const animationRow = $("animRow");
const canvas = $("tile");

const preview = createPreview(canvas);
let design = readDesign();

/* ---------- ontwerp ---------- */

function readDesign() {
  const data = new FormData(form);
  return {
    text: data.get("text") || "",
    caption: data.get("caption") || "",
    font: data.get("font"),
    color: data.get("color"),
    motif: data.get("motif"),
    corner: data.get("corner"),
    border: data.get("border") === "on",
    format: data.get("format"),
    anim: data.get("anim"),
  };
}

function updateControls() {
  counter.textContent = `${textInput.value.length} / ${textInput.maxLength}`;
  animationRow.classList.toggle("hidden", design.format !== "gif");
  saveButton.textContent = design.format === "gif" ? "Gif opslaan" : "Foto opslaan";
  canvas.setAttribute("aria-label", `Voorbeeld van je tegeltje: ${design.text.trim() || "zonder tekst"}`);
}

function applyChanges() {
  const previous = design;
  design = readDesign();
  updateControls();
  const restartAnimation = design.anim !== previous.anim || design.format !== previous.format;
  preview.update(design, { restartAnimation });
}

function pickRandomSaying() {
  const options = SAYINGS.filter((saying) => saying !== textInput.value);
  textInput.value = options[Math.floor(Math.random() * options.length)];
  design = readDesign();
  updateControls();
  preview.update(design, { restartAnimation: true });
}

/* ---------- bestanden ---------- */

let lastExport = { key: null, blob: null };

async function buildFile() {
  const relevant = design.format === "gif" ? design : { ...design, anim: null };
  const key = JSON.stringify(relevant);
  if (lastExport.key !== key) {
    const blob =
      design.format === "gif"
        ? await createGif(design, (p) => setStatus(`Gif wordt gemaakt… ${Math.round(p * 100)}%`))
        : await createPng(design);
    lastExport = { key, blob };
  }
  return {
    blob: lastExport.blob,
    filename: `tegeltje-${slugify(design.text)}.${design.format === "gif" ? "gif" : "png"}`,
  };
}

const SAVE_MESSAGES = {
  saved: (name) => `Opgeslagen als ${name}. Stuur het bestand door via je favoriete app.`,
  declined: () => "Opslaan geannuleerd.",
  busy: () => "Er staat al een opslagvenster open. Probeer het zo nog eens.",
};

const SHARE_MESSAGES = {
  shared: "Gedeeld.",
  cancelled: "",
  failed: "Delen werkt niet in deze weergave. Sla het bestand op en stuur het zo door.",
};

async function withBusyButtons(task) {
  saveButton.disabled = true;
  shareButton.disabled = true;
  try {
    await task();
  } catch {
    setStatus("Het maken van het bestand mislukte. Probeer het nog een keer.");
  } finally {
    saveButton.disabled = false;
    shareButton.disabled = false;
  }
}

async function onSave() {
  await withBusyButtons(async () => {
    const { blob, filename } = await buildFile();
    const result = await saveFile(blob, filename);
    if (result === "manual") {
      setStatus("");
      showManualSave(blob);
    } else {
      setStatus(SAVE_MESSAGES[result](filename));
    }
  });
}

async function onShare() {
  await withBusyButtons(async () => {
    const { blob, filename } = await buildFile();
    setStatus("");
    setStatus(SHARE_MESSAGES[await shareFile(blob, filename)]);
  });
}

function setStatus(message) {
  statusLine.textContent = message;
}

/* ---------- handmatig opslaan (venster met de afbeelding) ---------- */

const dialog = $("fallback");
const dialogImage = $("fallbackImg");
let dialogUrl = null;

function showManualSave(blob) {
  if (dialogUrl) URL.revokeObjectURL(dialogUrl);
  dialogUrl = URL.createObjectURL(blob);
  dialogImage.src = dialogUrl;
  dialog.classList.remove("hidden");
  $("fallbackClose").focus();
}

function closeManualSave() {
  dialog.classList.add("hidden");
}

/* ---------- opstarten ---------- */

form.addEventListener("input", applyChanges);
form.addEventListener("submit", (event) => event.preventDefault());
$("randomBtn").addEventListener("click", pickRandomSaying);
saveButton.addEventListener("click", onSave);
shareButton.addEventListener("click", onShare);
$("fallbackClose").addEventListener("click", closeManualSave);
dialog.addEventListener("click", (event) => event.target === dialog && closeManualSave());
document.addEventListener("keydown", (event) => event.key === "Escape" && closeManualSave());

if (canShareFiles()) shareButton.classList.remove("hidden");

fontsReady.then(() => {
  clearTextCache();
  preview.refresh();
});

updateControls();
preview.update(design);
