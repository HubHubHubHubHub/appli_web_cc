import { firstText } from "./parsing.js";

const pronouns = {
  1: {
    sg: '<span class="ukr" data-info="я;pos=pron;pronType=pers;case=nom">я</span>',
    pl: '<span class="ukr" data-info="ми;pos=pron;pronType=pers;case=nom">ми</span>',
  },
  2: {
    sg: '<span class="ukr" data-info="ти;pos=pron;pronType=pers;case=nom">ти</span>',
    pl: '<span class="ukr" data-info="ви;pos=pron;pronType=pers;case=nom">ви</span>',
  },
  3: {
    sg: '<span class="ukr" data-info="він;pos=pron;pronType=pers;case=nom">він</span>/<span class="ukr" data-info="вона;pos=pron;pronType=pers;case=nom">вона</span>/<span class="ukr" data-info="воно;pos=pron;pronType=pers;case=nom">воно</span>',
    pl: '<span class="ukr" data-info="вони;pos=pron;pronType=pers;case=nom">вони</span>',
  },
};

const pronounsPast = {
  m: {
    sg: '<span class="ukr" data-info="він;pos=pron;pronType=pers;case=nom">він</span>',
    pl: '<span class="ukr" data-info="ми;pos=pron;pronType=pers;case=nom">ми</span>',
  },
  f: {
    sg: '<span class="ukr" data-info="вона;pos=pron;pronType=pers;case=nom">вона</span>',
    pl: '<span class="ukr" data-info="ви;pos=pron;pronType=pers;case=nom">ви</span>',
  },
  n: {
    sg: '<span class="ukr" data-info="воно;pos=pron;pronType=pers;case=nom">воно</span>',
    pl: '<span class="ukr" data-info="вони;pos=pron;pronType=pers;case=nom">вони</span>',
  },
};

/**
 * Génère les formes verbales en HTML (V2).
 * @param {object} wordData - L'objet wordData complet
 * @param {string} verb - Le verbe
 * @param {string} tense - Le temps (pres, fut, past, imp)
 * @param {string} fragment1 - Texte avant le verbe
 * @param {string} fragment2 - Texte après le verbe
 */
export function generateVerbForms(wordData, verb, tense, fragment1, fragment2) {
  let htmlContent = "";

  const verbData = wordData.verb?.[verb];
  if (!verbData?.conj?.[tense]) return "";

  const tenseData = verbData.conj[tense];

  if (tense === "past") {
    for (const g of ["m", "f", "n"]) {
      const pd = tenseData[g];
      if (!pd) continue;

      if (pd.sg) {
        const txt = firstText(pd.sg);
        const dataInfo = `${verb};pos=verb;verbForm=fin;tense=past;gender=${g};number=sg`;
        htmlContent += `<li>${fragment1} ${pronounsPast[g].sg} <span class="ukr" data-info="${dataInfo}">${txt}</span> ${fragment2}</li>\n`;
      }
      if (pd.pl) {
        const txt = firstText(pd.pl);
        const dataInfo = `${verb};pos=verb;verbForm=fin;tense=past;gender=${g};number=pl`;
        htmlContent += `<li>${fragment1} ${pronounsPast[g].pl} <span class="ukr" data-info="${dataInfo}">${txt}</span> ${fragment2}</li>\n`;
      }
    }
    return htmlContent;
  }

  for (const p of ["1", "2", "3"]) {
    const pd = tenseData[p];
    if (!pd) continue;

    if (pd.sg) {
      const txt = firstText(pd.sg);
      const dataInfo = `${verb};pos=verb;verbForm=fin;tense=${tense};person=${p};number=sg`;
      htmlContent += `<li>${fragment1} ${pronouns[p].sg} <span class="ukr" data-info="${dataInfo}">${txt}</span> ${fragment2}</li>\n`;
    }
    if (pd.pl) {
      const txt = firstText(pd.pl);
      const dataInfo = `${verb};pos=verb;verbForm=fin;tense=${tense};person=${p};number=pl`;
      htmlContent += `<li>${fragment1} ${pronouns[p].pl} <span class="ukr" data-info="${dataInfo}">${txt}</span> ${fragment2}</li>\n`;
    }
  }

  return htmlContent;
}
