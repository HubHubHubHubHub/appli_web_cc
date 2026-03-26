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

13 catégories, alignées avec les POS NooJ.

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

`qual` | `poss` | `dem` | `rel` | `tot` | `emph` | `ord` | `indef` | `neg` | `belong`

```
V1: великий;adj;cas;nomi;m;s    ->  великий;pos=adj;adjType=qual;case=nom;gender=m;number=sg
V1: ця;adj;cas;nomi;f           ->  цей;pos=adj;adjType=dem;case=nom;gender=f;number=sg
V1: його;proposs;cas;gen;m;s    ->  його;pos=adj;adjType=poss;case=gen;gender=m;number=sg
V1: п'ятий;adj;cas;nomi;m;s    ->  п'ятий;pos=adj;adjType=ord;case=nom;gender=m;number=sg
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
V1: більший;adj;cas;nomi;m;s   ->  більший;pos=adj;adjType=qual;adjDegree=comp;case=nom;gender=m;number=sg
```

---

## 3. Traits verbaux

| Champ        | Valeurs                           | Notes                                               |
| ------------ | --------------------------------- | --------------------------------------------------- |
| `verbForm`   | `fin` \| `inf` \| `imp` \| `conv` | V1 `conj` -> `fin`, V1 `inf` -> `inf`               |
| `tense`      | `pres` \| `past` \| `fut`         | V1 `pass` -> `past`                                 |
| `person`     | `1` \| `2` \| `3`                 | V1 `1p` -> `1`, `2p` -> `2`, `3p` -> `3`            |
| `gender`     | `m` \| `f` \| `n`                 | passe uniquement (accord en genre, pas en personne) |
| `number`     | `sg` \| `pl`                      | V1 `s` -> `sg`                                      |
| `aspect`     | `impf` \| `perf` \| `biaspect`    | voir ci-dessous                                     |
| `motionType` | `det` \| `indet`                  | NooJ `+Motion+Determinate/Indeterminate`            |

### Aspect

L'aspect est renseigne dans `meta.aspect` sur l'entree du verbe dans `data.json`.

| Valeur     | Signification                        | Exemple                        |
| ---------- | ------------------------------------ | ------------------------------ |
| `impf`     | Imperfectif                          | читати, бачити, ставити        |
| `perf`     | Perfectif                            | прочитати, побачити, поставити |
| `biaspect` | Biaspectuel                          | атакувати, ігнорувати          |
| _(absent)_ | Non tranche -- verification en cours |                                |

Le champ `meta.pair` indique le couple aspectuel : pour un verbe imperfectif, le perfectif correspondant, et vice versa. Pour un biaspectuel, `pair` est absent ou pointe vers lui-meme.

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

Ces traits sont dans `meta` sur l'entree de `data.json`, pas dans le `data-info` des phrases.

### Exemples V1 -> V2

```
V1: гроші;nom;cas;nomi;pl
V2: гроші;pos=noun;case=nom;number=pl
    meta: { pos: "noun", gender: "f", plurTantum: true }

V1: кошеня;nom;cas;nomi;s
V2: кошеня;pos=noun;case=nom;number=sg
    meta: { pos: "noun", gender: "n", animacy: "anim" }
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

---

## 7. Champ `nooj`

Objet tracant la source NooJ de chaque entree.

```typescript
nooj?: {
  line: number | null;      // ligne dans le .dic NooJ
  status: "reviewed" | "pending" | null;
  flx: string | null;       // paradigme flexionnel (ex. "СИН", "ВЕЛИКИЙ", "Я")
  drv?: string;              // derivation (ex. "0:ПЛАКАТИ_PF")
  pair?: string;             // paire aspectuelle (ex. "поставити")
  biaspect?: true;           // true si Pair="X/X" dans NooJ
}
```

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
  "nooj": { "line": null, "status": "pending", "flx": "СИН" }
}

// Verbe biaspectuel
"атакувати": {
  "meta": { "pos": "verb", "aspect": "biaspect" },
  "nooj": { "line": null, "status": "pending", "flx": "РИСУВАТИ", "pair": "атакувати", "biaspect": true }
}

// Verbe avec couple aspectuel
"поставити": {
  "meta": { "pos": "verb", "aspect": "perf", "pair": "ставити" },
  "nooj": { "line": null, "status": "reviewed", "flx": "ПОСТАВИТИ", "pair": "ставити" }
}

// Pronom personnel
"він": {
  "meta": { "pos": "pron", "pronType": "pers", "syntax": "pron_pers" },
  "nooj": { "line": null, "status": "pending", "flx": "ВІН" }
}
```

### Note sur `biaspect` et NooJ

Le champ `nooj.biaspect: true` indique que NooJ a `Pair="X/X"` pour ce verbe. Cela ne prouve **pas** que le verbe est biaspectuel -- voir la section 3 (Traits verbaux) pour la procedure de verification. Le champ `meta.aspect` est le resultat de la verification, pas `nooj.biaspect`.

---

## 8. Cas (`case`)

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

---

## 9. Table de migration V1 -> V2 (23 exemples)

| V1 `data-info`                 | V2 `data-info`                                                         |
| ------------------------------ | ---------------------------------------------------------------------- |
| `машина;nom;cas;acc;s`         | `машина;pos=noun;case=acc;number=sg`                                   |
| `Василь;nom;cas;gen;s`         | `Василь;pos=noun;nounType=proper;nounSubtype=fname;case=gen;number=sg` |
| `гроші;nom;cas;nomi;pl`        | `гроші;pos=noun;case=nom;number=pl`                                    |
| `ставити;verb;conj;pres;1p;s`  | `ставити;pos=verb;verbForm=fin;tense=pres;person=1;number=sg`          |
| `поставити;verb;conj;pass;m;s` | `поставити;pos=verb;verbForm=fin;tense=past;gender=m;number=sg`        |
| `атакувати;verb;inf`           | `атакувати;pos=verb;verbForm=inf`                                      |
| `читати;verb;conj;pres;3p;pl`  | `читати;pos=verb;verbForm=fin;tense=pres;person=3;number=pl`           |
| `вішати;verb;conj;fut;1p;s`    | `вішати;pos=verb;verbForm=fin;tense=fut;person=1;number=sg`            |
| `купити;verb;conj;pass;f;s`    | `купити;pos=verb;verbForm=fin;tense=past;gender=f;number=sg`           |
| `великий;adj;cas;nomi;m;s`     | `великий;pos=adj;adjType=qual;case=nom;gender=m;number=sg`             |
| `ця;adj;cas;nomi;f`            | `цей;pos=adj;adjType=dem;case=nom;gender=f;number=sg`                  |
| `його;proposs;cas;gen;m;s`     | `його;pos=adj;adjType=poss;case=gen;gender=m;number=sg`                |
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

## 10. Type `MorphoTag` (TypeScript)

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
  adjType?: "qual" | "poss" | "dem" | "rel" | "tot" | "emph" | "ord" | "indef" | "neg" | "belong";
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
  motionType?: "det" | "indet";

  // Nominal
  animacy?: "anim" | "inan";
  plurTantum?: true;
  diminutive?: true;

  // Notation
  notation?: "digit" | "roman" | "abbr" | "date" | "time";

  // UI
  syntax?: string;

  // Tracabilite NooJ
  nooj?: {
    line: number | null;
    status: "reviewed" | "pending" | null;
    flx: string | null;
    drv?: string;
    pair?: string;
    biaspect?: true;
  };
}
```

### Exemples d'objets `MorphoTag` instancies

```typescript
// Nom commun feminin
{ lemma: "машина", pos: "noun", case: "acc", number: "sg" }

// Verbe imperfectif au present
{ lemma: "читати", pos: "verb", verbForm: "fin", tense: "pres", person: "3", number: "pl" }

// Verbe biaspectuel a l'infinitif
{ lemma: "атакувати", pos: "verb", verbForm: "inf" }

// Pronom personnel au datif
{ lemma: "я", pos: "pron", pronType: "pers", case: "dat" }

// Possessif (morphologiquement adj, syntaxiquement pronom)
{ lemma: "мій", pos: "adj", adjType: "poss", case: "nom", gender: "m", number: "sg" }

// Numeral avec notation chiffree
{ lemma: "сімнадцять", pos: "num", numType: "card", notation: "digit", case: "gen" }

// Predicatif
{ lemma: "можна", pos: "pred" }

// Preposition avec regime
{ lemma: "до", pos: "prep" }
```

---

## Regles importantes

1. **Le lemme** est toujours a l'infinitif pour les verbes, au nominatif singulier masculin pour les adjectifs, au nominatif singulier pour les noms.
2. **`class="ukr"`** est constant sur toutes les balises annotees.
3. **Aucune valeur hors schema** ne doit apparaitre dans `data-info`.
4. **Les mots non annotables** (ponctuation, tirets, mots etrangers non flechis) restent hors balise.
5. **`meta.aspect` absent** = verification en cours (pas "inconnu" ni "biaspectuel presume"). Pour les 338 verbes NooJ `Pair="X/X"`, il faut verifier les accents sur goroh avant de renseigner ce champ.
6. **`notation` absent** = mot en toutes lettres, le bouton Epeler ne s'applique pas.
7. **`syntax`** pilote le regroupement UI et peut diverger de `pos` (ex. `pos=adj` + `syntax=pron_poss`).
