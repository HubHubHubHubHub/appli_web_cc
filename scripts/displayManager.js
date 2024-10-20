let displayManager = {
  // Fonction pour afficher les éléments de wordList
  displayWordList: function () {
    const wordList = document.getElementById("wordList");
    const categories = {
      nom: "Noms",
      adj: "Adjectifs",
      verb: "Verbes",
      card: "Cardinaux",
      proposs: "Pronoms possessifs",
      proper: "Pronoms personnels",
      prep: "Prépositions",
    };

    if (wordList && dataManager.wordData) {
      // Parcourir les catégories de mots
      for (const category in categories) {
        if (dataManager.wordData.hasOwnProperty(category)) {
          const words = dataManager.wordData[category];

          // Vérifier si la catégorie contient des mots
          if (words && Object.keys(words).length > 0) {
            // Créer un élément de titre pour la catégorie
            const categoryTitle = document.createElement("h2");
            categoryTitle.textContent = categories[category];
            wordList.appendChild(categoryTitle);

            // Créer une liste pour les mots de la catégorie
            const wordListUl = document.createElement("ul");
            wordListUl.classList.add("word-list");

            for (const word in words) {
              if (words.hasOwnProperty(word)) {
                const wordLi = document.createElement("li");
                wordLi.classList.add("word-item");

                // Utiliser 'base_html' pour insérer le span avec les données
                wordLi.innerHTML = words[word].base_html;

                wordListUl.appendChild(wordLi);
              }
            }

            wordList.appendChild(wordListUl);
          }
        }
      }
    }
  },

  // Fonction pour afficher les informations d'un mot
  displayInfo: function (spanElement) {
    // Récupérer les informations depuis l'attribut data-info
    const dataInfo = Utils.parseInfo(spanElement.getAttribute("data-info"));
    const [word, category, ...infos] = dataInfo;

    // Vérifier si le mot existe dans les données
    if (
      dataManager.wordData[category] &&
      dataManager.wordData[category][word]
    ) {
      const details = dataManager.wordData[category][word];
      let htmlContent = `<h2>${word} (${category})</h2>`;

      switch (category) {
        case "nom":
          htmlContent += displayManager.generateNounDetails(details);
          break;
        case "proposs":
        case "card":
        case "adj":
          htmlContent += displayManager.generateAdjectiveDetails(details);
          break;
        case "verb":
          htmlContent += displayManager.generateVerbDetails(details);
          break;
        default:
          htmlContent += "<p>Catégorie non prise en charge.</p>";
      }

      // Afficher les phrases d'exemple s'il y en a
      if (details.phrases) {
        htmlContent += displayManager.generateExamplePhrases(details.phrases);
      }

      document.getElementById("word-details").innerHTML = htmlContent;

      // Appeler la fonction depuis eventHandlers
      eventHandlers.setupExamplePhrasesEventHandlers();

      // Réattacher la logique de mise en surbrillance après le chargement du nouveau contenu
      accentManager.attachOriginalText();
      accentManager.highlightWords(); // Pour appliquer la logique de surbrillance sur les nouveaux éléments
    } else {
      document.getElementById("word-details").innerHTML =
        "<p>Aucun détail disponible pour ce mot.</p>";
    }
  },

  // Fonction pour générer les détails des noms
  generateNounDetails: function (details) {
    let htmlContent = "";
    if (details.cas) {
      htmlContent += "<h3>Cas grammaticaux:</h3><ul>";
      for (const [cas, form] of Object.entries(details.cas)) {
        htmlContent += `<li><strong>${cas} s.</strong> : ${
          form.s[0] || ""
        } , <strong>p.</strong> : ${form.pl[0] || ""} </li>`;
      }
      htmlContent += "</ul>";
    }
    return htmlContent;
  },

  // Fonction pour générer les détails des adjectifs et des cardinaux
  generateAdjectiveDetails: function (details) {
    let htmlContent = "";
    if (details.cas) {
      htmlContent += '<table class="table"><tbody>';
      // Ajouter la ligne d'en-tête
      htmlContent += `<tr class="row column-header">
                        <td class="cell">відмінок</td>
                        <td class="cell" title="чоловічий рід">чол. р.</td>
                        <td class="cell" title="жіночий рід">жін. р.</td>
                        <td class="cell" title="середній рід">сер. р.</td>
                        <td class="cell">множина</td>
                      </tr>`;
      // Mapping des codes de cas aux noms ukrainiens
      const caseNames = {
        nomi: "називний",
        gen: "родовий",
        dat: "давальний",
        acc: "знахідний",
        ins: "орудний",
        loc: "місцевий",
        voc: "кличний",
      };
      // Pour chaque cas grammatical
      for (const [caseKey, forms] of Object.entries(details.cas)) {
        htmlContent += '<tr class="row">';
        // Nom du cas en ukrainien
        const caseDisplayName = caseNames[caseKey] || caseKey;
        htmlContent += `<td class="cell header">${caseDisplayName}</td>`;
        // Genres à parcourir
        const genders = ["m", "f", "n", "pl"];
        for (const gender of genders) {
          const form = forms[gender];
          if (form) {
            // Ajouter l'accent au mot
            const wordWithAccent = Utils.addAccent(form[0], form[1]);
            htmlContent += `<td class="cell"><span class="word ">${wordWithAccent}</span></td>`;
          } else {
            htmlContent += `<td class="cell"></td>`;
          }
        }
        htmlContent += "</tr>";
      }
      htmlContent += "</tbody></table>";
    }
    return htmlContent;
  },

  // Fonction pour générer les détails des verbes
  generateVerbDetails: function (details) {
    let htmlContent = "";
    if (details.conj) {
      htmlContent += displayManager.generateVerbTable(details);
    }
    return htmlContent;
  },

  // Fonction pour générer les phrases d'exemple
  generateExamplePhrases: function (phrases) {
    let htmlContent = "<h3>Phrases d'exemple:</h3><ul>";
    for (const [phraseKey, phrase] of Object.entries(phrases)) {
      htmlContent += `<li>`;
      htmlContent += `${dataManager.phraseData[phraseKey].phrase_html} <em>${dataManager.phraseData[phraseKey].traduction}</em>`;
      if (dataManager.phraseData[phraseKey].remarque) {
        htmlContent += `<p class='remarque'>${dataManager.phraseData[phraseKey].remarque}</p>`;
      }

      // Vérifier si "genereVerbe" existe
      console.log(dataManager.phraseData[phraseKey].genereVerbe);
      if (dataManager.phraseData[phraseKey].genereVerbe) {
        // Générer un identifiant unique pour la checkbox et le conteneur des formes verbales
        const uniqueId = Math.random().toString(36).slice(2, 11);
        const checkboxId = `show-verb-forms-${uniqueId}`;
        const verbFormsContainerId = `verb-forms-container-${uniqueId}`;

        htmlContent += `
        <div>
          <input type="checkbox" id="${checkboxId}" class="show-verb-forms-checkbox" data-verbe="${dataManager.phraseData[phraseKey].genereVerbe.verbe}" data-temps="${dataManager.phraseData[phraseKey].genereVerbe.temps}" data-frag1='${dataManager.phraseData[phraseKey].genereVerbe.frag1}' data-frag2='${dataManager.phraseData[phraseKey].genereVerbe.frag2}' data-container="${verbFormsContainerId}">
          <label for="${checkboxId}">Afficher les formes verbales</label>
        </div>
        <div id="${verbFormsContainerId}" class="verb-forms-container" style="display: none;"></div>
      `;
      }

      htmlContent += `</li>`;
    }
    htmlContent += "</ul>";
    return htmlContent;
  },

  generateVerbTable: function (details) {
    let html = '<table class="conj-table"><tbody>';

    // Ajouter la ligne pour l'infinitif
    html += `
      <tr class="conj-row conj-infinitive">
        <td class="conj-cell conj-inf-label">Інфінітив</td>
        <td colspan="2" class="conj-cell conj-inf-word">
          <span class="conj-word">${Utils.addAccent(
            details.inf[0],
            details.inf[1]
          )}</span>
        </td>
      </tr>
    `;

    // Les temps et modes à parcourir
    const tenses = {
      imp: "Наказовий спосіб",
      fut: "Майбутній час",
      pres: "Теперішній час",
      pass: "Минулий час",
      imper: "Безособова форма",
    };

    // Les personnes et genres
    const persons = {
      "1p": "1 особа",
      "2p": "2 особа",
      "3p": "3 особа",
      m: "чол. р.",
      f: "жін. р.",
      n: "сер. р.",
    };

    // Boucle sur les temps/modes
    for (const [tenseKey, tenseName] of Object.entries(tenses)) {
      const tenseData = details.conj[tenseKey];
      if (tenseData) {
        // Ajouter une ligne pour le nom du temps/mode
        html += `
          <tr class="conj-row conj-tense-header">
            <td colspan="3" class="conj-cell conj-tense-name">${tenseName}</td>
          </tr>
        `;

        // Cas particulier pour le temps passé (pass) et la forme impersonnelle
        if (tenseKey === "pass") {
          // Boucle sur les genres
          for (const [genderKey, forms] of Object.entries(tenseData)) {
            html += '<tr class="conj-row conj-form-row">';
            html += `<td class="conj-cell conj-person">${persons[genderKey]}</td>`;
            // Forme singulier
            if (forms.s) {
              const wordWithAccent = Utils.addAccent(forms.s[0], forms.s[1]);
              html += `<td class="conj-cell conj-singular"><span class="conj-word">${wordWithAccent}</span></td>`;
            } else {
              html += `<td class="conj-cell conj-singular"></td>`;
            }
            // Forme pluriel (même pour tous les genres)
            if (forms.pl && genderKey === "m") {
              const wordWithAccent = Utils.addAccent(forms.pl[0], forms.pl[1]);
              // Fusionner les cellules pour le pluriel
              html += `<td rowspan="3" class="conj-cell conj-plural"><span class="conj-word">${wordWithAccent}</span></td>`;
            } else if (genderKey !== "m") {
              // Les autres genres n'ont pas besoin d'ajouter une cellule pour le pluriel
            }
            html += "</tr>";
          }
        } else if (tenseKey === "imper") {
          // Forme impersonnelle
          html += `
            <tr class="conj-row conj-impersonal">
              <td colspan="3" class="conj-cell conj-impersonal-form">
                <span class="conj-word">${Utils.addAccent(
                  tenseData[0],
                  tenseData[1]
                )}</span>
              </td>
            </tr>
          `;
        } else {
          // Pour les autres temps/modes
          // Ajouter les en-têtes pour les personnes
          html += `
            <tr class="conj-row conj-person-header">
              <td class="conj-cell conj-person-label">&nbsp;</td>
              <td class="conj-cell conj-singular-header">Однина</td>
              <td class="conj-cell conj-plural-header">Множина</td>
            </tr>
          `;

          // Boucle sur les personnes
          for (const [personKey, forms] of Object.entries(tenseData)) {
            html += '<tr class="conj-row conj-form-row">';
            html += `<td class="conj-cell conj-person">${persons[personKey]}</td>`;

            // Forme singulier
            if (forms.s) {
              const words = Array.isArray(forms.s)
                ? forms.s.slice(0, -1)
                : [forms.s];
              const position = Array.isArray(forms.s)
                ? forms.s[forms.s.length - 1]
                : null;
              const accentedWords = words.map((word) =>
                Utils.addAccent(word, position)
              );
              html += `<td class="conj-cell conj-singular">${accentedWords
                .map((word) => `<span class="conj-word">${word}</span>`)
                .join(", ")}</td>`;
            } else {
              html += `<td class="conj-cell conj-singular"></td>`;
            }

            // Forme pluriel
            if (forms.pl) {
              const words = Array.isArray(forms.pl)
                ? forms.pl.slice(0, -1)
                : [forms.pl];
              const position = Array.isArray(forms.pl)
                ? forms.pl[forms.pl.length - 1]
                : null;
              const accentedWords = words.map((word) =>
                Utils.addAccent(word, position)
              );
              html += `<td class="conj-cell conj-plural">${accentedWords
                .map((word) => `<span class="conj-word">${word}</span>`)
                .join(", ")}</td>`;
            } else {
              html += `<td class="conj-cell conj-plural"></td>`;
            }

            html += "</tr>";
          }
        }
      }
    }

    html += "</tbody></table>";
    return html;
  },
};
