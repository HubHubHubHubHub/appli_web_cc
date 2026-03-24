import { firstText } from "./parsing.js";

const pronouns = {
  "1p": {
    s: '<span class="ukr" data-info="я;proper;cas;nomi">я</span>',
    pl: '<span class="ukr" data-info="ми;proper;cas;nomi">ми</span>',
  },
  "2p": {
    s: '<span class="ukr" data-info="ти;proper;cas;nomi">ти</span>',
    pl: '<span class="ukr" data-info="ви;proper;cas;nomi">ви</span>',
  },
  "3p": {
    s: '<span class="ukr" data-info="він;proper;cas;nomi">він</span>/<span class="ukr" data-info="вона;proper;cas;nomi">вона</span>/<span class="ukr" data-info="воно;proper;cas;nomi">воно</span>',
    pl: '<span class="ukr" data-info="вони;proper;cas;nomi">вони</span>',
  },
};

const pronounsPassed = {
  m: {
    s: '<span class="ukr" data-info="він;proper;cas;nomi">він</span>',
    pl: '<span class="ukr" data-info="ми;proper;cas;nomi">ми</span>',
  },
  f: {
    s: '<span class="ukr" data-info="вона;proper;cas;nomi">вона</span>',
    pl: '<span class="ukr" data-info="ви;proper;cas;nomi">ви</span>',
  },
  n: {
    s: '<span class="ukr" data-info="воно;proper;cas;nomi">воно</span>',
    pl: '<span class="ukr" data-info="вони;proper;cas;nomi">вони</span>',
  },
};

/**
 * Génère les formes verbales en HTML.
 * @param {object} wordData - L'objet wordData complet
 * @param {string} verb - Le verbe
 * @param {string} tense - Le temps
 * @param {string} fragment1 - Texte avant le verbe
 * @param {string} fragment2 - Texte après le verbe
 */
export function generateVerbForms(wordData, verb, tense, fragment1, fragment2) {
  let htmlContent = "";

  const verbData = wordData.verb?.[verb];
  if (!verbData?.conj?.[tense]) return "";

  const tenseData = verbData.conj[tense];

  if (tense === "pass") {
    for (const g of ["m", "f", "n"]) {
      const pd = tenseData[g];
      if (!pd) continue;

      if (pd.s) {
        const txt = firstText(pd.s);
        const dataInfo = `${verb};verb;conj;${tense};${g};s`;
        htmlContent += `<li>${fragment1} ${pronounsPassed[g].s} <span class="ukr" data-info="${dataInfo}">${txt}</span> ${fragment2}</li>\n`;
      }
      if (pd.pl) {
        const txt = firstText(pd.pl);
        const dataInfo = `${verb};verb;conj;${tense};${g};pl`;
        htmlContent += `<li>${fragment1} ${pronounsPassed[g].pl} <span class="ukr" data-info="${dataInfo}">${txt}</span> ${fragment2}</li>\n`;
      }
    }
    return htmlContent;
  }

  for (const p of ["1p", "2p", "3p"]) {
    const pd = tenseData[p];
    if (!pd) continue;

    if (pd.s) {
      const txt = firstText(pd.s);
      const dataInfo = `${verb};verb;conj;${tense};${p};s`;
      htmlContent += `<li>${fragment1} ${pronouns[p].s} <span class="ukr" data-info="${dataInfo}">${txt}</span> ${fragment2}</li>\n`;
    }
    if (pd.pl) {
      const txt = firstText(pd.pl);
      const dataInfo = `${verb};verb;conj;${tense};${p};pl`;
      htmlContent += `<li>${fragment1} ${pronouns[p].pl} <span class="ukr" data-info="${dataInfo}">${txt}</span> ${fragment2}</li>\n`;
    }
  }

  return htmlContent;
}
