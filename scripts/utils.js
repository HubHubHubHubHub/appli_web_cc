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

  // --- Normalisation rétro-compatible vers [[form, pos], ...] ---
  toPairs(entry) {
    // null/undefined
    if (!entry) return [];
    // déjà sous forme [[form,pos], ...]
    if (Array.isArray(entry) && Array.isArray(entry[0])) return entry;

    // [form,pos] simple
    if (Array.isArray(entry) &&
        entry.length === 2 &&
        typeof entry[0] === "string" &&
        Number.isInteger(entry[1])) {
      return [entry];
    }

    // format aplati: [f1,pos1, f2,pos2, ...]
    if (Array.isArray(entry) &&
        entry.length >= 2 &&
        typeof entry[0] === "string" &&
        Number.isInteger(entry[1])) {
      const out = [];
      for (let i = 0; i + 1 < entry.length; i += 2) {
        const f = entry[i], p = entry[i + 1];
        if (typeof f === "string" && Number.isInteger(p)) out.push([f, p]);
      }
      if (out.length) return out;
    }

    // ancien format verbe (ex: ["читаєм","читаємо",4]) → partager même accent
    if (Array.isArray(entry)) {
      const lastNum = [...entry].reverse().find(v => Number.isInteger(v));
      const forms = entry.filter(v => typeof v === "string");
      if (Number.isInteger(lastNum) && forms.length) {
        return forms.map(f => [f, lastNum]);
      }
    }

    return [];
  },

  firstPair(entry, variantIndex = 0) {
    const pairs = this.toPairs(entry);
    if (!pairs.length) return null;
    // si la 1ère variante est vide, on prend la suivante non vide
    for (let i = variantIndex; i < pairs.length; i++) {
      const [t, p] = pairs[i] || [];
      if (typeof t === "string" && t) return [t, p];
    }
    return pairs[variantIndex] || null;
  },

  firstText(entry, variantIndex = 0) {
    const p = this.firstPair(entry, variantIndex);
    return p && p[0] ? p[0] : "";
  },

  firstAccent(entry, variantIndex = 0) {
    const p = this.firstPair(entry, variantIndex);
    return p && Number.isInteger(p[1]) ? p[1] : -1;
  },

  // Renvoie l'index de variante demandé dans data-info, sinon 0
  getVariantIndex: function (dataInfoTokens) {
    const t = dataInfoTokens.find(s => /^var=\d+$/.test(s));
    return t ? parseInt(t.split("=")[1], 10) : 0;
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


  // Fonction pour afficher les informations d'un mot au survol
  /* coloration des groupes + infobulle (idempotent + pairs compatible) */
  /* coloration des groupes + infobulle (défensive + idempotent) */
  /* coloration des groupes de mots par cas au survol — version proche de l’original */
 // --- Affichage de la table grammaticale au survol (noms / pronoms / adjectifs)
applyHoverInfo: function (divId) {
  const box = document.getElementById("table-grammar");
  const container = document.getElementById(divId);
  if (!box || !container) return;

  const elements = container.querySelectorAll(".ukr");

  elements.forEach((el) => {
    const dataInfo = Utils.parseInfo(el.getAttribute("data-info"));
    if (!dataInfo) return;
    const [word, category, ...infos] = dataInfo;

    el.addEventListener("mouseenter", function () {
      let tableHTML = "";
      try {
        if (category === "nom") {
          // data-info: mot;nom;cas;CASE;NUMBER
          const data = dataManager?.wordData.nom?.[word]?.cas;
          const cas    = infos[1]; // e.g. "gen"
          const number = infos[2]; // "s" | "pl"
          if (data) tableHTML = Utils.generateTableNoun(data, cas, number);
        } else if (category === "proper") {
          // data-info: mot;proper;cas;CASE
          const data = dataManager?.wordData.proper?.[word]?.cas;
          const cas  = infos[1]; // e.g. "nomi"
          if (data) tableHTML = Utils.generateTableProper(data, cas);
        } else if (category === "adj" || category === "card" || category === "proposs") {
          // data-info: mot;adj|card|proposs;cas;CASE;GENDER
          const data   = dataManager?.wordData[category]?.[word]?.cas;
          const cas    = infos[1]; // e.g. "nomi"
          const gender = infos[2]; // "m" | "f" | "n" | "pl"
          if (data) tableHTML = Utils.generateTableAdj(data, cas, gender);
        } else if (category === "verb") {
          const v = dataManager?.wordData.verb?.[word];
          if (v) tableHTML = Utils.generateTableVerb(v);
        } else {
          box.style.display = "none";
          return;
        }

        if (tableHTML) {
          box.innerHTML = tableHTML;
          box.style.display = "block";
        }
      } catch (e) {
        // En cas de clé manquante on cache proprement
        box.style.display = "none";
      }
    });

    el.addEventListener("mouseleave", function () {
      box.style.display = "none";
    });
  });
},

  /* coloration + infobulle — version proche de l’original, rétro-compatible avec [[forme,pos],…] */
  applyHoverStyles: function (classesToColors, divId) {
    const container = document.getElementById(divId);
    if (!container) return;

    const elements = container.querySelectorAll(".ukr");

    elements.forEach((element) => {
      // Évite les double-attachments
      if (element.dataset.hoverBound === "1") return;
      element.dataset.hoverBound = "1";

      const raw = element.getAttribute("data-info");
      if (!raw) return;
      const dataInfo = Utils.parseInfo(raw);
      const [word, category, ...infos] = dataInfo;

      // couleur de survol (1re classe correspondante trouvée)
      let hoverColor = "inherit";
      for (const [className, color] of Object.entries(classesToColors)) {
        if (dataInfo.includes(className)) { hoverColor = color; break; }
      }

      element.addEventListener("mouseenter", function () {
        if (this.classList.contains("info-added")) return;
        this.style.color = hoverColor;

        // lemme nominal/verbal selon la catégorie
        let lemmaEntry = null;
        switch (category) {
          case "nom":
            lemmaEntry = dataManager?.wordData.nom?.[word]?.cas?.nomi?.s;
            break;
          case "proposs":
          case "card":
          case "adj":
            lemmaEntry = dataManager?.wordData[category]?.[word]?.cas?.nomi?.m;
            break;
          case "proper":
            lemmaEntry = dataManager?.wordData.proper?.[word]?.cas?.nomi;
            break;
          case "verb":
            lemmaEntry = dataManager?.wordData.verb?.[word]?.inf;
            break;
          case "adv":
            lemmaEntry = dataManager?.wordData.adv?.[word]?.base;
            break;
          default:
            lemmaEntry = null;
        }

        let displayedInfo = "";
        const variantIndex = Utils.getVariantIndex(dataInfo);
        const pair = Utils.firstPair(lemmaEntry, variantIndex); // ← prend la bonne variante

        if (pair) {
          const [mot, pos] = pair;
          const rest = dataInfo.filter((token, index) => {
            if (index === 0) return false;                 // retire le lemme
            if (index === 2 && token === "conj") return false; // masque seulement "conj"
            return true;                                   // garde inf/base/etc.
          });
          displayedInfo = Utils.addAccent(mot, pos) + (rest.length ? "," + rest.join() : "");
        } else {
          const rest = dataInfo.filter((t, i) => !(i === 2 && t === "conj"));
          displayedInfo = rest.join();
        }

        // n’ajoute pas de <sup> si vide → évite la micro-bulle “fantôme”
        if (displayedInfo && displayedInfo.trim()) {
          this.innerHTML += `<sup><em> ${displayedInfo}</em></sup>`;
          this.classList.add("info-added");
        }
      });

      element.addEventListener("mouseleave", function () {
        this.style.color = "";
        if (this.classList.contains("info-added")) {
          this.innerHTML = this.innerHTML.split("<sup>")[0];
          this.classList.remove("info-added");
        }
      });
    });
  },

  // Fonction pour créer la table d'un nom
  generateTableNoun: function (data, cas, gender) {
    if (!data) return "<table></table>";
    let tableHTML = "<table>";
    Object.entries(data).forEach(([caseName, forms]) => {
      tableHTML += `<tr><th colspan="2"><em>${caseName}.</em></th></tr>`;
      Object.entries(forms).forEach(([formKey, entry]) => {
        const pairs = Utils.toPairs(entry);
        const cell = pairs
          .filter(([t]) => t)
          .map(([t, p]) => Utils.addAccent(t, p))
          .join(" / ");
        tableHTML += `
          <tr>
            <td><em>${formKey}.</em></td>
            <td>${caseName === cas && formKey === gender ? "<strong>" + cell + "</strong>" : cell}</td>
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
    let tableHTML = "<table>";
    Object.entries(data).forEach(([caseName, entry]) => {
      const pairs = Utils.toPairs(entry);
      const cell = pairs
        .filter(([t]) => t)
        .map(([t, p]) => Utils.addAccent(t, p))
        .join(" / ");
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
    const gendersOrder = ["m", "f", "n", "pl"];
    let tableHTML = "<table>";
    Object.entries(data)
      .filter(([caseName]) => caseName !== "voc") // on cache vocatif pour compacité
      .forEach(([caseName, formsByGender]) => {
        tableHTML += `<tr><th colspan="2"><em>${caseName}.</em></th></tr>`;
        gendersOrder.forEach((g) => {
          const entry = formsByGender[g];
          if (!entry) return;
          const pairs = Utils.toPairs(entry);
          const cell = pairs
            .filter(([t]) => t)
            .map(([t, p]) => Utils.addAccent(t, p))
            .join(" / ");
          const content = (caseName === cas && g === gender) ? "<strong>" + cell + "</strong>" : cell;
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

  // --------- Fonction pour créer la table d'un VERBE (fenêtre latérale) ---------
  generateTableVerb: function (verbDetails) {
    if (!verbDetails) return "<table></table>";

    // petit util pour rendre une cellule à partir de n'importe quel format
    const renderCell = (entry) => {
      const pairs = Utils.toPairs(entry);
      if (!pairs.length) return "";
      return pairs
        .filter(([t]) => t)
        .map(([t, p]) => Utils.addAccent(t, p))
        .join(" / ");
    };

    let html = "<table>";

    // Infinitif
    html += `<tr><th colspan="3"><em>inf.</em></th></tr>`;
    html += `<tr><td colspan="3">${renderCell(verbDetails.inf)}</td></tr>`;

    const hasPres = !!(verbDetails.conj && verbDetails.conj.pres);
    const persons = ["1p", "2p", "3p"];

    // Présent (si présent)
    if (hasPres) {
      html += `<tr><th colspan="3"><em>pres.</em></th></tr>`;
      persons.forEach((p) => {
        const pd = verbDetails.conj.pres?.[p];
        if (!pd) return;
        html += `
          <tr>
            <td><em>${p}.</em></td>
            <td>${renderCell(pd.s)}</td>
            <td>${renderCell(pd.pl)}</td>
          </tr>
        `;
      });
    }

    // Futur
    if (verbDetails.conj?.fut) {
      html += `<tr><th colspan="3"><em>fut.</em></th></tr>`;
      persons.forEach((p) => {
        const pd = verbDetails.conj.fut?.[p];
        if (!pd) return;
        html += `
          <tr>
            <td><em>${p}.</em></td>
            <td>${renderCell(pd.s)}</td>
            <td>${renderCell(pd.pl)}</td>
          </tr>
        `;
      });
    }

    // Passé
    if (verbDetails.conj?.pass) {
      html += `<tr><th colspan="3"><em>pass.</em></th></tr>`;
      ["m", "f", "n"].forEach((g) => {
        const gd = verbDetails.conj.pass?.[g];
        if (!gd) return;
        html += `
          <tr>
            <td><em>${g}.</em></td>
            <td>${renderCell(gd.s)}</td>
            <td>${renderCell(gd.pl)}</td>
          </tr>
        `;
      });
    }

    // Impératif
    if (verbDetails.conj?.imp) {
      html += `<tr><th colspan="3"><em>imp.</em></th></tr>`;
      ["1p", "2p"].forEach((p) => {
        const pd = verbDetails.conj.imp?.[p];
        if (!pd) return;
        html += `
          <tr>
            <td><em>${p}.</em></td>
            <td>${renderCell(pd.s)}</td>
            <td>${renderCell(pd.pl)}</td>
          </tr>
        `;
      });
    }

    // Impersonnel (ex. читано)
    if (verbDetails.conj?.impers) {
      html += `<tr><th colspan="3"><em>impers.</em></th></tr>`;
      html += `<tr><td colspan="3">${renderCell(verbDetails.conj.impers)}</td></tr>`;
    }

    html += "</table>";

    // Pied : Couple aspectuel (optionnel)
    const coupl = (verbDetails.coupl || "").trim();
    if (coupl) {
      // si la paire existe dans la base, on affiche sa forme d’infinitif accentuée
      const couplInf = dataManager.wordData?.verb?.[coupl]?.inf;
      const couplDisplay = couplInf ? renderCell(couplInf) : coupl;
      html += `<div style="text-align:right; font-style:italic; margin-top:6px;">
                Couple aspectuel : ${couplDisplay}
              </div>`;
    }

    return html;
  },



};
