document.addEventListener("DOMContentLoaded", function () {
  // Charge le fichier JSON
  dataManager.loadWordData(() => {
    displayManager.displayWordList(); // Affiche la liste des mots
    accentManager.setupAccentHighlighting(); // Initialise la fonctionnalité après le chargement des données
    eventHandlers.setupWordListClickEvents(); // Attache les événements de clic sur les éléments de la liste
  });
});
