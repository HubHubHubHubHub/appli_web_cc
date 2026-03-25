import { firstPair, getVariantIndex } from "./parsing.js";
import { getLemmaEntry } from "./dataAccess.js";
import { addAccentHTML } from "./accent.js";
import { labelCategory, labelTense, labelNumber } from "./i18n.js";
import { classesToColors } from "./colors.js";

/**
 * Build the HTML content for a hover bubble tooltip.
 * @param {object} wd - wordData store value
 * @param {string} word - lemma
 * @param {string} category - grammatical category
 * @param {string[]} dataInfo - full parsed data-info tokens
 * @returns {string} HTML string
 */
export function buildBubbleHTML(wd, word, category, dataInfo) {
  const tokens = dataInfo.slice(1);
  const filtered = tokens.filter((t) => t !== "cas" && t !== "base");

  if (category === "nom") {
    const g = wd?.nom?.[word]?.genre;
    if (g) filtered.splice(1, 0, g);
  }

  if (filtered.length) {
    filtered[0] = labelCategory(filtered[0]);
    for (let i = 1; i < filtered.length; i++) {
      filtered[i] = labelTense(filtered[i]);
      filtered[i] = labelNumber(filtered[i]);
    }
  }

  const variantIndex = getVariantIndex(dataInfo);
  const lemmaEntry = getLemmaEntry(wd, category, word);
  const pair = firstPair(lemmaEntry, variantIndex);

  if (pair) {
    const [mot, pos] = pair;
    const accented = addAccentHTML(mot, pos);
    return `<strong>${accented}</strong>${filtered.length ? " &nbsp;<em>" + filtered.join(", ") + "</em>" : ""}`;
  }
  return filtered.length ? `<em>${filtered.join(", ")}</em>` : "";
}

/**
 * Position a bubble element above an anchor element.
 * @param {HTMLElement} bubble - the bubble DOM element
 * @param {HTMLElement} anchor - the element to position above
 */
export function positionBubble(bubble, anchor) {
  const rect = anchor.getBoundingClientRect();
  const bubbleRect = bubble.getBoundingClientRect();
  const top = window.scrollY + rect.top - bubbleRect.height - 8;
  const left = window.scrollX + rect.left + (rect.width - bubbleRect.width) / 2;
  bubble.style.top = `${Math.max(window.scrollY + 4, top)}px`;
  bubble.style.left = `${Math.max(window.scrollX + 4, left)}px`;
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
 * Determine the hover color for a word based on its data-info tokens.
 * @param {string[]} tokens - parsed data-info tokens
 * @returns {string} CSS color value
 */
export function getHoverColor(tokens) {
  for (const [className, color] of Object.entries(classesToColors)) {
    if (tokens.includes(className)) return color;
  }
  return "inherit";
}
