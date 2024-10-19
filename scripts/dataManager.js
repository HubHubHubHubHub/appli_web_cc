// Chargement des données JSON
dataManager = {
  wordData: {},

  loadWordData: function (callback) {
    fetch("../data.json")
      .then((response) => response.json())
      .then((json) => {
        dataManager.wordData = json;
        if (typeof callback === "function") {
          callback();
        }
      })
      .catch((error) =>
        console.error("Erreur lors du chargement du fichier JSON:", error)
      );
  },
};
