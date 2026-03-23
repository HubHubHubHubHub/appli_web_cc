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
  number: {
    s: "sg",
    pl: "pl"
  }
};

export function labelCategory(cat) { return i18n.category[cat] || cat; }
export function labelTense(t) { return i18n.tense[t] || t; }
export function labelNumber(n) { return i18n.number[n] || n; }
