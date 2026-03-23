import { dataManager } from "./dataManager.js";

export let Utils = {
  // --- i18n / labels ---------------------------------------------------------
  i18n: {
    category: {
      verb: "verbe",
      adj: "adj.",
      proposs: "pron. pos.",
      proper: "pron. per.",
      nom: "nom",
      card: "card.",
      conj: "conj.",   
      adv: "adv.",     
      part: "part.",
      // (on peut compléter: pron, conj, part, adv, prep... si besoin)
    },
    tense: {
      fut: "fut.",
      pres: "prés.",
      pass: "pass.",
      imp: "imp.",
      inf: "inf."
    },
    number: {
      s: "sg",
      pl: "pl"
    }
  },

  labelCategory(cat) { return this.i18n.category[cat] || cat; },
  labelTense(t)    { return this.i18n.tense[t]     || t;   },
  labelNumber(n)   { return this.i18n.number[n]    || n;   },

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
      case "pron": {
        // même structure que adj/card/proposs : cas -> m/f/n/pl
        const [word, functionName, caseType, gender] = infos; // ex: ["цей","cas","gen","m"]
        return (
          dataManager.wordData?.pron?.[word]?.[functionName]?.[caseType]?.[gender] ||
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
        const [word, degree] = infos; // ex: ["багато","base"]
        const key = degree || "base";
        return dataManager.wordData?.adv?.[word]?.[key] ||
               dataManager.wordData?.adv?.[word]?.base ||
               null;
      }
      case "conj": {
        // ex data-info: "але;conj;base" → retourner wordData.conj[word].base
        const [word, degree] = infos;
        const key = degree || "base";
        return dataManager.wordData?.conj?.[word]?.[key] ||
               dataManager.wordData?.conj?.[word]?.base ||
               null;
      }
      case "part": {
        // ex data-info: "не;part;base" → retourner wordData.part[word].base
        const [word, degree] = infos;
        const key = degree || "base";
        return dataManager.wordData?.part?.[word]?.[key] ||
               dataManager.wordData?.part?.[word]?.base ||
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
  
  // --- état de verrouillage (pinned) du panneau grammaire ---
  pinnedEl: null,

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
    adv:  "inherit",
    pron: "inherit",
    part: "inherit"
  },


  // Fonction pour afficher les informations d'un mot au survol
  /* coloration des groupes + infobulle (idempotent + pairs compatible) */
  /* coloration des groupes + infobulle (défensive + idempotent) */
  /* coloration des groupes de mots par cas au survol — version proche de l’original */
  // --- Affichage de la table grammaticale au survol (noms / pronoms / adjectifs / verbes)
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
        // si une fiche est "pinnée", on ne remplace pas le contenu au survol
        if (Utils.pinnedEl) return;

        const html = Utils.buildGrammarTableHTML(word, category, infos);
        if (html) {
          box.innerHTML = html;
          box.style.display = "block";
        } else {
          box.style.display = "none";
        }
      });

      el.addEventListener("mouseleave", function () {
        // si une fiche est "pinnée", on ne masque pas au mouseleave
        if (Utils.pinnedEl) return;
        box.style.display = "none";
      });

      // --- NOUVEAU : clic pour “pinner/dépinner” la fiche ---
      el.addEventListener("click", function (ev) {
        ev.preventDefault();

        // re-clic sur le même élément : on dépinne & on cache
        if (Utils.pinnedEl === el) {
          Utils.pinnedEl = null;
          box.style.display = "none";
          return;
        }

        // clic sur un nouvel élément : on tente d'afficher sa fiche
        const html = Utils.buildGrammarTableHTML(word, category, infos);

        if (html) {
          box.innerHTML = html;
          box.style.display = "block";
          Utils.pinnedEl = el; // on “pin”
        } else {
          // pas de fiche pour cet élément → fermer toute fiche existante
          Utils.pinnedEl = null;
          box.style.display = "none";
        }
      });
    });
  },


  /* coloration + infobulle — version proche de l’original, rétro-compatible avec [[forme,pos],…] */
  applyHoverStyles: function (classesToColors, divId) {
    const container = document.getElementById(divId);
    if (!container) return;

    const elements = container.querySelectorAll(".ukr");

    elements.forEach((element) => {
      // éviter les doubles attachements
      if (element.dataset.hoverBound === "1") return;
      element.dataset.hoverBound = "1";

      const raw = element.getAttribute("data-info");
      if (!raw) return;
      const dataInfo = Utils.parseInfo(raw);
      const [word, category] = dataInfo;

      // couleur de survol (1re classe correspondante trouvée)
      let hoverColor = "inherit";
      for (const [className, color] of Object.entries(classesToColors)) {
        if (dataInfo.includes(className)) { hoverColor = color; break; }
      }

      element.addEventListener("mouseenter", function () {
        this.style.color = hoverColor;

        // 1) Récupère le lemme selon la catégorie (idem avant)
        let lemmaEntry = null;
        switch (category) {
          case "nom":
            lemmaEntry = dataManager?.wordData.nom?.[word]?.cas?.nomi?.s;
            break;
          case "proposs":
          case "card":
          case "adj":
          case "pron":
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
          case "conj":
            lemmaEntry = dataManager?.wordData.conj?.[word]?.base;
            break;
          case "part":
            lemmaEntry = dataManager?.wordData.part?.[word]?.base;
            break;
          default:
            lemmaEntry = null;
        }

        // 2) Construit le texte de l’infobulle (avec i18n)
        const tokens = dataInfo.slice(1); // on retire le lemme
        // supprimer "cas" et "base" qui n'apportent rien ici
        const filtered = tokens.filter(t => t !== "cas" && t !== "base");

        // 🔹 insertion du genre (si disponible) pour les NOMS
        if (category === "nom") {
          const g = dataManager?.wordData?.nom?.[word]?.genre; // "m" | "f" | "n"
          if (g) filtered.splice(1, 0, g);
        }

        // i18n : on remappe la 1re position (catégorie), les temps, et le nombre
        if (filtered.length) {
          // catégorie
          filtered[0] = Utils.labelCategory(filtered[0]);
          // autres tokens (temps/nombre principalement)
          for (let i = 1; i < filtered.length; i++) {
            filtered[i] = Utils.labelTense(filtered[i]);
            filtered[i] = Utils.labelNumber(filtered[i]);
          }
        }

        let bubbleHTML = "";
        const variantIndex = Utils.getVariantIndex(dataInfo);
        const pair = Utils.firstPair(lemmaEntry, variantIndex);

        if (pair) {
          const [mot, pos] = pair;
          const accented = Utils.addAccent(mot, pos);
          bubbleHTML = `<strong>${accented}</strong>${filtered.length ? " &nbsp;<em>" + filtered.join(", ") + "</em>" : ""}`;
        } else {
          bubbleHTML = filtered.length ? `<em>${filtered.join(", ")}</em>` : "";
        }


        // 3) Affiche l’info-bulle au-dessus du mot (aucune insertion dans le flux)
        if (bubbleHTML && bubbleHTML.trim()) {
          Utils.showHoverBubble(this, bubbleHTML);
        }
      });

      element.addEventListener("mouseleave", function () {
        this.style.color = "";
        Utils.hideHoverBubble();
      });
    });
  },

  // Construit le HTML de la fiche grammaire pour un <span.ukr>
  // → ajoute une ligne d’en-tête au-dessus du tableau
  buildGrammarTableHTML(word, category, infos) {
    let table = "";
    try {
      if (category === "nom") {
        const data = dataManager?.wordData.nom?.[word]?.cas;
        const cas    = infos[1]; // e.g. "gen"
        const number = infos[2]; // "s" | "pl"
        if (data) table = Utils.generateTableNoun(data, cas, number);
      } else if (category === "proper") {
        const data = dataManager?.wordData.proper?.[word]?.cas;
        const cas  = infos[1]; // e.g. "nomi"
        if (data) table = Utils.generateTableProper(data, cas);
      } else if (category === "adj" || category === "card" || category === "proposs" || category === "pron") {
        const data   = dataManager?.wordData[category]?.[word]?.cas;
        const cas    = infos[1]; // e.g. "nomi"
        const gender = infos[2]; // "m" | "f" | "n" | "pl"
        if (data) table = Utils.generateTableAdj(data, cas, gender);
      } else if (category === "verb") {
        const v = dataManager?.wordData.verb?.[word];
        if (v) table = Utils.generateTableVerb(v);
      }
    } catch (_) {
      table = "";
    }

    if (!table) return "";

    // 🔹 ajoute l’en-tête au-dessus du tableau
    const header = Utils.buildHeaderLine(word, category);
    return header + table;
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
        const numLbl = Utils.labelNumber(formKey) + ".";
        tableHTML += `
          <tr>
            <td><em>${numLbl}</em></td>
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
  // data: adj[word].cas (et pron[word].cas)
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
    html += `<tr><th colspan="3"><em>${Utils.labelTense("inf")}</em></th></tr>`;
    html += `<tr><td colspan="3">${renderCell(verbDetails.inf)}</td></tr>`;

    const hasPres = !!(verbDetails.conj && verbDetails.conj.pres);
    const persons = ["1p", "2p", "3p"];

    // Présent
    if (hasPres) {
      html += `<tr><th colspan="3"><em>${Utils.labelTense("pres")}</em></th></tr>`;
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
      html += `<tr><th colspan="3"><em>${Utils.labelTense("fut")}</em></th></tr>`;
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
      html += `<tr><th colspan="3"><em>${Utils.labelTense("pass")}</em></th></tr>`;
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
      html += `<tr><th colspan="3"><em>${Utils.labelTense("imp")}</em></th></tr>`;
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

  // --- AJOUT : helpers pour l'info-bulle locale au survol ---
  getOrCreateHoverBubble() {
    let b = document.getElementById("hover-info-bubble");
    if (!b) {
      b = document.createElement("div");
      b.id = "hover-info-bubble";
      // style minimal inline pour éviter le CSS externe
      b.style.position = "absolute";
      b.style.zIndex = "9999";
      b.style.maxWidth = "360px";
      b.style.padding = "6px 8px";
      b.style.borderRadius = "6px";
      b.style.boxShadow = "0 4px 10px rgba(0,0,0,.15)";
      b.style.background = "rgba(255,255,255,.98)";
      b.style.border = "1px solid rgba(0,0,0,.1)";
      b.style.fontSize = "14px";
      b.style.lineHeight = "1.25";
      b.style.display = "none";
      b.style.pointerEvents = "none";
      document.body.appendChild(b);
    }
    return b;
  },

  showHoverBubble(anchorEl, html) {
    const b = this.getOrCreateHoverBubble();
    b.innerHTML = html;
    b.style.display = "block";

    // Positionner au-dessus du mot (centré)
    const rect = anchorEl.getBoundingClientRect();
    // on force un layout pour connaître la taille réelle
    const tmp = b.getBoundingClientRect();
    const bw = tmp.width, bh = tmp.height;

    const top  = window.scrollY + rect.top  - bh - 8;
    const left = window.scrollX + rect.left + (rect.width - bw) / 2;

    b.style.top  = `${Math.max(window.scrollY + 4, top)}px`;
    b.style.left = `${Math.max(window.scrollX + 4, left)}px`;
  },

  hideHoverBubble() {
    const b = document.getElementById("hover-info-bubble");
    if (b) b.style.display = "none";
  },

  // Rend la "forme principale" (avec accent) selon la catégorie
  getPrincipalForm(word, category) {
    try {
      switch (category) {
        case "nom": {
          const entry = dataManager?.wordData?.nom?.[word];
          const p = Utils.firstPair(entry?.cas?.nomi?.s);
          if (p) return Utils.addAccent(p[0], p[1]);
          break;
        }
        case "adj":
        case "card":
        case "proposs":
        case "pron": {
          const entry = dataManager?.wordData?.[category]?.[word];
          const p = Utils.firstPair(entry?.cas?.nomi?.m);
          if (p) return Utils.addAccent(p[0], p[1]);
          break;
        }
        case "proper": {
          const entry = dataManager?.wordData?.proper?.[word];
          const p = Utils.firstPair(entry?.cas?.nomi);
          if (p) return Utils.addAccent(p[0], p[1]);
          break;
        }
        case "verb": {
          const entry = dataManager?.wordData?.verb?.[word];
          const p = Utils.firstPair(entry?.inf);
          if (p) return Utils.addAccent(p[0], p[1]);
          break;
        }
        default:
          break;
      }
    } catch (_) {}
    // fallback : on retourne le lemme nu
    return word || "";
  },

  buildHeaderLine(word, category) {
    // catégorie + compléments
    let meta = Utils.labelCategory(category);
    if (category === "verb") {
      const asp = dataManager?.wordData?.verb?.[word]?.asp;
      if (asp === "imperfectif") meta += ", imperf.";
      else if (asp === "perfectif") meta += ", perf.";
    } else if (category === "nom") {
      const g = dataManager?.wordData?.nom?.[word]?.genre;
      if (g) meta += `, ${g}`;
    }
    const head = Utils.getPrincipalForm(word, category);
    return `
      <div class="lemma-head"
           style="margin:6px 0 8px; padding:6px 8px; border-radius:6px;
                  background:rgba(0,0,0,.04); font-size:15px;">
        <strong style="font-weight:600;">${head}</strong>
        <span style="opacity:.8;"> — ${meta}</span>
      </div>
    `;
  },



};
