Alphabet Ukrainien sur une ligne :
А Б В Г Ґ Д Е Є Ж З И І Ї Й К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ь Ю Я


######## Sidebar : double dépliage (catégorie + lettre) ########

La sidebar WordList utilise un système de double dépliage hiérarchique :
- Niveau 1 : catégories grammaticales (Noms, Adjectifs, Verbes…)
- Niveau 2 : première lettre ukrainienne à l'intérieur de chaque catégorie

Les mots sont triés selon l'alphabet ukrainien (voir ukrainianSort.js).
État initial : catégories dépliées, groupes de lettres repliés.
Contrôles : chevron par catégorie/lettre, bouton ± par catégorie,
bouton global « Tout déplier / replier » en haut de la sidebar.



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

########  Refactorisation du code:  ########
pour mimer des modules (en ES6 on peut utiliser des modules, mais là on fait quelquechose de similaire en utilisant des objets)
on encapsule les fonctions dans un objet, et on les appelle avec la notation objet.fonction() :

Dans le fichier utils.js :

var Utils = {
  // Fonction pour parser l'information à partir de l'attribut data-info
  parseInfo: function (info) {
    return info.split(";");
  },

  // Fonction pour ajouter un accent au mot à la position spécifiée
  addAccent: function (word, accentPosition) {
    if (!word) {
      return ""; // Retourne une chaîne vide si 'word' est null ou undefined
    }
    const accent = "\u0301"; // Accent aigu combiné
    const chars = Array.from(word);
    if (accentPosition > 0 && accentPosition <= chars.length) {
      chars[accentPosition - 1] += accent;
    }
    return chars.join("");
  },
};

On appelle ensuite les fonctions avec la notation objet.fonction() : Utils.parseInfo(info) et Utils.addAccent(word, accentPosition)

Remarque: si on a besoin d'une variable globale (ce qui est le cas par défaut quand on 
encapsule pas dans une autre variable ou fonction), on peut utiliser window.variable = valeur;


######## Correspondance entre dataset et Attributs data-* ########

En JavaScript, les attributs HTML personnalisés commençant par data- sont accessibles via la propriété dataset de l'élément DOM. Par exemple :

Attribut HTML : data-original="valeur"
Propriété JavaScript : element.dataset.original = "valeur"

####### Checkbox accent #######

Pour qu'elle soit cochée par défaut, on ajoute l'attribut checked à la balise <input> :
 <input type="checkbox" id="accent-check" checked />
 au lieu de : 

  <input type="checkbox" id="accent-check"/>


###### Gestion des accents et format bdd ###############


Il peut y a avoir plusieurs variantes d'accent pour le même mot. 

On choisit donc le format suivant pour la bdd 

    "я": {
      "cas": {
        "nomi": [["я", -1]],
        "gen": [["мене", 4], ["мене", 2]],
        "dat": [["мені", 4]],
        "acc": [["мене", 4], ["мене", 2]],
        "ins": [["мною", 3]],
        "loc": [["мені", 4]]
      },
      "base_html": "<span class=\"ukr\" data-info=\"я;proper;cas;nomi\">я</span>"
    },

Remarque : l'application accepte des formats plus anciens grâce à des 
fonctions de conversion dans utils.js

Comment choisir la variante d'accent ? Si ce n'est pas le premier 
choix de la liste (choix par défaut), on précise la variante dans 
le format html dans data-info par var=n : 

  "expl":{
    "phrase_html":"<span class=\"ukr\" data-info=\"я;proper;cas;acc;var=1\">мене</span> <span class=\"ukr\" data-info=\"я;proper;cas;acc\">мене</span>",
    "traduction":"– Moi ? – Non, pas moi.",
    "ref": { "Olena Saint-Joanis": "L1,Cours5,Version5.7.25" }
  }


  ############## Formatage des json ###########################


  à la demande : ⇧⌥F (maj + option + F)



  ########## NOOJ #################

  besoin de générer les comparatifs et les superlatifs
  -> absents dans gorox 
• nécessité aussi de mettre les accents. 

ex: "І цей вибір не випадковий: Rafale — один із найефективніших та найгнучкіших бойових літаків сучасності."

On a accès seulement à 
ефективний
гнучкий
