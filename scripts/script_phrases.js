// script_phrases.js

document.addEventListener("DOMContentLoaded", async function () {
  try {
    // Attend le chargement de data.json
    await dataManager.loadWordData();

    // Attend le chargement de phrases.json
    await dataManager.loadPhrasesData();

    // Exécute les initialisations
    accentManager.setupAccentHighlighting(); // Initialise la fonctionnalité après le chargement des données
    eventHandlers.setupWordListClickEvents(); // Attache les événements de clic sur les éléments de la liste
  } catch (error) {
    console.error("Erreur lors du chargement des fichiers JSON:", error);
  }
});
