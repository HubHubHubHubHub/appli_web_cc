import { addAccent } from "./accent.js";
import { firstPair } from "./parsing.js";

/**
 * Récupère les données depuis le JSON pour un mot donné.
 * @param {object} wordData - L'objet wordData complet
 * @param {string} category - La catégorie grammaticale
 * @param {string[]} infos - Les tokens restants du data-info
 */
export function getDataFromJson(wordData, category, infos) {
  switch (category) {
    case "prep": {
      const [word, base] = infos;
      return wordData?.prep?.[word]?.[base] || null;
    }
    case "nom": {
      const [word, functionName, caseType, number] = infos;
      return wordData?.nom?.[word]?.[functionName]?.[caseType]?.[number] || null;
    }
    case "card":
    case "adj":
    case "proposs": {
      const [word, functionName, caseType, gender] = infos;
      return wordData?.[category]?.[word]?.[functionName]?.[caseType]?.[gender] || null;
    }
    case "pron": {
      const [word, functionName, caseType, gender] = infos;
      return wordData?.pron?.[word]?.[functionName]?.[caseType]?.[gender] || null;
    }
    case "proper": {
      const [word, functionName, caseType] = infos;
      return wordData?.proper?.[word]?.[functionName]?.[caseType] || null;
    }
    case "verb": {
      const [word, tag, tense, person, number] = infos;
      if (tag === "inf") return wordData?.verb?.[word]?.inf || null;
      if (tag === "imper") return wordData?.verb?.[word]?.imper?.[tense] || null;
      if (tag === "conj") return wordData?.verb?.[word]?.conj?.[tense]?.[person]?.[number] || null;
      return null;
    }
    case "adv": {
      const [word, degree] = infos;
      const key = degree || "base";
      return wordData?.adv?.[word]?.[key] || wordData?.adv?.[word]?.base || null;
    }
    case "conj": {
      const [word, degree] = infos;
      const key = degree || "base";
      return wordData?.conj?.[word]?.[key] || wordData?.conj?.[word]?.base || null;
    }
    case "part": {
      const [word, degree] = infos;
      const key = degree || "base";
      return wordData?.part?.[word]?.[key] || wordData?.part?.[word]?.base || null;
    }
    default:
      return null;
  }
}

/**
 * Retourne l'entrée lemme (forme de citation) pour un mot donné.
 * @param {object} wordData - L'objet wordData complet
 * @param {string} category - La catégorie grammaticale
 * @param {string} word - Le mot (clé dans wordData)
 */
export function getLemmaEntry(wordData, category, word) {
  switch (category) {
    case "nom":
      return wordData?.nom?.[word]?.cas?.nomi?.s;
    case "proposs":
    case "card":
    case "adj":
    case "pron":
      return wordData?.[category]?.[word]?.cas?.nomi?.m;
    case "proper":
      return wordData?.proper?.[word]?.cas?.nomi;
    case "verb":
      return wordData?.verb?.[word]?.inf;
    case "adv":
      return wordData?.adv?.[word]?.base;
    case "conj":
      return wordData?.conj?.[word]?.base;
    case "part":
      return wordData?.part?.[word]?.base;
    case "prep":
      return wordData?.prep?.[word]?.base;
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
    if (p) return addAccent(p[0], p[1]);
  } catch (err) {
    console.warn(`getPrincipalForm: erreur pour "${word}" (${category}) :`, err);
  }
  return word || "";
}
