document.addEventListener("DOMContentLoaded", function () {
  // Charger les données des phrases
  dataManager
    .loadPhrasesData()
    .then(function () {
      // Initialiser l'affichage des phrases
      displayPhrases(dataManager.phraseData);

      // Attacher l'événement de recherche
      const searchBar = document.getElementById("searchBar");
      searchBar.addEventListener("input", function () {
        const searchQuery = searchBar.value.trim();
        const filteredPhrases = filterPhrases(
          dataManager.phraseData,
          searchQuery
        );
        displayPhrases(filteredPhrases);
      });
    })
    .catch(function (error) {
      console.error("Erreur lors du chargement des phrases :", error);
    });
});

// Fonction pour afficher les phrases dans le DOM
function displayPhrases(phrasesData) {
  const phraseList = document.getElementById("phraseList");
  phraseList.innerHTML = ""; // Vider la liste

  // Parcourir les phrases et les ajouter à la liste
  for (const [phraseKey, phraseInfo] of Object.entries(phrasesData)) {
    const listItem = document.createElement("li");

    // Créer les éléments pour la phrase et la traduction
    const phraseHtml = document.createElement("div");
    phraseHtml.classList.add("phrase-html");
    phraseHtml.innerHTML = phraseInfo.phrase_html;

    const traduction = document.createElement("div");
    traduction.classList.add("traduction");
    traduction.textContent = phraseInfo.traduction;

    // Afficher les références (optionnel)
    if (phraseInfo.ref) {
      const refDiv = document.createElement("div");
      refDiv.classList.add("references");
      refDiv.textContent = `Références : ${JSON.stringify(phraseInfo.ref)}`;
      listItem.appendChild(refDiv);
    }

    // Ajouter les éléments au listItem
    listItem.appendChild(phraseHtml);
    listItem.appendChild(traduction);

    // Ajouter le listItem à la liste
    phraseList.appendChild(listItem);
  }

  // Appliquer les accents si nécessaire (si vous avez une fonctionnalité pour cela)
  if (typeof accentManager !== "undefined") {
    accentManager.attachOriginalText();
    accentManager.highlightWords();
  }
  // Appliquer les styles de survol après l'affichage des mots
  Utils.applyHoverStyles(Utils.classesToColors, "phraseList");
  // Activer les infos gramaticales au survol
  Utils.applyHoverInfo("phraseList");
}

// Fonction pour filtrer les phrases en fonction de la requête de recherche
function filterPhrases(phrasesData, searchQuery) {
  if (!searchQuery) {
    // Si la requête est vide, retourner toutes les phrases
    return phrasesData;
  }

  // Diviser la requête en termes de recherche individuels
  const searchTerms = searchQuery.toLowerCase().split(/\s+/);

  // Filtrer les phrases
  const filteredData = {};

  for (const [phraseKey, phraseInfo] of Object.entries(phrasesData)) {
    const ref = phraseInfo.ref || {};

    // Combiner les clés et valeurs du champ ref en une seule chaîne
    let refString = "";
    for (const [key, value] of Object.entries(ref)) {
      refString += ` ${key} ${value}`;
    }

    // Vérifier si tous les termes de recherche sont présents dans refString
    const isMatch = searchTerms.every((term) =>
      refString.toLowerCase().includes(term)
    );

    if (isMatch) {
      filteredData[phraseKey] = phraseInfo;
    }
  }

  return filteredData;
}
