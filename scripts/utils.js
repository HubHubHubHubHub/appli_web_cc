let Utils = {
  // -------- parsing & accents --------
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

  // Fonction pour entourer une lettre avec un <span> et une classe CSS pour l'accentuer
  highlightLetter: function (word, position, classe) {
    if (position < 0 || position >= word.length) {
      return word;
    }
    const accent = "\u0301"; // Accent aigu combiné
    const highlightedWord =
      word.slice(0, position) +
      `<span class="${classe}">` +
      word[position] +
      accent +
      "</span>" +
      word.slice(position + 1);
    return highlightedWord;
  },

  // -------- accès base de données --------
  // Fonction pour récupérer les données depuis le JSON
  getDataFromJson: function (category, infos) {
    switch (category) {
      case "prep": {
        const [word, base] = infos;
        return dataManager.wordData?.prep?.[word]?.[base] || null;
      }
      case "nom": {
        const [word, functionName, caseType, number] = infos;
        return (
          dataManager.wordData?.nom?.[word]?.[functionName]?.[caseType]?.[number] ||
          null
        );
      }
      case "card":
      case "adj":
      case "proposs": {
        const [word, functionName, caseType, gender] = infos;
        return (
          dataManager.wordData?.[category]?.[word]?.[functionName]?.[caseType]?.[gender] ||
          null
        );
      }
      case "proper": {
        const [word, functionName, caseType] = infos; // ex: ["я","cas","nomi"]
        return dataManager.wordData?.proper?.[word]?.[functionName]?.[caseType] || null;
      }
      case "verb": {
        // formats: [word,"inf"] | [word,"imper",tense] | [word,"conj",tense,person,number]
        const [word, tag, tense, person, number] = infos;
        if (tag === "inf")   return dataManager.wordData?.verb?.[word]?.inf || null;
        if (tag === "imper") return dataManager.wordData?.verb?.[word]?.imper?.[tense] || null;
        if (tag === "conj")
          return dataManager.wordData?.verb?.[word]?.conj?.[tense]?.[person]?.[number] || null;
        return null;
      }
      case "adv": {
        // ta base: adv: { beaucoup: { base: ["багато",4], ... } }
        const [word, degree] = infos; // ex: ["багато","base"]
        const key = degree || "base";
        return dataManager.wordData?.adv?.[word]?.[key] ||
               dataManager.wordData?.adv?.[word]?.base ||
               null;
      }
      default: {
        return null;
      }
    }
  },

  // couleurs/activation par classes (tokens présents dans data-info)
  classesToColors: {
    nomi: "inherit",
    gen: "rgb(19, 132, 46)",
    acc: "rgb(57, 4, 248)",
    loc: "rgb(132, 93, 19)",
    ins: "rgb(231, 40, 155)",
    dat: "rgb(231, 40, 155)",
    voc: "rgb(132, 19, 19)",
    conj: "inherit",
    inf:  "inherit",
    adv:  "inherit"
  },

  /* coloration des groupes + infobulle */
  applyHoverStyles: function (classesToColors, divId) {
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

              // Choisir un "lemme" d'affichage (forme + position d’accent) selon la catégorie
              switch (category) {
                case "nom":
                  data = dataManager?.wordData[category]?.[word]?.["cas"]?.["nomi"]?.["s"];
                  break;
                case "proposs":
                case "card":
                case "adj":
                  data = dataManager?.wordData[category]?.[word]?.["cas"]?.["nomi"]?.["m"];
                  break;
                case "proper":
                  // proper: le nominatif est stocké directement comme [forme, posAccent]
                  data = dataManager?.wordData[category]?.[word]?.["cas"]?.["nomi"] || null;
                  break;
                case "verb":
                  // verbe: utiliser l’infinitif comme lemme
                  data = dataManager?.wordData[category]?.[word]?.["inf"];
                  break;
                case "adv":
                  // adverbe: adv[word].base = [forme, posAccent]
                  data = dataManager?.wordData?.adv?.[word]?.base || null;
                  break;
                default:
                  data = null;
              }

              if (data) {
                const posAcc = data[1];
                const motNomi = data[0];
                const rest = dataInfo.filter((token, index) => {
                  if (index === 0) return false;                         // retire le lemme brut (on le réaffiche avec accent)
                  if (index === 2 && token === "conj") return false;     // masque seulement "conj"
                  return true;                                           // garde "inf", "base", etc.
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

  // Fonction pour afficher les informations d'un mot au survol
  applyHoverInfo: function (divId) {
  let tablegrammar = document.getElementById("table-grammar");
  const elements = document.getElementById(divId).querySelectorAll(".ukr");

  elements.forEach((element) => {
    const dataInfo = Utils.parseInfo(element.getAttribute("data-info"));
    const [word, category, ...infos] = dataInfo;

    element.addEventListener("mouseenter", function () {
      if (!dataInfo) return;

      // NOMS (structure: nom[word].cas[caseName][gender] = [forme, pos])
      if (category === "nom") {
        const data = dataManager?.wordData?.nom?.[word]?.cas;
        // infos pour un nom: ["cas", caseType, number] → on veut (caseType, number)
        const tableHTML = Utils.generateTableNoun(data, infos[1], infos[2]);
        tablegrammar.innerHTML = tableHTML;
        tablegrammar.style.display = "block";
        return;
      }

      // PROPER / pronoms (structure: proper[word].cas[caseName] = [forme, pos, (forme2, pos2)...])
      if (category === "proper") {
        const data = dataManager?.wordData?.proper?.[word]?.cas;
        // infos pour proper: ["cas", caseType] → on veut surligner (caseType)
        const currentCase = infos[1];
        const tableHTML = Utils.generateTableProper(data, currentCase);
        tablegrammar.innerHTML = tableHTML;
        tablegrammar.style.display = "block";
        return;
      }

      // ADJECTIFS (structure: adj[word].cas[caseName][gender] = [form1,pos1, form2,pos2, ...])
      if (category === "adj") {
        const data = dataManager?.wordData?.adj?.[word]?.cas;
        // infos = ["cas", caseType, gender] → on veut surligner (caseType, gender)
        const currentCase = infos[1];
        const currentGender = infos[2];
        const tableHTML = Utils.generateTableAdj(data, currentCase, currentGender);
        tablegrammar.innerHTML = tableHTML;
        tablegrammar.style.display = "block";
        return;
      }
    });

    element.addEventListener("mouseleave", function () {
      tablegrammar.style.display = "none";
    });
  });
},

  // Fonction pour créer la table d'un nom
  generateTableNoun: function (data, cas, gender) {
    if (!data) return "<table></table>";
    let tableHTML = "<table>";
    Object.entries(data).forEach(([caseName, forms]) => {
      // Ajoute une ligne pour le nom du cas
      tableHTML += `<tr><th colspan="2"><em>${caseName}.</em></th></tr>`;
      // Itère sur m/f/n/s/pl selon la structure
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

  // Fonction pour créer la table d'un PROPER (pronom) : structure plate par cas
generateTableProper: function (data, currentCase) {
  if (!data) return "<table></table>";

  // helper: transforme [form1,pos1, form2,pos2, ...] → "fórm1 / fórm2"
  const accentJoin = (arr) => {
    if (!Array.isArray(arr)) return "";
    const out = [];
    for (let i = 0; i < arr.length; i += 2) {
      const form = arr[i];
      const pos  = arr[i + 1];
      out.push(Utils.addAccent(form, pos));
    }
    return out.join(" / ");
  };

  let tableHTML = "<table>";
  Object.entries(data).forEach(([caseName, value]) => {
    const cell = accentJoin(value);
    tableHTML += `<tr><th><em>${caseName}.</em></th></tr>`;
    tableHTML += `
      <tr>
        <td>${caseName === currentCase ? "<strong>" + cell + "</strong>" : cell}</td>
      </tr>
    `;
  });
  tableHTML += "</table>";
  return tableHTML;
},
// Fonction pour créer la table d'un ADJECTIF
// data: adj[word].cas
// cas/gender à surligner: strings comme "nomi", "m" etc.
generateTableAdj: function (data, cas, gender) {
  if (!data) return "<table></table>";

  const renderForms = (arr) => {
    if (!Array.isArray(arr)) return "";
    const out = [];
    for (let i = 0; i < arr.length; i += 2) {
      out.push(Utils.addAccent(arr[i], arr[i + 1]));
    }
    return out.join(" / ");
  };

  const gendersOrder = ["m", "f", "n", "pl"];

  let tableHTML = "<table>";
  // ⬇️ on MASQUE la section 'voc' (identique à 'nomi' pour les adj.)
  Object.entries(data)
    .filter(([caseName]) => caseName !== "voc")
    .forEach(([caseName, formsByGender]) => {
      tableHTML += `<tr><th colspan="2"><em>${caseName}.</em></th></tr>`;
      gendersOrder.forEach((g) => {
        if (!formsByGender[g]) return;
        const cell = renderForms(formsByGender[g]);
        const content =
          caseName === cas && g === gender ? "<strong>" + cell + "</strong>" : cell;
        tableHTML += `
          <tr>
            <td><em>${g}.</em></td>
            <td>${content}</td>
          </tr>
        `;
      });
    });

  tableHTML += "</table>";
  return tableHTML;
},

};
