/**
 * Registre central des groupes sidebar.
 * Le regroupement est syntaxique (meta.syntax), pas morphologique (meta.pos).
 * Exemple : les possessifs sont pos=adj mais apparaissent sous Pronoms.
 */

/**
 * @typedef {Object} SidebarGroup
 * @property {string} key - Identifiant unique du groupe
 * @property {string} label - Label affiché en français
 * @property {(meta: object) => boolean} filter - Filtre sur meta de l'entrée
 * @property {SidebarGroup[]} [subgroups] - Sous-groupes optionnels
 */

/** @type {SidebarGroup[]} */
export const sidebarGroups = [
  { key: "noun", label: "Noms", filter: (meta) => meta.pos === "noun" },
  {
    key: "adj_qual",
    label: "Adjectifs",
    filter: (meta) => meta.pos === "adj" && !meta.syntax,
  },
  {
    key: "pronoun",
    label: "Pronoms",
    subgroups: [
      {
        key: "pron_pers",
        label: "Personnels",
        filter: (meta) => meta.syntax === "pron_pers",
        flat: true,
        order: ["я", "ти", "він", "вона", "воно", "ми", "ви", "вони"],
      },
      {
        key: "pron_poss",
        label: "Possessifs",
        filter: (meta) => meta.syntax === "pron_poss",
        flat: true,
        order: ["мій", "твій", "його", "її", "наш", "ваш", "свій", "їхній", "їх"],
      },
      {
        key: "pron_dem",
        label: "Démonstratifs",
        filter: (meta) => meta.syntax === "pron_dem",
        flat: true,
        order: [
          "цей",
          "той",
          "такий",
          "оцей",
          "отой",
          "отакий",
          "сей",
          "тотой",
          "оний",
          "такенний",
          "такісінький",
        ],
      },
      {
        key: "pron_inter",
        label: "Interrogatifs",
        filter: (meta) => meta.syntax === "pron_inter",
        flat: true,
        order: ["хто", "що", "який", "чий", "котрий", "скільки"],
      },
      {
        key: "pron_refl",
        label: "Réfléchi",
        filter: (meta) => meta.syntax === "pron_refl",
        flat: true,
        order: ["себе"],
      },
      {
        key: "pron_neg",
        label: "Négatifs",
        filter: (meta) => meta.syntax === "pron_neg",
        flat: true,
        order: ["жодний", "ніякий", "нічий", "нікотрий", "аніякий", "ніякісінький"],
      },
      {
        key: "pron_rel",
        label: "Relatifs",
        filter: (meta) => meta.syntax === "pron_rel",
        flat: true,
      },
      {
        key: "pron_tot",
        label: "Totalisants",
        filter: (meta) => meta.syntax === "pron_tot",
        flat: true,
      },
      {
        key: "pron_emph",
        label: "Emphatiques",
        filter: (meta) => meta.syntax === "pron_emph",
        flat: true,
      },
      {
        key: "pron_indef",
        label: "Indéfinis",
        filter: (meta) => meta.syntax === "pron_indef",
        // Pas flat — trop nombreux (40+), regroupement alphabétique
      },
    ],
  },
  { key: "verb", label: "Verbes", filter: (meta) => meta.pos === "verb" },
  { key: "num", label: "Numéraux", filter: (meta) => meta.pos === "num" },
  { key: "adv", label: "Adverbes", filter: (meta) => meta.pos === "adv" },
  {
    key: "invariable",
    label: "Mots invariables",
    subgroups: [
      { key: "prep", label: "Prépositions", filter: (meta) => meta.pos === "prep" },
      { key: "conj", label: "Conjonctions", filter: (meta) => meta.pos === "conj" },
      { key: "part", label: "Particules", filter: (meta) => meta.pos === "part" },
      { key: "intj", label: "Interjections", filter: (meta) => meta.pos === "intj" },
      { key: "pred", label: "Prédicatifs", filter: (meta) => meta.pos === "pred" },
      { key: "insert", label: "Parenthétiques", filter: (meta) => meta.pos === "insert" },
    ],
  },
];

/**
 * Collecte tous les mots de wordData qui matchent un filtre.
 * Retourne un tableau de { lemma, pos } pour chaque mot matché.
 * @param {object} wordData - data.json V2
 * @param {(meta: object) => boolean} filter - Filtre sur meta
 * @returns {string[]} Liste de lemmes
 */
export function collectWords(wordData, filter) {
  const words = [];
  for (const [pos, entries] of Object.entries(wordData)) {
    if (!entries || typeof entries !== "object") continue;
    for (const [lemma, entry] of Object.entries(entries)) {
      const meta = entry?.meta;
      if (meta && filter(meta)) {
        words.push(lemma);
      }
    }
  }
  return words;
}

/**
 * Retourne le groupe sidebar (key) pour un meta donné.
 * @param {object} meta - Bloc meta d'une entrée
 * @returns {string|null} Clé du groupe ou null
 */
export function getSidebarGroup(meta) {
  for (const group of sidebarGroups) {
    if (group.subgroups) {
      for (const sub of group.subgroups) {
        if (sub.filter(meta)) return sub.key;
      }
    } else if (group.filter(meta)) {
      return group.key;
    }
  }
  return null;
}
