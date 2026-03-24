export { i18n, labelCategory, labelTense, labelNumber } from "./i18n.js";
export { addAccent, highlightLetter } from "./accent.js";
export {
  parseInfo,
  toPairs,
  firstPair,
  firstText,
  firstAccent,
  getVariantIndex,
} from "./parsing.js";
export { getDataFromJson, getPrincipalForm } from "./dataAccess.js";
export { classesToColors } from "./colors.js";
export { generateVerbForms } from "./gramFunc.js";
export { filterPhrases } from "./phrases.js";
export {
  renderCell,
  generateTableNoun,
  generateTableProper,
  generateTableAdj,
  generateTableVerb,
} from "./tableGeneration.js";
