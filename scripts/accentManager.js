let accentManager = {
  isAccentChecked: false, // Variable pour suivre l'état de la checkbox
  // Fonction pour configurer la mise en surbrillance des accents
  setupAccentHighlighting: function () {
    const checkbox = document.getElementById("accent-check");

    // Sauvegarder le texte original
    accentManager.attachOriginalText();

    // Mettre à jour l'état de la checkbox
    accentManager.isAccentChecked = checkbox.checked;

    checkbox.addEventListener("change", function () {
      accentManager.isAccentChecked = checkbox.checked; // Mettre à jour l'état de la checkbox
      accentManager.highlightWords(); // Appliquer ou supprimer les accents selon l'état actuel
    });

    // Initialiser les accents au chargement initial si la case est cochée
    accentManager.highlightWords();
  },
  // Fonction pour appliquer ou supprimer les accents
  highlightWords: function () {
    const words = document.querySelectorAll(".ukr");
    words.forEach(function (word) {
      if (accentManager.isAccentChecked) {
        // Récupérer les informations depuis l'attribut data-info
        const dataInfo = Utils.parseInfo(word.getAttribute("data-info"));
        // Déstructuration
        let [a, b, ...tab2] = dataInfo;
        // Assignations
        const categorie = b;
        const infos = [a, ...tab2];
        if (categorie && infos) {
          // Récupérer la position de l'accent depuis le fichier JSON
          const jsonData = Utils.getDataFromJson(categorie, infos);
          if (jsonData) {
            const position = jsonData[1] - 1; // La position est à l'index 1 du tableau
            word.innerHTML = Utils.highlightLetter(
              word.dataset.original,
              position,
              "accent"
            );
          }
        }
      } else {
        // Réinitialiser le texte d'origine
        word.innerHTML = word.dataset.original;
      }
    });
  },
  // Fonction pour sauvegarder le texte original des éléments
  attachOriginalText: function () {
    const words = document.querySelectorAll(".ukr");
    words.forEach(function (word) {
      if (!word.dataset.original) {
        word.dataset.original = word.textContent; // Sauvegarde la valeur originale dans l'attribut HTML data-original
      }
    });
  },
};
