export { i18n, labelCategory, labelTense, labelTenseLabel, labelNumber, labelCase, labelGender, labelPerson } from "./i18n.js";
export { addAccent, addAccentHTML, highlightLetter } from "./accent.js";
export { toPairs, firstPair, firstText, firstAccent, getVariantIndex } from "./parsing.js";
export { parseDataInfo, resolveEntry, getLemmaEntry, getPrincipalForm } from "./dataAccess.js";
export { classesToColors, classesToColorsDark } from "./colors.js";
export { generateVerbForms } from "./gramFunc.js";
export { filterPhrases } from "./phrases.js";
export {
  renderCell,
  generateTableNoun,
  generateTablePron,
  generateTableAdj,
  generateTableVerb,
} from "./tableGeneration.js";
