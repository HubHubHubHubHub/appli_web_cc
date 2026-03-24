/**
 * Filtre les phrases en fonction d'une requête de recherche.
 * Logique AND multi-termes sur les métadonnées ref.
 */
export function filterPhrases(phrasesData, searchQuery) {
  if (!searchQuery) return phrasesData;

  const searchTerms = searchQuery.toLowerCase().split(/\s+/);

  const filteredData = {};

  for (const [phraseKey, phraseInfo] of Object.entries(phrasesData)) {
    const ref = phraseInfo.ref || {};

    let refString = "";
    for (const [key, value] of Object.entries(ref)) {
      refString += ` ${key} ${value}`;
    }

    const isMatch = searchTerms.every((term) => refString.toLowerCase().includes(term));

    if (isMatch) {
      filteredData[phraseKey] = phraseInfo;
    }
  }

  return filteredData;
}
