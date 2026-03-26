import { addAccentHTML } from "./accent.js";

/**
 * Découpe une chaîne data-info en tokens séparés par des points-virgules.
 * @param {string} info - Chaîne data-info (ex: "балкон;nom;cas;nomi;s")
 * @returns {string[]} Tableau de tokens
 */
export function parseInfo(info) {
  return info.split(";");
}

/**
 * Normalise une entrée de données en tableau de paires [texte, positionAccent].
 * En V2, toutes les formes sont déjà au format [["forme", accent], ...].
 * @param {Array|null} entry - Entrée du JSON (liste de paires)
 * @returns {Array<[string, number]>} Tableau de paires normalisées
 */
export function toPairs(entry) {
  if (!entry || !Array.isArray(entry) || entry.length === 0) return [];
  // V2 : toujours [["forme", accent], ...]
  if (Array.isArray(entry[0])) return entry;
  // Fallback V1 : paire plate ["forme", accent] → [["forme", accent]]
  if (typeof entry[0] === "string" && Number.isInteger(entry[1])) {
    return [entry];
  }
  return [];
}

/**
 * Retourne la première paire [texte, accent] d'une entrée, en tenant compte de l'index de variante.
 * @param {Array|null} entry - Entrée brute du JSON
 * @param {number} [variantIndex=0] - Index de la variante souhaitée
 * @returns {[string, number]|null} Paire [texte, positionAccent] ou null
 */
export function firstPair(entry, variantIndex = 0) {
  const pairs = toPairs(entry);
  if (!pairs.length) return null;
  for (let i = variantIndex; i < pairs.length; i++) {
    const [t, p] = pairs[i] || [];
    if (typeof t === "string" && t) return [t, p];
  }
  return pairs[variantIndex] || null;
}

/**
 * Retourne le texte de la première paire d'une entrée.
 * @param {Array|null} entry - Entrée brute du JSON
 * @param {number} [variantIndex=0] - Index de la variante
 * @returns {string} Texte ou chaîne vide
 */
export function firstText(entry, variantIndex = 0) {
  const p = firstPair(entry, variantIndex);
  return p && p[0] ? p[0] : "";
}

/**
 * Retourne la position d'accent de la première paire d'une entrée.
 * @param {Array|null} entry - Entrée brute du JSON
 * @param {number} [variantIndex=0] - Index de la variante
 * @returns {number} Position d'accent (1-based) ou -1 si absente
 */
export function firstAccent(entry, variantIndex = 0) {
  const p = firstPair(entry, variantIndex);
  return p && Number.isInteger(p[1]) ? p[1] : -1;
}

/**
 * Extrait l'index de variante d'un tableau de tokens data-info.
 * Cherche un token au format "var=N" et retourne N (ou 0 par défaut).
 * @param {string[]} dataInfoTokens - Tokens issus de parseInfo
 * @returns {number} Index de variante (0-based)
 */
export function getVariantIndex(dataInfoTokens) {
  const t = dataInfoTokens.find((s) => /^var=\d+$/.test(s));
  return t ? parseInt(t.split("=")[1], 10) : 0;
}

/**
 * Rendu simplifié d'une entrée : retourne la forme principale avec accent.
 * @param {Array|null} entry - Entrée brute du JSON
 * @returns {string} Texte accentué ou chaîne vide
 */
export function renderCellSimple(entry) {
  if (!entry) return "";
  const pair = firstPair(entry);
  return pair ? addAccentHTML(pair[0], pair[1]) : "";
}
