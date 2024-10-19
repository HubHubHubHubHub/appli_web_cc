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

    // Crée le mot avec la lettre entourée d'un span
    const highlightedWord =
      word.slice(0, position) +
      `<span class="${classe}">` +
      word[position] +
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
};
