let Utils = {
  // Fonction pour parser l'information à partir de l'attribut data-info
  parseInfo: function (info) {
    return info.split(";");
  },

  // Fonction pour ajouter un accent au mot à la position spécifiée
  addAccent: function (word, accentPosition) {
    if (!word) {
      return ""; // Retourne une chaîne vide si 'word' est null ou undefined
    }
    const accent = "\u0301"; // Accent aigu combiné
    const chars = Array.from(word);
    if (accentPosition > 0 && accentPosition <= chars.length) {
      chars[accentPosition - 1] += accent;
    }
    return chars.join("");
  },
  // Fonction pour entourer une lettre avec un <span> et une
  // classe CSS pour l'accentuer
  highlightLetter: function (word, position, classe) {
    if (position < 0 || position >= word.length) {
      return word;
    }
    // Si on veut rajouter un accent
    const accent = "\u0301"; // Accent aigu combiné
    // Crée le mot avec la lettre entourée d'un span
    const highlightedWord =
      word.slice(0, position) +
      `<span class="${classe}">` +
      word[position] +
      accent +
      "</span>" +
      word.slice(position + 1);

    return highlightedWord;
  },
  // Fonction pour récupérer les données depuis le JSON
  getDataFromJson: function (category, infos) {
    switch (category) {
      case "prep": {
        let [word, base] = infos;
        return dataManager.wordData?.[category]?.[word]?.[base] || null;
      }
      case "nom": {
        let [word, functionName, caseType, number] = infos;
        return (
          dataManager.wordData?.[category]?.[word]?.[functionName]?.[
            caseType
          ]?.[number] || null
        );
        // Le 'break' est inutile après un 'return'
      }
      case "card":
      case "adj":
      case "proposs": {
        let [word, functionName, caseType, gender] = infos;
        return (
          dataManager.wordData?.[category]?.[word]?.[functionName]?.[
            caseType
          ]?.[gender] || null
        );
      }
      case "proper": {
        let [word, functionName, caseType, gender] = infos;
        return (
          dataManager.wordData?.[category]?.[word]?.[functionName]?.[
            caseType
          ] || null
        );
      }
      case "verb": {
        if (infos.includes("inf")) {
          let [word, mode] = infos;
          return dataManager.wordData?.[category]?.[word]?.[mode] || null;
        } else if (infos.includes("imper")) {
          let [word, functionName, tense] = infos;
          return (
            dataManager.wordData?.[category]?.[word]?.[functionName]?.[tense] ||
            null
          );
        } else if (infos.includes("conj")) {
          let [word, functionName, tense, person, number] = infos;
          return (
            dataManager.wordData?.[category]?.[word]?.[functionName]?.[tense]?.[
              person
            ]?.[number] || null
          );
        }
      }
      default: {
        // Instructions exécutées si aucune correspondance n'est trouvée
        return null;
      }
    }
  },
  classesToColors: {
    nomi: "inherit",
    gen: "rgb(19, 132, 46)",
    acc: "rgb(57, 4, 248)",
    loc: "rgb(132, 93, 19)",
    ins: "rgb(231, 40, 155)",
    dat: "rgb(231, 40, 155)",
    voc: "rgb(132, 19, 19)",
    conj: "inherit",
    inf: "inherit",
  },
  /* coloration des groupes de mots par cas au survol */

  applyHoverStyles: function (classesToColors, divId) {
    //const elements = document.querySelectorAll(".ukr"); // Sélectionne tous les éléments avec la classe 'ukr', du coup également les éléments de word-List... à corriger, éventuellement
    const elements = document.getElementById(divId).querySelectorAll(".ukr");
    elements.forEach((element) => {
      Object.entries(classesToColors).forEach(([className, color]) => {
        const dataInfo = Utils.parseInfo(element.getAttribute("data-info"));
        const [word, category, ...infos] = dataInfo;
        if (dataInfo.includes(className)) {
          element.addEventListener("mouseenter", function () {
            // Vérifie si l'élément <sup> a déjà été ajouté
            if (!this.classList.contains("info-added")) {
              this.style.color = color;
              let displayedInfo;
              let data;
              switch (category) {
                case "nom":
                  data =
                    dataManager?.wordData[category]?.[word]?.["cas"]?.[
                      "nomi"
                    ]?.["s"];
                  break;
                case "proposs":
                case "card":
                case "adj":
                  data =
                    dataManager?.wordData[category]?.[word]?.["cas"]?.[
                      "nomi"
                    ]?.["m"];
                  break;
                case "verb":
                  data = dataManager?.wordData[category]?.[word]?.["inf"];
                  break;
                default:
                  data = null;
              }
              if (data) {
                const posAcc = data[1];
                const motNomi = data[0];
                const rest = dataInfo.filter((token, index) => {
                  if (index === 0) return false;                         // on enlève le lemme (réaffiché avec accent)
                  if (index === 2 && token === "conj") return false;     // on masque seulement "conj"
                  return true;                                           // on GARDE "inf"/"imper"
                });
                displayedInfo = Utils.addAccent(motNomi, posAcc) + "," + rest.join();
              } else {
                const rest = dataInfo.filter((token, index) => !(index === 2 && token === "conj"));
                displayedInfo = rest.join();
              }
              
              this.innerHTML += `<sup><em> ${displayedInfo}</em></sup>`;
              this.classList.add("info-added"); // Marque l'élément comme ayant un <sup>
            }
          });

          element.addEventListener("mouseleave", function () {
            this.style.color = ""; // Réinitialise à la couleur par défaut
            // Supprime uniquement le dernier <sup> ajouté
            if (this.classList.contains("info-added")) {
              this.innerHTML = this.innerHTML.split("<sup>")[0]; // Reset à l'original sans <sup>
              this.classList.remove("info-added"); // Retire la marque
            }
          });
        }
      });
    });
  },
  // Fonction pour afficher les informations d'un mot
  applyHoverInfo: function (divId) {
    let tablegrammar = document.getElementById("table-grammar");
    const elements = document.getElementById(divId).querySelectorAll(".ukr");
    elements.forEach((element) => {
      const dataInfo = Utils.parseInfo(element.getAttribute("data-info"));
      const [word, category, ...infos] = dataInfo;
      element.addEventListener("mouseenter", function () {
        if (dataInfo) {
          const data = dataManager?.wordData[category]?.[word]?.["cas"];
          //const data = getDataFromJson(info[0], info[1], info[2]);
          //const tableHTML = generateTable(data, info[3], info[4]);
          const tableHTML = Utils.generateTableNoun(data, infos[0], infos[1]);
          tablegrammar.innerHTML = tableHTML;
          tablegrammar.style.display = "block";
        }
      });

      element.addEventListener("mouseleave", function () {
        tablegrammar.style.display = "none";
      });
    });
  },
  // Fonction pour créer la table d'un nom
  generateTableNoun: function (data, cas, gender) {
    let tableHTML = "<table>";
    Object.entries(data).forEach(([caseName, forms]) => {
      // Ajoute une ligne pour le nom du cas
      tableHTML += `<tr><th colspan="2"><em>${caseName}.</em></th></tr>`;
      // Itère sur masculin (m) et pluriel (pl)
      Object.entries(forms).forEach(([form, value]) => {
        const wordWithAccent = Utils.addAccent(value[0], value[1]);
        tableHTML += `
              <tr>
                <td><em>${form}.</em></td>
                <td>${
                  caseName === cas && form === gender
                    ? "<strong>" + wordWithAccent + "</strong>"
                    : wordWithAccent
                }</td>
              </tr>
            `;
      });
    });
    tableHTML += "</table>";
    return tableHTML;
  },
};
