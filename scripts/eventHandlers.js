let eventHandlers = {
  // Fonction pour attacher les événements de clic
  setupWordListClickEvents: function () {
    const wordList = document.getElementById("wordList");
    if (wordList) {
      // Utiliser la délégation d'événements
      wordList.addEventListener("click", function (event) {
        const target = event.target;

        // Vérifier si l'élément cliqué est un <span> avec la classe 'ukr'
        if (target && target.classList.contains("ukr")) {
          displayManager.displayInfo(target);
        }
      });
    }
  },
  // Fonction pour attacher les événements des phrases d'exemple
  setupExamplePhrasesEventHandlers: function (divId) {
    const wordDetailsContainer = document.getElementById(divId);
    if (wordDetailsContainer) {
      wordDetailsContainer.addEventListener("change", function (event) {
        const target = event.target;
        if (target && target.classList.contains("show-verb-forms-checkbox")) {
          const isChecked = target.checked;
          const verbFormsContainerId = target.getAttribute("data-container");
          const verbFormsContainer =
            document.getElementById(verbFormsContainerId);
          if (verbFormsContainer) {
            if (isChecked) {
              // Récupérer les données depuis les attributs data-*
              const verbe = target.getAttribute("data-verbe");
              const temps = target.getAttribute("data-temps");
              const frag1 = target.getAttribute("data-frag1");
              const frag2 = target.getAttribute("data-frag2");

              // Générer les formes verbales
              const verbFormsHtml = gramFunc.generateVerbForms(
                verbe,
                temps,
                frag1,
                frag2
              );

              // Insérer le contenu dans le conteneur
              verbFormsContainer.innerHTML = verbFormsHtml;

              // Afficher le conteneur
              verbFormsContainer.style.display = "block";

              // Appliquer les accents et réattacher les événements si nécessaire
              accentManager.attachOriginalText();
              accentManager.highlightWords();
            } else {
              // Cacher le conteneur et effacer son contenu
              verbFormsContainer.style.display = "none";
              verbFormsContainer.innerHTML = "";
            }
          }
        }
      });
    }
  },
};
