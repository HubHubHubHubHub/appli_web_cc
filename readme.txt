
Accents

Si le mot est d'une seul syllabe, l'accent est noté à -1 dans le fichier json.

Si l'accent est inconnu, il est noté à -2 dans le fichier json.


Teaps javascript :

plutôt qu'écrire la condition suivante :
if (
    wordData &&
    wordData[category] &&
    wordData[category][word] &&
    wordData[category][word][functionName] &&
    wordData[category][word][functionName][caseType] &&
    wordData[category][word][functionName][caseType][gender]
  ) {
    return wordData[category][word][functionName][caseType][gender];
  }
  return null; // Retourne null si une des propriétés n'existe pas
}

on peut utilliser l'opérateur ?. pour simplifier le code :

let [word, functionName, caseType, gender] = infos;
      return (
        wordData?.[category]?.[word]?.[functionName]?.[caseType]?.[gender] ||
        null
      );