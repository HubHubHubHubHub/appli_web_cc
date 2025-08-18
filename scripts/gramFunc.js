let gramFunc = {
  // Fonction pour générer les formes verbales en HTML sans gérer les accents
  generateVerbForms: function (verb, tense, fragment1, fragment2) {
    let htmlContent = "";

    const pronouns = {
      "1p": { s: '<span class="ukr" data-info="я;proper;cas;nomi">я</span>',
              pl: '<span class="ukr" data-info="ми;proper;cas;nomi">ми</span>' },
      "2p": { s: '<span class="ukr" data-info="ти;proper;cas;nomi">ти</span>',
              pl: '<span class="ukr" data-info="ви;proper;cas;nomi">ви</span>' },
      "3p": { s: '<span class="ukr" data-info="він;proper;cas;nomi">він</span>/<span class="ukr" data-info="вона;proper;cas;nomi">вона</span>/<span class="ukr" data-info="воно;proper;cas;nomi">воно</span>',
              pl: '<span class="ukr" data-info="вони;proper;cas;nomi">вони</span>' },
    };

    const pronouns_passed = {
      m: { s: '<span class="ukr" data-info="він;proper;cas;nomi">він</span>',
          pl: '<span class="ukr" data-info="ми;proper;cas;nomi">ми</span>' },
      f: { s: '<span class="ukr" data-info="вона;proper;cas;nomi">вона</span>',
          pl: '<span class="ukr" data-info="ви;proper;cas;nomi">ви</span>' },
      n: { s: '<span class="ukr" data-info="воно;proper;cas;nomi">воно</span>',
          pl: '<span class="ukr" data-info="вони;proper;cas;nomi">вони</span>' },
    };

    const verbData = dataManager.wordData.verb?.[verb];
    if (!verbData?.conj?.[tense]) return "";

    const tenseData = verbData.conj[tense];

    if (tense === "pass") {
      for (const g of ["m", "f", "n"]) {
        const pd = tenseData[g];
        if (!pd) continue;

        if (pd.s) {
          const txt = Utils.firstText(pd.s);
          const dataInfo = `${verb};verb;conj;${tense};${g};s`;
          htmlContent += `<li>${fragment1} ${pronouns_passed[g].s} <span class="ukr" data-info="${dataInfo}">${txt}</span> ${fragment2}</li>\n`;
        }
        if (pd.pl) {
          const txt = Utils.firstText(pd.pl);
          const dataInfo = `${verb};verb;conj;${tense};${g};pl`;
          htmlContent += `<li>${fragment1} ${pronouns_passed[g].pl} <span class="ukr" data-info="${dataInfo}">${txt}</span> ${fragment2}</li>\n`;
        }
      }
      return htmlContent;
    }

    for (const p of ["1p", "2p", "3p"]) {
      const pd = tenseData[p];
      if (!pd) continue;

      if (pd.s) {
        const txt = Utils.firstText(pd.s);
        const dataInfo = `${verb};verb;conj;${tense};${p};s`;
        htmlContent += `<li>${fragment1} ${pronouns[p].s} <span class="ukr" data-info="${dataInfo}">${txt}</span> ${fragment2}</li>\n`;
      }
      if (pd.pl) {
        const txt = Utils.firstText(pd.pl);
        const dataInfo = `${verb};verb;conj;${tense};${p};pl`;
        htmlContent += `<li>${fragment1} ${pronouns[p].pl} <span class="ukr" data-info="${dataInfo}">${txt}</span> ${fragment2}</li>\n`;
      }
    }

    return htmlContent;
  },

};
