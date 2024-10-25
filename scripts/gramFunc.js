let gramFunc = {
  // Fonction pour générer les formes verbales en HTML sans gérer les accents
  generateVerbForms: function (verb, tense, fragment1, fragment2) {
    let htmlContent = "";

    // Définir les pronoms personnels
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

    // Définir les pronoms personnels
    const pronouns_passed = {
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

    // Récupérer les données de conjugaison pour le verbe et le temps
    console.log(dataManager.wordData);
    const verbData = dataManager.wordData["verb"][verb]; // Assurez-vous que dataManager.wordData est accessible
    if (!verbData || !verbData.conj || !verbData.conj[tense]) {
      console.error(
        "Données de conjugaison introuvables pour le verbe :",
        verb,
        "temps :",
        tense
      );
      return "";
    }

    const tenseData = verbData.conj[tense];

    // Parcourir les personnes
    if (tense === "pass") {
      for (const personKey of ["m", "f", "n"]) {
        const personData = tenseData[personKey];
        if (!personData) continue; // Passer si les données ne sont pas disponibles

        // Forme singulier
        if (personData.s) {
          let forms = personData.s;

          if (!Array.isArray(forms)) {
            forms = [forms];
          }

          const dataInfo = `${verb};verb;conj;${tense};${personKey};s`;
          const pronoun = pronouns_passed[personKey]["s"];
          htmlContent += `<li>${fragment1} ${pronoun} <span class="ukr" data-info="${dataInfo}">${forms[0]}</span> ${fragment2}</li>\n`;
        }

        // Forme pluriel
        if (personData.pl) {
          let forms = personData.pl;

          if (!Array.isArray(forms)) {
            forms = [forms];
          }

          const dataInfo = `${verb};verb;conj;${tense};${personKey};pl`;
          const pronoun = pronouns_passed[personKey]["pl"];
          htmlContent += `<li>${fragment1} ${pronoun} <span class="ukr" data-info="${dataInfo}">${forms[0]}</span> ${fragment2}</li>\n`;
        }
      }
    }

    for (const personKey of ["1p", "2p", "3p"]) {
      const personData = tenseData[personKey];
      if (!personData) continue; // Passer si les données ne sont pas disponibles

      // Forme singulier
      if (personData.s) {
        let forms = personData.s;

        if (!Array.isArray(forms)) {
          forms = [forms];
        }

        const dataInfo = `${verb};verb;conj;${tense};${personKey};s`;
        const pronoun = pronouns[personKey]["s"];
        htmlContent += `<li>${fragment1} ${pronoun} <span class="ukr" data-info="${dataInfo}">${forms[0]}</span> ${fragment2}</li>\n`;
      }

      // Forme pluriel
      if (personData.pl) {
        let forms = personData.pl;

        if (!Array.isArray(forms)) {
          forms = [forms];
        }

        const dataInfo = `${verb};verb;conj;${tense};${personKey};pl`;
        const pronoun = pronouns[personKey]["pl"];
        htmlContent += `<li>${fragment1} ${pronoun} <span class="ukr" data-info="${dataInfo}">${forms[0]}</span> ${fragment2}</li>\n`;
      }
    }

    return htmlContent;
  },
};
