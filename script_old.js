/* récupération des données JSON */
let wordData = {};
let isAccentChecked = false; // Variable pour suivre l'état de la checkbox

document.addEventListener("DOMContentLoaded", function () {
  // Charge le fichier JSON
  fetch("data.json")
    .then((response) => response.json())
    .then((json) => {
      wordData = json; // Stocke les données JSON pour une utilisation ultérieure
      displayWordList(); // Affiche la liste des mots
      setupAccentHighlighting(); // Initialise la fonctionnalité après le chargement des données
      setupWordListClickEvents(); // Attache les événements de clic sur les éléments de la liste
    })
    .catch((error) =>
      console.error("Erreur lors du chargement du fichier JSON:", error)
    );
});

// Fonction pour parser l'information à partir de l'attribut data-info
function parseInfo(info) {
  return info.split(";");
}

// Fonction pour récupérer les données depuis le JSON
function getDataFromJson(category, infos) {
  switch (category) {
    case "prep": {
      let [word, base] = infos;
      return wordData?.[category]?.[word]?.[base] || null;
    }
    case "nom": {
      let [word, functionName, caseType, number] = infos;
      return (
        wordData?.[category]?.[word]?.[functionName]?.[caseType]?.[number] ||
        null
      );
      // Le 'break' est inutile après un 'return'
    }
    case "card":
    case "adj":
    case "proposs": {
      let [word, functionName, caseType, gender] = infos;
      return (
        wordData?.[category]?.[word]?.[functionName]?.[caseType]?.[gender] ||
        null
      );
    }
    case "proper": {
      let [word, functionName, caseType, gender] = infos;
      return wordData?.[category]?.[word]?.[functionName]?.[caseType] || null;
    }
    case "verb": {
      if (infos.includes("inf")) {
        let [word, mode] = infos;
        return wordData?.[category]?.[word]?.[mode] || null;
      } else if (infos.includes("imper")) {
        let [word, functionName, tense] = infos;
        return wordData?.[category]?.[word]?.[functionName]?.[tense] || null;
      } else if (infos.includes("conj")) {
        let [word, functionName, tense, person, number] = infos;
        return (
          wordData?.[category]?.[word]?.[functionName]?.[tense]?.[person]?.[
            number
          ] || null
        );
      }
    }
    default: {
      // Instructions exécutées si aucune correspondance n'est trouvée
      return null;
    }
  }
}

// Fonction pour entourer une lettre avec un <span>
function highlightLetter(word, position) {
  if (position < 0 || position >= word.length) {
    return word;
  }

  // Crée le mot avec la lettre entourée d'un span
  const highlightedWord =
    word.slice(0, position) +
    '<span class="accent">' +
    word[position] +
    "</span>" +
    word.slice(position + 1);

  return highlightedWord;
}

// Fonction pour sauvegarder le texte original des éléments
function attachOriginalText() {
  const words = document.querySelectorAll(".ukr");
  words.forEach(function (word) {
    if (!word.dataset.original) {
      word.dataset.original = word.textContent; // Sauvegarde la valeur originale dans data-original
    }
  });
}

// Fonction pour configurer la mise en surbrillance des accents
function setupAccentHighlighting() {
  const checkbox = document.getElementById("accent-check");

  // Sauvegarder le texte original
  attachOriginalText();

  // Mettre à jour l'état de la checkbox
  isAccentChecked = checkbox.checked;

  checkbox.addEventListener("change", function () {
    isAccentChecked = checkbox.checked; // Mettre à jour l'état de la checkbox
    highlightWords(); // Appliquer ou supprimer les accents selon l'état actuel
  });

  // Initialiser les accents au chargement initial si la case est cochée
  highlightWords();
}

// Fonction pour appliquer ou supprimer les accents
function highlightWords() {
  const words = document.querySelectorAll(".ukr");
  words.forEach(function (word) {
    if (isAccentChecked) {
      // Récupérer les informations depuis l'attribut data-info
      const dataInfo = parseInfo(word.getAttribute("data-info"));
      // Déstructuration
      let [a, b, ...tab2] = dataInfo;
      // Assignations
      const categorie = b;
      const infos = [a, ...tab2];
      if (categorie && infos) {
        // Récupérer la position de l'accent depuis le fichier JSON
        const jsonData = getDataFromJson(categorie, infos);
        if (jsonData) {
          const position = jsonData[1] - 1; // La position est à l'index 1 du tableau
          word.innerHTML = highlightLetter(word.dataset.original, position);
        }
      }
    } else {
      // Réinitialiser le texte d'origine
      word.innerHTML = word.dataset.original;
    }
  });
}

// Fonction pour ajouter un accent au mot à la position spécifiée
function addAccent(word, accentPosition) {
  if (!word) {
    return ""; // Retourne une chaîne vide si 'word' est null ou undefined
  }
  const accent = "\u0301"; // Accent aigu combiné
  const chars = Array.from(word);
  if (accentPosition > 0 && accentPosition <= chars.length) {
    chars[accentPosition - 1] += accent;
  }
  return chars.join("");
}

// Fonction pour afficher les éléments de wordList
function displayWordList() {
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

  if (wordList && wordData) {
    // Parcourir les catégories de mots
    for (const category in categories) {
      if (wordData.hasOwnProperty(category)) {
        const words = wordData[category];

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
}

// Fonction pour attacher les événements de clic
function setupWordListClickEvents() {
  const wordList = document.getElementById("wordList");
  if (wordList) {
    // Utiliser la délégation d'événements
    wordList.addEventListener("click", function (event) {
      const target = event.target;

      // Vérifier si l'élément cliqué est un <span> avec la classe 'ukr'
      if (target && target.classList.contains("ukr")) {
        displayInfo(target);
      }
    });
  }
}

// Fonction pour afficher les informations d'un mot
function displayInfo(spanElement) {
  // Récupérer les informations depuis l'attribut data-info
  const dataInfo = parseInfo(spanElement.getAttribute("data-info"));
  const [word, category, ...infos] = dataInfo;

  // Vérifier si le mot existe dans les données
  if (wordData[category] && wordData[category][word]) {
    const details = wordData[category][word];
    let htmlContent = `<h2>${word} (${category})</h2>`;

    switch (category) {
      case "nom":
        htmlContent += generateNounDetails(details);
        break;
      case "card":
      case "adj":
        htmlContent += generateAdjectiveDetails(details);
        break;
      case "verb":
        htmlContent += generateVerbDetails(details);
        break;
      default:
        htmlContent += "<p>Catégorie non prise en charge.</p>";
    }

    // Afficher les phrases d'exemple s'il y en a
    if (details.phrases) {
      htmlContent += generateExamplePhrases(details.phrases);
    }

    document.getElementById("word-details").innerHTML = htmlContent;

    // Réattacher la logique de mise en surbrillance après le chargement du nouveau contenu
    attachOriginalText();
    highlightWords(); // Pour appliquer la logique de surbrillance sur les nouveaux éléments
  } else {
    document.getElementById("word-details").innerHTML =
      "<p>Aucun détail disponible pour ce mot.</p>";
  }
}

// Fonction pour générer les détails des noms
function generateNounDetails(details) {
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
}

// Fonction pour générer les détails des adjectifs et des cardinaux
function generateAdjectiveDetails(details) {
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
      nom: "називний",
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
          const wordWithAccent = addAccent(form[0], form[1]);
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
}

// Fonction pour générer les détails des verbes
function generateVerbDetails(details) {
  let htmlContent = "";
  if (details.conj) {
    htmlContent += generateVerbTable(details);
  }
  return htmlContent;
}

// Fonction pour générer les phrases d'exemple
function generateExamplePhrases(phrases) {
  let htmlContent = "<h3>Phrases d'exemple:</h3><ul>";
  for (const [phraseKey, phrase] of Object.entries(phrases)) {
    htmlContent += `
      <li>
        ${phrase.phrase_html} <em>${phrase.traduction}</em>
        ${
          phrase.genereVerbe
            ? `<p>${generateVerbForms(
                phrase.genereVerbe.verbe,
                phrase.genereVerbe.temps,
                phrase.genereVerbe.frag1,
                phrase.genereVerbe.frag2
              )}</p>`
            : ""
        }
        ${phrase.remarque ? `<p class='remarque'>${phrase.remarque}</p>` : ""}
      </li>
    `;
  }
  htmlContent += "</ul>";
  return htmlContent;
}

function generateVerbTable(details) {
  let html = '<table class="conj-table"><tbody>';

  // Ajouter la ligne pour l'infinitif
  html += `
    <tr class="conj-row conj-infinitive">
      <td class="conj-cell conj-inf-label">Інфінітив</td>
      <td colspan="2" class="conj-cell conj-inf-word">
        <span class="conj-word">${addAccent(
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
            const wordWithAccent = addAccent(forms.s[0], forms.s[1]);
            html += `<td class="conj-cell conj-singular"><span class="conj-word">${wordWithAccent}</span></td>`;
          } else {
            html += `<td class="conj-cell conj-singular"></td>`;
          }
          // Forme pluriel (même pour tous les genres)
          if (forms.pl && genderKey === "m") {
            const wordWithAccent = addAccent(forms.pl[0], forms.pl[1]);
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
              <span class="conj-word">${addAccent(
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
              addAccent(word, position)
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
              addAccent(word, position)
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
}

// Fonction pour générer les formes verbales en HTML sans gérer les accents
function generateVerbForms(verb, tense, fragment1, fragment2) {
  let htmlContent = "";

  // Définir les pronoms personnels
  const pronouns = {
    "1p": { s: "я", pl: "ми" },
    "2p": { s: "ти", pl: "ви" },
    "3p": { s: "він/вона/воно", pl: "вони" },
  };

  // Récupérer les données de conjugaison pour le verbe et le temps
  console.log(wordData);
  const verbData = wordData["verb"][verb]; // Assurez-vous que wordData est accessible
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
}
