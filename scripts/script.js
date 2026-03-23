// script.js
import { dataManager } from "./dataManager.js";
import { displayManager } from "./displayManager.js";
import { accentManager } from "./accentManager.js";
import { eventHandlers } from "./eventHandlers.js";

document.addEventListener("DOMContentLoaded", async function () {
  try {
    // Attend le chargement de data.json
    await dataManager.loadWordData();

    // Attend le chargement de phrases.json
    await dataManager.loadPhrasesData();

    // Exécute les initialisations
    displayManager.displayWordList(); // Affiche la liste des mots
    accentManager.setupAccentHighlighting(); // Initialise la fonctionnalité après le chargement des données
    eventHandlers.setupWordListClickEvents(); // Attache les événements de clic sur les éléments de la liste
  } catch (error) {
    console.error("Erreur lors du chargement des fichiers JSON:", error);
  }
});
