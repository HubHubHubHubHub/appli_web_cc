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
    inf: "inf."
  },
  tenseLabel: {
    fut: "Futur",
    pres: "Présent",
    pass: "Passé",
    imp: "Impératif",
  },
  number: {
    s: "sg",
    pl: "pl"
  },
  case: {
    nomi: "nominatif",
    gen: "génitif",
    dat: "datif",
    acc: "accusatif",
    ins: "instrumental",
    loc: "locatif",
    voc: "vocatif",
  },
  gender: {
    m: "masc.",
    f: "fém.",
    n: "neutre",
    pl: "plur.",
  },
  person: {
    "1p": "1re pers.",
    "2p": "2e pers.",
    "3p": "3e pers.",
    m: "masc.",
    f: "fém.",
    n: "neutre",
  },
};

export function labelCategory(cat) { return i18n.category[cat] || cat; }
export function labelTense(t) { return i18n.tense[t] || t; }
export function labelTenseLabel(t) { return i18n.tenseLabel[t] || t; }
export function labelNumber(n) { return i18n.number[n] || n; }
export function labelCase(c) { return i18n.case[c] || c; }
export function labelGender(g) { return i18n.gender[g] || g; }
export function labelPerson(p) { return i18n.person[p] || p; }
