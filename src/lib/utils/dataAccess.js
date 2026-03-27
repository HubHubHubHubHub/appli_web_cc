import { addAccentHTML } from "./accent.js";
import { firstPair } from "./parsing.js";

/**
 * @typedef {Object} MorphoTag
 * @property {string} lemma - Forme de citation
 * @property {string} [pos] - Catégorie (noun, verb, adj, pron, num, adv, prep, conj, part, intj, pred, insert)
 * @property {string} [case] - Cas (nom, gen, dat, acc, ins, loc, voc)
 * @property {string} [number] - Nombre (sg, pl)
 * @property {string} [gender] - Genre (m, f, n)
 * @property {string} [person] - Personne (1, 2, 3)
 * @property {string} [verbForm] - Forme verbale (fin, inf, imp, conv)
 * @property {string} [tense] - Temps (pres, past, fut)
 * @property {string} [var] - Index de variante (0-based)
 */

/**
 * Parse un data-info V2 en objet MorphoTag.
 * @param {string} raw - Chaîne data-info (ex: "машина;pos=noun;case=acc;number=sg")
 * @returns {MorphoTag}
 */
export function parseDataInfo(raw) {
  const [lemma, ...parts] = raw.split(";");
  const tag = { lemma };
  for (const p of parts) {
    const eq = p.indexOf("=");
    if (eq > 0) {
      tag[p.slice(0, eq)] = p.slice(eq + 1);
    }
  }
  return tag;
}

/**
 * Résout une forme fléchie dans data.json V2 à partir d'un MorphoTag.
 * @param {object} dataV2 - L'objet wordData complet (V2)
 * @param {MorphoTag} tag - Tag morphologique parsé
 * @returns {Array<[string, number]>|null} Liste de paires [forme, accent] ou null
 */
export function resolveEntry(dataV2, tag) {
  const entry = dataV2?.[tag.pos]?.[tag.lemma];
  if (!entry) return null;

  // Invariables
  if (["adv", "prep", "conj", "part", "intj", "pred", "insert"].includes(tag.pos)) {
    return entry?.base || null;
  }

  // Verbe
  if (tag.pos === "verb") {
    if (tag.verbForm === "inf") return entry?.inf || null;
    if (tag.tense === "past") return entry?.conj?.past?.[tag.gender]?.[tag.number] || null;
    if (tag.tense) return entry?.conj?.[tag.tense]?.[tag.person]?.[tag.number] || null;
    return null;
  }

  // Pronom (paradigme idiosyncratique — pas de sous-niveau genre)
  if (tag.pos === "pron") {
    return entry?.cas?.[tag.case] || null;
  }

  // Nom (cas > case > number)
  if (tag.pos === "noun") {
    return entry?.cas?.[tag.case]?.[tag.number] || null;
  }

  // Num : format variable (adj-like avec genre pour один/два, pronom-like sans genre pour три/скільки)
  if (tag.pos === "num") {
    const caseVal = entry?.cas?.[tag.case];
    if (!caseVal) return null;
    // Si la valeur est directement une liste de paires (format pronom) → retourner
    if (Array.isArray(caseVal) && (caseVal.length === 0 || Array.isArray(caseVal[0]))) {
      return caseVal;
    }
    // Sinon format adj-like (avec m/f/n/pl)
    const gk = tag.gender || (tag.number === "pl" ? "pl" : "m");
    return caseVal?.[gk] || null;
  }

  // Adj (cas > case > gender, avec "pl" comme clé genre pour le pluriel)
  const genderKey = tag.gender || (tag.number === "pl" ? "pl" : "m");
  return entry?.cas?.[tag.case]?.[genderKey] || null;
}

/**
 * Retourne l'entrée lemme (forme de citation) pour un mot donné.
 * @param {object} wordData - L'objet wordData complet (V2)
 * @param {string} pos - La catégorie pos V2
 * @param {string} word - Le mot (clé dans wordData)
 */
export function getLemmaEntry(wordData, pos, word) {
  const entry = wordData?.[pos]?.[word];
  if (!entry) return null;

  switch (pos) {
    case "noun": {
      const sg = entry?.cas?.nom?.sg;
      if (sg && firstPair(sg)?.[0] !== null) return sg;
      return entry?.cas?.nom?.pl || sg;
    }
    case "adj":
    case "num": {
      const m = entry?.cas?.nom?.m;
      if (m && firstPair(m)?.[0] !== null) return m;
      return entry?.cas?.nom?.pl || m;
    }
    case "pron":
      return entry?.cas?.nom;
    case "verb":
      return entry?.inf;
    case "adv":
    case "prep":
    case "conj":
    case "part":
    case "intj":
    case "pred":
    case "insert":
      return entry?.base;
    default:
      return null;
  }
}

/**
 * Rend la "forme principale" (avec accent) selon la catégorie.
 */
export function getPrincipalForm(wordData, word, category) {
  try {
    const entry = getLemmaEntry(wordData, category, word);
    const p = firstPair(entry);
    if (p) return addAccentHTML(p[0], p[1]);
  } catch (err) {
    if (import.meta.env.DEV) console.warn(`getPrincipalForm: erreur pour "${word}" (${category}) :`, err);
  }
  return word || "";
}
