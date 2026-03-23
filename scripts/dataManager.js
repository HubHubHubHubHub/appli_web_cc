// dataManager.js

export const dataManager = {
  wordData: {},
  phraseData: {},

  loadWordData: function () {
    return fetch("../data.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors du chargement de data.json");
        }
        return response.json();
      })
      .then((json) => {
        this.wordData = json;
        return json;
      });
  },

  loadPhrasesData: function () {
    return fetch("../phrases.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors du chargement de phrases.json");
        }
        return response.json();
      })
      .then((json) => {
        this.phraseData = json;
        return json;
      });
  },
};
