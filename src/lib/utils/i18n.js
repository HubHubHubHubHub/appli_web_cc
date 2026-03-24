export const i18n = {
  category: {
    verb: "verbe",
    adj: "adj.",
    proposs: "pron. pos.",
    proper: "pron. per.",
    nom: "nom",
    card: "card.",
    conj: "conj.",
    adv: "adv.",
    part: "part.",
  },
  tense: {
    fut: "fut.",
    pres: "prés.",
    pass: "pass.",
    imp: "imp.",
    inf: "inf.",
  },
  tenseLabel: {
    fut: "Futur",
    pres: "Présent",
    pass: "Passé",
    imp: "Impératif",
  },
  number: {
    s: "sg",
    pl: "pl",
  },
  case: {
    nomi: "nom.",
    gen: "gén.",
    dat: "dat.",
    acc: "acc.",
    ins: "ins.",
    loc: "loc.",
    voc: "voc.",
  },
  gender: {
    m: "masc.",
    f: "fém.",
    n: "neutre",
    pl: "plur.",
  },
  person: {
    "1p": "1<sup>re</sup> p.",
    "2p": "2<sup>e</sup> p.",
    "3p": "3<sup>e</sup> p.",
    m: "masc.",
    f: "fém.",
    n: "neutre",
  },
};

/** @param {string} cat - Clé catégorie @returns {string} Label français */
export function labelCategory(cat) {
  return i18n.category[cat] || cat;
}
/** @param {string} t - Clé temps @returns {string} Abréviation française */
export function labelTense(t) {
  return i18n.tense[t] || t;
}
/** @param {string} t - Clé temps @returns {string} Label complet français */
export function labelTenseLabel(t) {
  return i18n.tenseLabel[t] || t;
}
/** @param {string} n - Clé nombre (s/pl) @returns {string} Abréviation française */
export function labelNumber(n) {
  return i18n.number[n] || n;
}
/** @param {string} c - Clé cas @returns {string} Abréviation française */
export function labelCase(c) {
  return i18n.case[c] || c;
}
/** @param {string} g - Clé genre @returns {string} Label français */
export function labelGender(g) {
  return i18n.gender[g] || g;
}
/** @param {string} p - Clé personne @returns {string} Label français (HTML) */
export function labelPerson(p) {
  return i18n.person[p] || p;
}
