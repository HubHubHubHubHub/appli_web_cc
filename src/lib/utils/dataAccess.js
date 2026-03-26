import { addAccentHTML } from "./accent.js";
import { firstPair } from "./parsing.js";

/**
 * Parse un data-info V2 en objet clé=valeur.
 * @param {string} raw - Chaîne data-info (ex: "машина;pos=noun;case=acc;number=sg")
 * @returns {{ lemma: string, pos?: string, [key: string]: string }}
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
 * Récupère les données depuis le JSON V2 pour un mot donné.
 * Résout le chemin dans data.json selon le pos et les traits du tag.
 * @param {object} wordData - L'objet wordData complet (V2)
 * @param {string} pos - La catégorie pos (noun, verb, adj, pron, num, adv, prep, conj, part)
 * @param {string[]} infos - Les tokens restants du data-info V2 (clé=valeur parsés ou bruts)
 */
export function getDataFromJson(wordData, pos, infos) {
  // Accepter à la fois l'ancien format (tableau de tokens positionnels)
  // et le nouveau format (objet tag V2 via parseDataInfo)
  const tag = {};
  const word = infos[0];

  // Parser les tokens clé=valeur
  for (let i = 1; i < infos.length; i++) {
    const t = infos[i];
    const eq = t.indexOf("=");
    if (eq > 0) {
      tag[t.slice(0, eq)] = t.slice(eq + 1);
    }
  }

  const entry = wordData?.[pos]?.[word];
  if (!entry) return null;

  // Invariables
  if (["adv", "prep", "conj", "part", "intj", "pred", "insert"].includes(pos)) {
    return entry?.base || null;
  }

  // Verbe
  if (pos === "verb") {
    if (tag.verbForm === "inf") return entry?.inf || null;
    if (tag.tense === "past") return entry?.conj?.past?.[tag.gender]?.[tag.number] || null;
    if (tag.tense) return entry?.conj?.[tag.tense]?.[tag.person]?.[tag.number] || null;
    return null;
  }

  // Pronom (paradigme idiosyncratique — pas de sous-niveau genre)
  if (pos === "pron") {
    return entry?.cas?.[tag.case] || null;
  }

  // Nom (cas > case > number)
  if (pos === "noun") {
    return entry?.cas?.[tag.case]?.[tag.number] || null;
  }

  // Adj, num (cas > case > gender)
  return entry?.cas?.[tag.case]?.[tag.gender] || null;
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
    case "noun":
      return entry?.cas?.nom?.sg;
    case "adj":
    case "num":
      return entry?.cas?.nom?.m;
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
    console.warn(`getPrincipalForm: erreur pour "${word}" (${category}) :`, err);
  }
  return word || "";
}
