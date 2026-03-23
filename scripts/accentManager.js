import { Utils } from "./utils.js";

export let accentManager = {
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
        const dataInfo = Utils.parseInfo(word.getAttribute("data-info"));
        const [lemma, categorie, ...rest] = dataInfo;
        const infos = [lemma, ...rest];
        const variantIndex = Utils.getVariantIndex(dataInfo);

        const entry = Utils.getDataFromJson(categorie, infos);
        if (entry) {
          const pair = Utils.firstPair(entry, variantIndex); // [[form,pos],...] → 1er par pour variantIndex=0
          if (pair && Number.isInteger(pair[1]) && pair[1] > 0) {
            const pos0 = pair[1] - 1;
            word.innerHTML = Utils.highlightLetter(word.dataset.original, pos0, "accent");
            return;
          }
        }
        // pas d’info d’accent → texte brut
        word.innerHTML = word.dataset.original;
      } else {
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
