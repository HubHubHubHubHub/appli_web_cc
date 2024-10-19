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
};
