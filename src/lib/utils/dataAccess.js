import { addAccent } from './accent.js';
import { firstPair } from './parsing.js';

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
      if (tag === "conj")
        return wordData?.verb?.[word]?.conj?.[tense]?.[person]?.[number] || null;
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
 * Rend la "forme principale" (avec accent) selon la catégorie.
 */
export function getPrincipalForm(wordData, word, category) {
  try {
    switch (category) {
      case "nom": {
        const entry = wordData?.nom?.[word];
        const p = firstPair(entry?.cas?.nomi?.s);
        if (p) return addAccent(p[0], p[1]);
        break;
      }
      case "adj":
      case "card":
      case "proposs":
      case "pron": {
        const entry = wordData?.[category]?.[word];
        const p = firstPair(entry?.cas?.nomi?.m);
        if (p) return addAccent(p[0], p[1]);
        break;
      }
      case "proper": {
        const entry = wordData?.proper?.[word];
        const p = firstPair(entry?.cas?.nomi);
        if (p) return addAccent(p[0], p[1]);
        break;
      }
      case "verb": {
        const entry = wordData?.verb?.[word];
        const p = firstPair(entry?.inf);
        if (p) return addAccent(p[0], p[1]);
        break;
      }
      default:
        break;
    }
  } catch (_) {}
  return word || "";
}
