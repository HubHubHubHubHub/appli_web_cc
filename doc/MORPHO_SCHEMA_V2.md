# Schéma d'annotation morphosyntaxique ukrainien — V2

Ce document décrit le format V2 des annotations morphologiques utilisées dans `data.json` et `phrases.json`. Le format V2 remplace le format positionnel V1 (documenté dans `MORPHO_SCHEMA.md`) par un format **clé=valeur** aligné avec le dictionnaire NooJ ukrainien (157 559 entrées).

## Format général

### `data-info` dans `phrases.json`

```html
<span class="ukr" data-info="LEMME;pos=POS;key=val;key=val;...">FORME</span>
```

- **`class="ukr"`** — constant, identifie toutes les balises ukrainiennes
- Le premier champ (avant le `;`) est toujours le **lemme** (forme de citation)
- Les champs suivants sont des paires **clé=valeur** séparées par `;`

### Bloc `meta` dans `data.json`

Chaque entrée de `data.json` porte un objet `meta` regroupant les traits morphologiques :

```json
"машина": {
  "meta": { "pos": "noun", "nounType": "common", "gender": "f" },
  "cas": { ... },
  "nooj": { ... }
}
```

---

## 1. Catégories (`pos`)

13 catégories possibles, alignées avec les POS NooJ. 9 catégories actuellement peuplées dans `data.json` (742 entrées).

| `pos`    | POS NooJ                | Paradigme                                  | Exemples                  |
| -------- | ----------------------- | ------------------------------------------ | ------------------------- |
| `noun`   | NOUN                    | déclinaison 7 cas x 2 nombres              | машина, гараж, стіл       |
| `verb`   | VERB                    | conjugaison / infinitif / impératif        | читати, поставити, бігати |
| `adj`    | ADJ + PRONOUN adj-like  | déclinaison adjectivale (7 cas x m/f/n/pl) | великий, мій, цей, який   |
| `pron`   | PRONOUN idiosyncratique | paradigmes uniques (7 cas, pas de genre)   | я, він, хто, що, себе     |
| `num`    | NUMERAL                 | cardinal/collectif/quantitatif             | два, двоє, кілька         |
| `adv`    | ADVERB                  | invariable (+ degrés de comparaison)       | швидко, завтра, дуже      |
| `prep`   | PREP                    | invariable                                 | у, за, з, до, про         |
| `conj`   | CONJ                    | invariable                                 | і, та, але, що, якщо      |
| `part`   | PARTICLE                | invariable                                 | не, ні, так, хай          |
| `intj`   | INTJ                    | invariable                                 | ой, ах                    |
| `pred`   | PREDICATIVE             | invariable (43 entrées NooJ)               | можна, треба, варто, слід |
| `insert` | INSERT                  | invariable (31 entrées NooJ)               | мабуть, мовляв, може      |
| `x`      | —                       | inclassable / étranger                     | ok, wifi                  |

### Correspondance V1 -> V2

| Clé V1    | `pos` V2 | Notes                                                                    |
| --------- | -------- | ------------------------------------------------------------------------ |
| `nom`     | `noun`   |                                                                          |
| `verb`    | `verb`   |                                                                          |
| `adj`     | `adj`    |                                                                          |
| `proper`  | `pron`   | Pronoms personnels (paradigme idiosyncratique)                           |
| `proposs` | `adj`    | Possessifs : `adjType=poss`, `syntax=pron_poss`                          |
| `pron`    | `adj`    | Démonstratifs/relatifs : `adjType=dem\|rel`, `syntax=pron_dem\|pron_rel` |
| `card`    | `num`    | `numType=card`                                                           |
| `adv`     | `adv`    |                                                                          |
| `prep`    | `prep`   |                                                                          |
| `conj`    | `conj`   |                                                                          |
| `part`    | `part`   |                                                                          |

### Exemples V1 -> V2

```
V1: завтра;nom;cas;acc;s   ->  завтра;pos=adv;advType=time
V1: тоді;conj;base         ->  тоді;pos=adv;advType=time
V1: можна;adv;base         ->  можна;pos=pred
```

### Règle PRONOUN NooJ

- Les PRONOUN NooJ à **FLX adj-like** (ВЕЛИКИЙ, ОЦЕЙ, ЯКИЙ, КОЖНИЙ...) -> `pos=adj` en V2
- Les PRONOUN NooJ à **paradigme idiosyncratique** (FLX=Я, ВІН, ХТО, ЩО, СЕБЕ) -> `pos=pron` en V2

---

## 2. Sous-types lexicaux

### `nounType` / `nounSubtype`

- `nounType` : `common` | `proper`
- `nounSubtype` (si proper) : `fname` | `lname` | `toponym` | `city` | `country` | `ethnicity` | `language` | `animal` | `abbr`

Les sous-types correspondent aux traits NooJ sur les NOUN+Proper.

```
V1: Василь;nom;cas;gen;s
V2: Василь;pos=noun;nounType=proper;nounSubtype=fname;case=gen;number=sg
```

### `adjType`

`poss` | `dem` | `rel` | `tot` | `emph` | `ord` | `indef` | `neg` | `belong`

> **Convention** : `adjType` absent = qualificatif ordinaire. On ne met pas `adjType=qual` explicitement (coherent avec le principe : absent = valeur par defaut).

```
V1: великий;adj;cas;nomi;m      ->  великий;pos=adj;case=nom;gender=m;number=sg
V1: ця;adj;cas;nomi;f           ->  цей;pos=adj;adjType=dem;case=nom;gender=f;number=sg
V1: його;proposs;cas;gen;m      ->  його;pos=adj;adjType=poss;case=gen;gender=m;number=sg
V1: п'ятий;adj;cas;nomi;m      ->  п'ятий;pos=adj;adjType=ord;case=nom;gender=m;number=sg
```

### `pronType`

`pers` | `refl` | `inter` | `indef`

Seuls les PRONOUN NooJ à paradigme idiosyncratique (pas de sous-niveau genre dans le paradigme).

```
V1: я;proper;cas;dat        ->  я;pos=pron;pronType=pers;case=dat
V1: себе;pron;cas;acc       ->  себе;pos=pron;pronType=refl;case=acc
```

### `numType`

`card` | `coll` | `quant`

- `coll` = collectifs NooJ (двоє, троє, четверо... -- 27 entrées)
- `quant` = quantitatifs (кілька, багато, декілька...)

```
V1: два;card;cas;nomi;m     ->  два;pos=num;numType=card;case=nom;gender=m
```

### `conjType`

`coord` | `subord`

```
V1: але;conj;base   ->  але;pos=conj;conjType=coord
V1: що;conj;base    ->  що;pos=conj;conjType=subord
```

### `advType`

`manner` | `time` | `place` | `quantity` | `intensity` | `reason` | `inter` | `indef` | `dem` | `neg`

Correspond aux traits semantiques NooJ sur les ADVERB.

```
V1: завтра;nom;cas;acc;s   ->  завтра;pos=adv;advType=time
V1: тут;adv;base           ->  тут;pos=adv;advType=place
V1: дуже;adv;base          ->  дуже;pos=adv;advType=intensity
```

### `adjDegree` / `advDegree`

`comp` | `super`

```
V1: більший;adj;cas;nomi;m     ->  більший;pos=adj;adjDegree=comp;case=nom;gender=m;number=sg
```

---

## 3. Traits verbaux

| Champ        | Valeurs                           | Notes                                                                                |
| ------------ | --------------------------------- | ------------------------------------------------------------------------------------ |
| `verbForm`   | `fin` \| `inf` \| `imp` \| `conv` | V1 `conj` -> `fin`, V1 `inf` -> `inf`                                                |
| `tense`      | `pres` \| `past` \| `fut`         | V1 `pass` -> `past`                                                                  |
| `person`     | `1` \| `2` \| `3`                 | V1 `1p` -> `1`, `2p` -> `2`, `3p` -> `3`                                             |
| `gender`     | `m` \| `f` \| `n`                 | passe uniquement (accord en genre, pas en personne)                                  |
| `number`     | `sg` \| `pl`                      | V1 `s` -> `sg`                                                                       |
| `aspect`     | `impf` \| `perf` \| `biaspect`    | V1 `"imperfectif"` -> `impf`, `"perfectif"` -> `perf`, `"biaspectuel"` -> `biaspect` |
| `motionType` | `det` \| `indet`                  | NooJ `+Motion+Determinate/Indeterminate`                                             |

### Aspect

L'aspect est renseigne dans `meta.aspect` sur l'entree du verbe dans `data.json`.

| V2         | V1                 | Signification                        | Exemple                        |
| ---------- | ------------------ | ------------------------------------ | ------------------------------ |
| `impf`     | `"imperfectif"`    | Imperfectif                          | читати, бачити, ставити        |
| `perf`     | `"perfectif"`      | Perfectif                            | прочитати, побачити, поставити |
| `biaspect` | `"biaspectuel"`    | Biaspectuel                          | атакувати, ігнорувати          |
| _(absent)_ | _(absent ou faux)_ | Non tranche -- verification en cours |                                |

Le champ `meta.couple` indique le couple aspectuel : pour un verbe imperfectif, le perfectif correspondant, et vice versa. Pour un biaspectuel, `couple` est absent.

### Biaspectualite et verbes `Pair="X/X"` dans NooJ

Le dictionnaire NooJ ukrainien contient **338 verbes** ou `Pair="X/X"` (meme graphie des deux cotes). On **ne peut pas** conclure mecaniquement qu'ils sont tous biaspects.

**Pourquoi ?** En ukrainien, certains couples aspectuels ne se distinguent que par l'accent :

| Imperfectif | Perfectif | Graphie NooJ        |
| ----------- | --------- | ------------------- |
| виклика́ти   | ви́кликати | викликати/викликати |
| висипа́ти    | ви́сипати  | висипати/висипати   |

NooJ n'ayant pas les accents, il ne peut pas les differencier graphiquement.

**La preuve formelle** : `викликати` a `Pair="викликати/викликати"` mais **deux paradigmes de conjugaison differents** :

- `FLX=ЧИТАТИ` -- paradigme imperfectif
- `DRV=0:ПЛАКАТИ_PF` -- paradigme perfectif

Ce n'est pas un biaspectuel, c'est un **couple par accent**. 5 verbes dans le dictionnaire NooJ montrent cette situation de facon certaine : `викликати`, `закликати`, `накликати`, `розсипати`, `скликати`.

**Regle de verification** : pour tout verbe `Pair="X/X"` dans NooJ, il faut verifier les accents sur [goroh.pp.ua](https://goroh.pp.ua/Словозміна/) avant de conclure :

- Si goroh indique **двовидове** (biaspectuel) et un accent unique -> `aspect: "biaspect"`
- Si les accents de l'infinitif different entre les deux paradigmes -> couple par accent, creer deux entrees
- Tant que la verification n'est pas faite, `aspect` est **absent** (= non tranche)

**Verifications effectuees** :

| Verbe      | goroh     | Accent              | Resultat   |
| ---------- | --------- | ------------------- | ---------- |
| атакувати  | двовидове | атакува́ти (unique)  | `biaspect` |
| ігнорувати | двовидове | ігнорува́ти (unique) | `biaspect` |

C'est aussi un argument majeur pour le projet d'ajout des accents a NooJ (#51) -- avec les accents, NooJ pourrait distinguer ces cas automatiquement.

### Verbes de mouvement

Les verbes de mouvement ukrainiens forment des paires determine/indetermine :

| `motionType` | Signification                      | Exemples                                                        |
| ------------ | ---------------------------------- | --------------------------------------------------------------- |
| `det`        | Mouvement determine (directionnel) | іти, бігти, їхати, нести, летіти, плисти, везти, вести          |
| `indet`      | Mouvement indetermine (habituel)   | ходити, бігати, їздити, носити, літати, плавати, возити, водити |

Source NooJ : `+Motion+Determinate` / `+Motion+Indeterminate`.

Le champ `meta.motionPair` indique le lemme du partenaire de mouvement (determine <-> indetermine). A ne pas confondre avec `meta.couple` (couple aspectuel impf <-> perf).

```json
"бігати": {
  "meta": {
    "pos": "verb", "aspect": "impf",
    "motionType": "indet", "motionPair": "бігти",
    "couple": "побігати"
  }
}

"бігти": {
  "meta": {
    "pos": "verb", "aspect": "impf",
    "motionType": "det", "motionPair": "бігати",
    "couple": "побігти"
  }
}
```

| Champ `meta` | Lien                                | Exemple             |
| ------------ | ----------------------------------- | ------------------- |
| `couple`     | couple aspectuel (impf <-> perf)    | бачити <-> побачити |
| `motionPair` | couple de mouvement (det <-> indet) | бігти <-> бігати    |

### Exemples V1 -> V2

```
V1: ставити;verb;conj;pres;1p;s
V2: ставити;pos=verb;verbForm=fin;tense=pres;person=1;number=sg;aspect=impf

V1: поставити;verb;conj;pass;m;s
V2: поставити;pos=verb;verbForm=fin;tense=past;gender=m;number=sg;aspect=perf

V1: атакувати;verb;inf
V2: атакувати;pos=verb;verbForm=inf  (aspect dans meta = "biaspect")

V1: бігати (gramm: "verbe de déplacement indéterminé")
V2: meta.motionType = "indet"
```

---

## 4. Traits nominaux

| Champ        | Valeurs           | Source NooJ                          |
| ------------ | ----------------- | ------------------------------------ |
| `gender`     | `m` \| `f` \| `n` | `+Masculine`, `+Feminine`, `+Neuter` |
| `animacy`    | `anim` \| `inan`  | `+Animate` (26 566 entrees NooJ)     |
| `plurTantum` | `true`            | `+Pl` -- гроші, штани, двері...      |
| `diminutive` | `true`            | `+Dim`                               |

`animacy`, `plurTantum` et `diminutive` sont dans `meta` sur l'entree de `data.json` uniquement.

`gender` est present **a la fois** dans `meta` (sur l'entree) et dans le `data-info` des phrases. Raison : la bulle de survol peut afficher « nom feminin » directement sans lookup dans `data.json`.

### Exemples V1 -> V2

```
V1: гроші;nom;cas;nomi;pl
V2: гроші;pos=noun;case=nom;number=pl;gender=f
    meta: { pos: "noun", gender: "f", plurTantum: true }

V1: кошеня;nom;cas;nomi;s
V2: кошеня;pos=noun;case=nom;number=sg;gender=n
    meta: { pos: "noun", gender: "n", animacy: "anim" }

V1: машина;nom;cas;acc;s
V2: машина;pos=noun;case=acc;number=sg;gender=f
```

---

## 5. Notation

| Valeur  | Description                              | Exemples        |
| ------- | ---------------------------------------- | --------------- |
| `digit` | Chiffres arabes                          | 17, 2024, 3     |
| `roman` | Chiffres romains                         | XXI, III, VII   |
| `abbr`  | Abreviation ordinale (chiffre + suffixe) | 6-й, 6-го, 1-ша |
| `date`  | Date (futur -- via graphes NooJ)         | 25.03.2026      |
| `time`  | Heure (futur -- via graphes NooJ)        | 14:30           |

Le champ `notation` pilote le bouton **Epeler** dans l'interface. Le lemme est toujours la forme en toutes lettres.

```html
<span class="ukr" data-info="сімнадцять;pos=num;numType=card;notation=digit;case=gen">17</span>
<!-- Epele -> сімнадцяти -->

<span class="ukr" data-info="шостий;pos=adj;adjType=ord;notation=abbr;case=nom;gender=m;number=sg"
  >6-й</span
>
<!-- Epele -> шостий -->
```

Si `notation` est absent, le mot est deja en toutes lettres -- le bouton Epeler ne s'applique pas.

---

## 6. Champ `syntax`

Pilote le **regroupement sidebar** (vue syntaxique). Permet de regrouper des mots de `pos` differents dans un meme groupe UI.

| `syntax`     | Groupe sidebar          | `pos` morphologique     |
| ------------ | ----------------------- | ----------------------- |
| `pron_pers`  | Pronoms > Personnels    | `pron`                  |
| `pron_refl`  | Pronoms > Reflechi      | `pron`                  |
| `pron_poss`  | Pronoms > Possessifs    | `adj` (adjType=poss)    |
| `pron_dem`   | Pronoms > Demonstratifs | `adj` (adjType=dem)     |
| `pron_rel`   | Pronoms > Relatifs      | `adj` (adjType=rel)     |
| `pron_inter` | Pronoms > Interrogatifs | `pron` (pronType=inter) |
| `pron_indef` | Pronoms > Indefinis     | `pron`/`adj`            |
| `pron_neg`   | Pronoms > Negatifs      | `pron`/`adj`            |
| `pron_tot`   | Pronoms > Totalisants   | `adj` (adjType=tot)     |
| `pron_emph`  | Pronoms > Emphatiques   | `adj` (adjType=emph)    |

Exemple : `мій` a `pos=adj` (morphologie : se decline comme un adjectif) mais `syntax=pron_poss` (UI : affiche sous Pronoms > Possessifs).

```
V1: я;proper;cas;dat      ->  pos=pron, pronType=pers, syntax=pron_pers
V1: його;proposs;cas;...  ->  pos=adj, adjType=poss, syntax=pron_poss
V1: цей;pron;cas;...      ->  pos=adj, adjType=dem, syntax=pron_dem
```

### Structure sidebar actuelle

Le registre `src/lib/utils/morphoRegistry.js` definit les groupes. Les groupes avec `flat: true` affichent les mots directement sans regroupement alphabetique.

```
Noms (280)
Adjectifs (148 — qualificatifs sans syntax)
Pronoms
  ├── Personnels (8, flat, ordre: я ти він вона воно ми ви вони)
  ├── Possessifs (9, flat, ordre: мій твій його її наш ваш свій їхній їх)
  ├── Démonstratifs (12, flat)
  ├── Interrogatifs (6, flat, ordre: хто що який чий котрий скільки)
  ├── Réfléchi (1, flat: себе)
  ├── Négatifs (6, flat)
  └── Indéfinis (~21, alphabétique)
Verbes (98)
Numéraux (9)
Adverbes (24)
Mots invariables
  ├── Prépositions (11)
  ├── Conjonctions (9)
  └── Particules (6)
```

Les mots de la sidebar sont affiches via `getPrincipalForm()` (texte accentue statique), pas via `HtmlContent` + DOM. Le clic selectionne le mot et sette `uiStore.selectedCategory` avec le vrai `pos` (via `posLookup`), pas la cle du groupe sidebar.

---

## 7. Traits des invariables

### `governs` (prepositions)

Le champ `meta.governs` liste les cas regis par une preposition. Il est affiche dans la bulle de survol et le panneau de details.

```json
"до": {
  "meta": { "pos": "prep", "governs": ["gen"] },
  "base": [["до", -1]]
}

"за": {
  "meta": { "pos": "prep", "governs": ["acc", "ins"] },
  "base": [["за", -1]]
}

"з": {
  "meta": { "pos": "prep", "governs": ["gen", "ins"] },
  "base": [["з", -1]]
}
```

`governs` est dans `meta`, pas dans le `data-info` des phrases.

---

## 8. Champs metadonnees

| Champ     | Type      | Description                                                                  |
| --------- | --------- | ---------------------------------------------------------------------------- |
| `variant` | `number`  | Variante d'accent (V1 `var=N`). Index 0-based parmi les formes alternatives. |
| `foreign` | `boolean` | Mot etranger (Rafale, Gripen, combat...). Pas de paradigme ukrainien.        |
| `indecl`  | `boolean` | Indeclinable. Forme identique a tous les cas.                                |
| `unamb`   | `boolean` | NooJ `+UNAMB` -- entree non ambigue dans le dictionnaire.                    |

### `indecl` -- indeclinables

Concerne :

- **Possessifs invariables** : його, її, їхній (formes identiques a tous les cas et genres)
- **Noms propres etrangers** : Rafale, Gripen, Paris (pas de declinaison ukrainienne)
- **Emprunts recents** : метро, кафе, таксі

```
його;pos=adj;adjType=poss;indecl=yes;case=acc;gender=f;number=sg
Rafale;pos=noun;nounType=proper;foreign=yes;indecl=yes;case=loc;number=sg
метро;pos=noun;indecl=yes;case=loc;number=sg
```

### `foreign`

Les mots etrangers non adaptes a la morphologie ukrainienne. Ils sont toujours `indecl=yes`. Ils peuvent apparaitre dans des phrases annotees (contexte militaire, technique...) mais n'ont pas de paradigme dans `data.json`.

---

## 9. Champ `nooj`

Objet tracant la source NooJ de chaque entree.

```typescript
nooj?: {
  line: string | null;      // ligne brute du .dic NooJ (ex. "стіл,NOUN+Masculine+Common+Inanimate+FLX=СТІЛ")
  status: "reviewed" | "pending" | null;
  flx: string | null;       // paradigme flexionnel (ex. "СИН", "ВЕЛИКИЙ", "Я")
  drv?: string[];            // derivations (tableau — 362 verbes NooJ ont plusieurs DRV)
  pair?: string;             // paire aspectuelle (ex. "поставити")
  biaspect?: true;           // true si Pair="X/X" dans NooJ
}
```

> **Pourquoi `line` est un string, pas un numero ?** Un numero de ligne serait fragile (il change si le dico NooJ est retrie). La ligne brute assure la tracabilite et permet le cross-check direct.

> **Pourquoi `drv` est un tableau ?** 362 verbes NooJ ont plusieurs DRV (plusieurs perfectifs possibles). Exemple :
> `батожити,VERB+Pair="батожити/вибатожити,відбатожити"+FLX=БАЧИТИ+DRV=ВИ:БАЧИТИ_PF+DRV=ВІД:БАЧИТИ_PF`
> → `"drv": ["ВИ:БАЧИТИ_PF", "ВІД:БАЧИТИ_PF"]`

### Workflow `status`

| Valeur       | Signification                                 |
| ------------ | --------------------------------------------- |
| `"reviewed"` | Entree verifiee par un humain                 |
| `"pending"`  | Entree importee automatiquement, non verifiee |
| `null`       | Pas de correspondance NooJ                    |

### Exemples

```json
// Nom avec correspondance NooJ
"артист": {
  "meta": { "pos": "noun", "gender": "m", "animacy": "anim" },
  "nooj": { "line": "артист,NOUN+Masculine+Common+Animate+FLX=СИН", "status": "pending", "flx": "СИН" }
}

// Verbe biaspectuel
"атакувати": {
  "meta": { "pos": "verb", "aspect": "biaspect" },
  "nooj": {
    "line": "атакувати,VERB+Pair=\"атакувати/атакувати\"+FLX=РИСУВАТИ+DRV=0:РИСУВАТИ_PF",
    "status": "pending", "flx": "РИСУВАТИ", "drv": ["0:РИСУВАТИ_PF"],
    "pair": "атакувати", "biaspect": true
  }
}

// Verbe avec plusieurs DRV
"грати": {
  "meta": { "pos": "verb", "aspect": "impf", "couple": "зіграти" },
  "nooj": {
    "line": "грати,VERB+Pair=\"грати/зіграти\"+FLX=ЧИТАТИ+DRV=ЗІ:ЧИТАТИ_PF",
    "status": "reviewed", "flx": "ЧИТАТИ", "drv": ["ЗІ:ЧИТАТИ_PF"],
    "pair": "зіграти"
  }
}

// Verbe avec couple aspectuel
"поставити": {
  "meta": { "pos": "verb", "aspect": "perf", "couple": "ставити" },
  "nooj": {
    "line": "поставити,VERB+Perfective+Pair=\"поставити/ставити\"+FLX=ПОСТАВИТИ",
    "status": "reviewed", "flx": "ПОСТАВИТИ", "pair": "ставити"
  }
}

// Pronom personnel
"він": {
  "meta": { "pos": "pron", "pronType": "pers", "syntax": "pron_pers" },
  "nooj": { "line": "він,PRONOUN+Personal+FLX=ВІН", "status": "pending", "flx": "ВІН" }
}
```

### Note sur `biaspect` et NooJ

Le champ `nooj.biaspect: true` indique que NooJ a `Pair="X/X"` pour ce verbe. Cela ne prouve **pas** que le verbe est biaspectuel -- voir la section 3 (Traits verbaux) pour la procedure de verification. Le champ `meta.aspect` est le resultat de la verification, pas `nooj.biaspect`.

---

## 10. Cas (`case`)

7 cas ukrainiens. Renommage unique par rapport a V1 : `nomi` -> `nom`.

| V1     | V2    | Nom ukrainien | Role principal                            |
| ------ | ----- | ------------- | ----------------------------------------- |
| `nomi` | `nom` | Називний      | Sujet                                     |
| `gen`  | `gen` | Родовий       | Possession, negation, quantite            |
| `dat`  | `dat` | Давальний     | Complement d'attribution                  |
| `acc`  | `acc` | Знахідний     | Objet direct, direction                   |
| `ins`  | `ins` | Орудний       | Moyen, instrument, maniere                |
| `loc`  | `loc` | Місцевий      | Lieu statique (toujours avec preposition) |
| `voc`  | `voc` | Кличний       | Apostrophe                                |

### Topologie des paradigmes par `pos`

| `pos`        | Chemin d'acces dans `data.json`                     |
| ------------ | --------------------------------------------------- |
| `noun`       | `cas > {case} > {number}` (sg/pl)                   |
| `adj`, `num` | `cas > {case} > {gender}` (m/f/n/pl)                |
| `pron`       | `cas > {case}` (valeur directe, pas de sous-niveau) |

### Format des formes flechies

Toutes les formes flechies dans `data.json` V2 sont au format **liste de paires** :

```
[["forme_sans_accent", position_accent], ...]
```

Chaque paire contient la forme sans diacritique U+0301 et la position de l'accent (1-based en lettres). Conventions d'accent :

- `-1` : mot monosyllabique (accent trivial)
- `-2` : accent inconnu

Exemples :

- Forme simple : `[["столу", 5]]`
- Variantes d'accent : `[["мене", 4], ["мене", 2]]`
- Monosyllabe : `[["він", -1]]`
- Accent inconnu : `[["слово", -2]]`
- Forme absente (case vide) : `[]`

Le format plat V1 (`["mot", accent]` sans double crochet) n'est plus accepte en V2. Le script `migrate_v1_to_v2.py` convertit automatiquement :

```
V1: ["мій", -1]                       ->  V2: [["мій", -1]]
V1: [["мене", 4], ["мене", 2]]        ->  V2: inchange (deja correct)
V1: ["він", -1]                       ->  V2: [["він", -1]]
```

---

## 11. Table de migration V1 -> V2 (23 exemples)

| V1 `data-info`                 | V2 `data-info`                                                         |
| ------------------------------ | ---------------------------------------------------------------------- |
| `машина;nom;cas;acc;s`         | `машина;pos=noun;case=acc;number=sg;gender=f`                          |
| `Василь;nom;cas;gen;s`         | `Василь;pos=noun;nounType=proper;nounSubtype=fname;case=gen;number=sg` |
| `гроші;nom;cas;nomi;pl`        | `гроші;pos=noun;case=nom;number=pl;gender=f`                           |
| `ставити;verb;conj;pres;1p;s`  | `ставити;pos=verb;verbForm=fin;tense=pres;person=1;number=sg`          |
| `поставити;verb;conj;pass;m;s` | `поставити;pos=verb;verbForm=fin;tense=past;gender=m;number=sg`        |
| `атакувати;verb;inf`           | `атакувати;pos=verb;verbForm=inf`                                      |
| `читати;verb;conj;pres;3p;pl`  | `читати;pos=verb;verbForm=fin;tense=pres;person=3;number=pl`           |
| `вішати;verb;conj;fut;1p;s`    | `вішати;pos=verb;verbForm=fin;tense=fut;person=1;number=sg`            |
| `купити;verb;conj;pass;f;s`    | `купити;pos=verb;verbForm=fin;tense=past;gender=f;number=sg`           |
| `великий;adj;cas;nomi;m`       | `великий;pos=adj;case=nom;gender=m;number=sg`                          |
| `ця;adj;cas;nomi;f`            | `цей;pos=adj;adjType=dem;case=nom;gender=f;number=sg`                  |
| `його;proposs;cas;gen;m`       | `його;pos=adj;adjType=poss;case=gen;gender=m;number=sg`                |
| `я;proper;cas;dat`             | `я;pos=pron;pronType=pers;case=dat`                                    |
| `він;proper;cas;nomi`          | `він;pos=pron;pronType=pers;case=nom`                                  |
| `себе;pron;cas;acc`            | `себе;pos=pron;pronType=refl;case=acc`                                 |
| `два;card;cas;nomi;m`          | `два;pos=num;numType=card;case=nom;gender=m`                           |
| `завтра;nom;cas;acc;s`         | `завтра;pos=adv;advType=time`                                          |
| `тоді;conj;base`               | `тоді;pos=adv;advType=time`                                            |
| `але;conj;base`                | `але;pos=conj;conjType=coord`                                          |
| `що;conj;base`                 | `що;pos=conj;conjType=subord`                                          |
| `не;part;base`                 | `не;pos=part`                                                          |
| `у;prep;base`                  | `у;pos=prep`                                                           |
| `можна;adv;base`               | `можна;pos=pred`                                                       |

---

## 12. Type `MorphoTag` (TypeScript)

```typescript
interface MorphoTag {
  // Identite
  lemma: string;
  pos:
    | "noun"
    | "verb"
    | "adj"
    | "pron"
    | "num"
    | "adv"
    | "prep"
    | "conj"
    | "part"
    | "intj"
    | "pred"
    | "insert"
    | "x";

  // Sous-types lexicaux
  nounType?: "common" | "proper";
  nounSubtype?:
    | "fname"
    | "lname"
    | "toponym"
    | "city"
    | "country"
    | "ethnicity"
    | "language"
    | "animal"
    | "abbr";
  adjType?: "poss" | "dem" | "rel" | "tot" | "emph" | "ord" | "indef" | "neg" | "belong";
  // adjType absent = qualificatif ordinaire (pas de "qual" explicite)
  pronType?: "pers" | "refl" | "inter" | "indef";
  numType?: "card" | "coll" | "quant";
  conjType?: "coord" | "subord";
  advType?:
    | "manner"
    | "time"
    | "place"
    | "quantity"
    | "intensity"
    | "reason"
    | "inter"
    | "indef"
    | "dem"
    | "neg";
  adjDegree?: "comp" | "super";
  advDegree?: "comp" | "super";

  // Flexion
  case?: "nom" | "gen" | "dat" | "acc" | "ins" | "loc" | "voc";
  number?: "sg" | "pl";
  gender?: "m" | "f" | "n";
  person?: "1" | "2" | "3";

  // Verbal
  verbForm?: "fin" | "inf" | "imp" | "conv";
  tense?: "pres" | "past" | "fut";
  aspect?: "impf" | "perf" | "biaspect";
  group?: number; // groupe de conjugaison (1 ou 2)
  motionType?: "det" | "indet";

  // --- Champs meta-only (jamais dans le data-info serialise) ---
  // Remplis depuis meta dans data.json, pas depuis les balises HTML.
  // Un contributeur ne doit PAS les mettre dans les data-info des phrases.
  motionPair?: string; // partenaire de mouvement (det <-> indet), ex. "бігати" pour бігти
  couple?: string; // couple aspectuel (impf <-> perf), ex. "побачити" pour бачити

  // Nominal (meta-only)
  animacy?: "anim" | "inan";
  plurTantum?: true;
  diminutive?: true;

  // Prepositions (meta-only)
  governs?: ("nom" | "gen" | "dat" | "acc" | "ins" | "loc")[]; // cas regis

  // Notation
  notation?: "digit" | "roman" | "abbr" | "date" | "time";

  // Metadonnees
  variant?: number; // variante d'accent (V1 var=N), index 0-based
  foreign?: boolean; // mot etranger (Rafale, Gripen, combat...)
  indecl?: boolean; // indeclinable (його/її comme possessifs, noms etrangers)
  unamb?: boolean; // NooJ +UNAMB (entree non ambigue)

  // UI
  syntax?: string;

  // Tracabilite NooJ
  nooj?: {
    line: string | null; // ligne brute du .dic NooJ
    status: "reviewed" | "pending" | null;
    flx: string | null;
    drv?: string[]; // tableau — certains verbes ont plusieurs DRV
    pair?: string; // paire NooJ (peut differer de meta.couple)
    biaspect?: true;
  };
}
```

### Exemples d'objets `MorphoTag` instancies

```typescript
// Nom commun feminin (gender dans le tag pour la bulle de survol)
{ lemma: "машина", pos: "noun", case: "acc", number: "sg", gender: "f" }

// Verbe imperfectif au present
{ lemma: "читати", pos: "verb", verbForm: "fin", tense: "pres", person: "3", number: "pl" }

// Verbe biaspectuel a l'infinitif
{ lemma: "атакувати", pos: "verb", verbForm: "inf" }

// Verbe de mouvement indetermine
{ lemma: "бігати", pos: "verb", verbForm: "inf", motionType: "indet", motionPair: "бігти", couple: "побігати" }

// Pronom personnel au datif
{ lemma: "я", pos: "pron", pronType: "pers", case: "dat" }

// Possessif indeclinable
{ lemma: "його", pos: "adj", adjType: "poss", indecl: true, case: "acc", gender: "f", number: "sg" }

// Adjectif qualificatif (pas de adjType — absent = qual par defaut)
{ lemma: "великий", pos: "adj", case: "nom", gender: "m", number: "sg" }

// Numeral avec notation chiffree
{ lemma: "сімнадцять", pos: "num", numType: "card", notation: "digit", case: "gen" }

// Preposition avec regime casuel
{ lemma: "за", pos: "prep", governs: ["acc", "ins"] }

// Mot etranger indeclinable
{ lemma: "Rafale", pos: "noun", nounType: "proper", foreign: true, indecl: true, case: "loc", number: "sg" }

// Predicatif
{ lemma: "можна", pos: "pred" }
```

---

## Architecture runtime

### Fonctions centrales (`src/lib/utils/dataAccess.js`)

- **`parseDataInfo(raw)`** : parse un data-info V2 en objet `MorphoTag`. Utilise par tous les composants qui lisent les `data-info` du DOM.
- **`resolveEntry(dataV2, tag)`** : navigue dans `data.json` selon le `MorphoTag` et retourne la forme flechie `[["forme", accent], ...]`. Connait la topologie de chaque `pos` (noun: cas>nombre, adj: cas>genre, pron: cas seul, verb: conj>tense>person/gender>number).
- **`getLemmaEntry(wordData, pos, word)`** : retourne la forme de citation (nominatif sg pour les noms, infinitif pour les verbes, etc.).
- **`getPrincipalForm(wordData, word, pos)`** : retourne le HTML accentue de la forme de citation. Utilise par la sidebar et les en-tetes.

### Flux de donnees

```
data-info (attribut HTML)
    |
    v
parseDataInfo(raw) → MorphoTag { lemma, pos, case, number, ... }
    |
    v
resolveEntry(dataV2, tag) → [["forme", accent], ...]
    |
    v
firstPair(entry) → ["forme", accent]
    |
    v
addAccentHTML("forme", accent) → HTML avec <span class="with-accent">
```

### Registre sidebar (`src/lib/utils/morphoRegistry.js`)

Definit les groupes de la sidebar via `sidebarGroups`. Chaque groupe a un `filter(meta)` qui determine quelles entrees de `data.json` lui appartiennent. Les groupes avec `subgroups` creent un niveau de pliage supplementaire. Les groupes avec `flat: true` + `order: [...]` affichent les mots directement dans l'ordre specifie.

`collectWords(wordData, filter)` parcourt toutes les entrees et retourne les lemmes qui matchent le filtre.

`getSidebarGroup(meta)` retourne la cle du groupe sidebar pour un meta donne.

### Parseur Python (`outil_python/goroh/ukr_morph_parser.py`)

4 parseurs pour les tables goroh.pp.ua :

| Fonction                                                        | Format goroh                            | Usage                                                     |
| --------------------------------------------------------------- | --------------------------------------- | --------------------------------------------------------- |
| `parse_table_nom`                                               | відмінок × однина/множина               | Noms                                                      |
| `parse_table_adj`                                               | відмінок × чол.р./жін.р./сер.р./множина | Adjectifs, demonstratifs, possessifs, negatifs, indefinis |
| `parse_table_pron`                                              | відмінок × forme (1 colonne)            | Pronoms idiosyncratiques (хто, що, себе, хтось...)        |
| `parse_verb_imperfective_table` / `parse_verb_perfective_table` | Temps × personne/genre × nombre         | Verbes                                                    |

---

## Regles importantes

1. **Le lemme** est toujours a l'infinitif pour les verbes, au nominatif singulier masculin pour les adjectifs, au nominatif singulier pour les noms.
2. **`class="ukr"`** est constant sur toutes les balises annotees.
3. **Aucune valeur hors schema** ne doit apparaitre dans `data-info`.
4. **Les mots non annotables** (ponctuation, tirets) restent hors balise. Les mots etrangers peuvent etre annotes avec `foreign=yes;indecl=yes`.
5. **`meta.aspect` absent** = verification en cours (pas "inconnu" ni "biaspectuel presume"). Pour les 338 verbes NooJ `Pair="X/X"`, il faut verifier les accents sur goroh avant de renseigner ce champ.
6. **`notation` absent** = mot en toutes lettres, le bouton Epeler ne s'applique pas.
7. **`syntax`** pilote le regroupement UI et peut diverger de `pos` (ex. `pos=adj` + `syntax=pron_poss`).
