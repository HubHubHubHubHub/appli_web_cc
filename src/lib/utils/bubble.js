import { firstPair } from "./parsing.js";
import { getLemmaEntry } from "./dataAccess.js";
import { addAccentHTML } from "./accent.js";
import { labelCategory, labelTense, labelNumber } from "./i18n.js";
import { classesToColors, classesToColorsDark } from "./colors.js";

/**
 * Build the HTML content for a hover bubble tooltip.
 * @param {object} wd - wordData store value (V2)
 * @param {string} word - lemma
 * @param {string} pos - grammatical pos (V2)
 * @param {string[]} dataInfo - full parsed data-info tokens (V2 clé=valeur)
 * @returns {string} HTML string
 */
export function buildBubbleHTML(wd, word, pos, dataInfo) {
  // Parse V2 tokens into readable labels
  const labels = [];
  labels.push(labelCategory(pos));

  // Extract meaningful values from clé=valeur tokens
  for (let i = 1; i < dataInfo.length; i++) {
    const t = dataInfo[i];
    const eq = t.indexOf("=");
    if (eq > 0) {
      const val = t.slice(eq + 1);
      // Skip pos (already added), skip verbForm/adjType/pronType/numType for brevity
      const key = t.slice(0, eq);
      if (["case", "gender", "number", "person", "tense"].includes(key)) {
        let label = labelTense(val);
        label = labelNumber(label);
        labels.push(label);
      }
    }
  }

  // Add gender for nouns from meta
  if (pos === "noun") {
    const g = wd?.noun?.[word]?.meta?.gender;
    if (g && !labels.includes(g)) labels.splice(1, 0, g);
  }

  const variantIndex = dataInfo.find((t) => t.startsWith("var="))
    ? parseInt(dataInfo.find((t) => t.startsWith("var=")).split("=")[1], 10)
    : 0;
  const lemmaEntry = getLemmaEntry(wd, pos, word);
  const pair = firstPair(lemmaEntry, variantIndex);

  if (pair) {
    const [mot, p] = pair;
    const accented = addAccentHTML(mot, p);
    return `<strong>${accented}</strong>${labels.length ? " &nbsp;<em>" + labels.join(", ") + "</em>" : ""}`;
  }
  return labels.length ? `<em>${labels.join(", ")}</em>` : "";
}

/**
 * Position a bubble element above an anchor element.
 * @param {HTMLElement} bubble - the bubble DOM element
 * @param {HTMLElement} anchor - the element to position above
 */
export function positionBubble(bubble, anchor) {
  const rect = anchor.getBoundingClientRect();
  const bubbleRect = bubble.getBoundingClientRect();
  const top = rect.top - bubbleRect.height - 8;
  const left = rect.left + (rect.width - bubbleRect.width) / 2;
  bubble.style.top = `${Math.max(4, top)}px`;
  bubble.style.left = `${Math.max(4, left)}px`;
}

/**
 * Get or create the singleton hover bubble element in document.body.
 * @returns {HTMLElement}
 */
export function getOrCreateBubble() {
  let b = document.getElementById("hover-info-bubble");
  if (!b) {
    b = document.createElement("div");
    b.id = "hover-info-bubble";
    b.className = "hover-bubble";
    b.style.display = "none";
    document.body.appendChild(b);
  }
  return b;
}

/**
 * Hide the singleton hover bubble.
 */
export function hideBubble() {
  const b = document.getElementById("hover-info-bubble");
  if (b) b.style.display = "none";
}

/**
 * Determine the hover color for a word based on its data-info tokens (V2).
 * Looks for case values in clé=valeur format.
 * @param {string[]} tokens - parsed data-info tokens (V2)
 * @returns {string} CSS color value
 */
export function getHoverColor(tokens) {
  const isDark = document.documentElement.getAttribute("data-theme") === "ukrvocab-dark";
  const palette = isDark ? classesToColorsDark : classesToColors;
  for (const t of tokens) {
    // V2 format: case=gen, case=acc, etc.
    const eq = t.indexOf("=");
    const val = eq > 0 ? t.slice(eq + 1) : t;
    if (val in palette) return palette[val];
  }
  return "inherit";
}
