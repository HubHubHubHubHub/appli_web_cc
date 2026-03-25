# Schéma d'annotation morphosyntaxique ukrainien

Ce document décrit le format des balises HTML utilisées dans `phrases.json` pour l'annotation morphologique des mots ukrainiens.

---

## Format général

Chaque mot annoté est encapsulé dans un `<span>` avec deux attributs :

```html
<span class="ukr" data-info="LEMME;CATÉGORIE;[SOUS-CAT];[VALEURS...]">FORME</span>
```

- **`class="ukr"`** — constant, identifie toutes les balises ukrainiennes
- **`data-info`** — chaîne de champs séparés par `;`, variable selon la catégorie

---

## Catégories et structures `data-info`

### 1. `nom` — Substantif (nom commun ou propre)

```
LEMME;nom;cas;CAS;NOMBRE
```

| Champ    | Valeurs possibles                                         |
|----------|-----------------------------------------------------------|
| `CAS`    | `nomi` `gen` `dat` `acc` `ins` `loc` `voc`               |
| `NOMBRE` | `s` (singulier) · `pl` (pluriel)                         |

**Exemples :**
```
машина;nom;cas;acc;s       → машину
гроші;nom;cas;nomi;pl      → гроші
гараж;nom;cas;loc;s        → гаражі
Василь;nom;cas;gen;s       → Василя
```

---

### 2. `verb` — Verbe

Deux sous-structures selon la forme :

#### Infinitif
```
LEMME;verb;inf
```
```
запитати;verb;inf
```

#### Forme conjuguée
```
LEMME;verb;conj;TEMPS;PERSONNE;NOMBRE
```

| Champ      | Valeurs possibles                                 |
|------------|---------------------------------------------------|
| `TEMPS`    | `pres` `fut` `pass` `imp` (impératif)             |
| `PERSONNE` | `1p` `2p` `3p` — **OU pour le passé :** `m` `f` `n` |
| `NOMBRE`   | `s` · `pl`                                        |

> **Note passé :** le passé ukrainien s'accorde en genre et nombre, pas en personne.  
> Format passé : `LEMME;verb;conj;pass;GENRE;NOMBRE`

**Exemples :**
```
ставити;verb;conj;pres;1p;s    → ставлю
читати;verb;conj;pres;3p;pl    → читають
поставити;verb;conj;pass;m;s   → поставив
купити;verb;conj;pass;f;s      → купила
сісти;verb;conj;pass;m;pl      → сіли
вішати;verb;conj;fut;1p;s      → вішатиму
```

---

### 3. `adj` — Adjectif (qualificatif, possessif en `-ів`/`-ин`, comparatif, ordinal)

```
LEMME;adj;cas;CAS;GENRE_NOMBRE
```

| Champ          | Valeurs possibles                    |
|----------------|--------------------------------------|
| `CAS`          | `nomi` `gen` `dat` `acc` `ins` `loc` `voc` |
| `GENRE_NOMBRE` | `m` `f` `n` `pl`                    |

**Exemples :**
```
новий;adj;cas;nomi;m         → новий
більший;adj;cas;nomi;f       → більша
батьків;adj;cas;loc;f        → батьковій
адміністративний;adj;cas;ins;m → адміністративним
```

---

### 4. `proper` — Pronom personnel

```
LEMME;proper;cas;CAS
```

> Pas de champ genre/nombre (le pronom porte lui-même cette info).

**Exemples :**
```
я;proper;cas;nomi
я;proper;cas;acc      → мене
він;proper;cas;nomi
ми;proper;cas;dat     → нам
вони;proper;cas;acc   → їх
```

---

### 5. `proposs` — Pronom possessif

```
LEMME;proposs;cas;CAS;GENRE_NOMBRE
```

| Champ          | Valeurs possibles           |
|----------------|-----------------------------|
| `CAS`          | même que `adj`              |
| `GENRE_NOMBRE` | `m` `f` `n` `pl`            |

**Exemples :**
```
мій;proposs;cas;nomi;m      → мій
свій;proposs;cas;acc;f      → свою
твій;proposs;cas;gen;f      → твоєї
наш;proposs;cas;nomi;f      → наша
```

---

### 6. `pron` — Pronom démonstratif / relatif

```
LEMME;pron;cas;CAS[;GENRE_NOMBRE]
```

**Exemples :**
```
цей;pron;cas;nomi;f         → ця
це;pron;cas;acc;n           → це
який;pron;cas;acc;m
```

---

### 7. `prep` — Préposition

```
LEMME;prep;base
```

Toutes les prépositions utilisent simplement `base` (pas de flexion).

**Exemples :**
```
в;prep;base
у;prep;base
на;prep;base
до;prep;base
за;prep;base
з;prep;base
```

---

### 8. `card` — Numéral cardinal

```
LEMME;card;cas;CAS[;GENRE]
```

**Exemples :**
```
один;card;cas;nomi;m
один;card;cas;nomi;f       → одна
три;card;cas;nomi;m        → три
шістнадцять;card;cas;nomi;m
```

---

### 9. `adv` — Adverbe

```
LEMME;adv;base
```

**Exemples :**
```
дуже;adv;base
зараз;adv;base
завжди;adv;base
набагато;adv;base
```

---

### 10. `conj` — Conjonction

```
LEMME;conj;base
```

**Exemples :**
```
і;conj;base
але;conj;base
або;conj;base
ніж;conj;base
та;conj;base
```

---

### 11. `part` — Particule

```
LEMME;part;base
```

**Exemples :**
```
не;part;base
це;part;base
ось;part;base
```

---

## Récapitulatif des cas ukrainiens

| Code   | Nom ukrainien  | Rôle principal                              |
|--------|----------------|---------------------------------------------|
| `nomi` | Називний       | Sujet                                       |
| `gen`  | Родовий        | Possession, négation, quantité              |
| `dat`  | Давальний      | Complément d'attribution                    |
| `acc`  | Знахідний      | Objet direct, direction                     |
| `ins`  | Орудний        | Moyen, instrument, complément de manière    |
| `loc`  | Місцевий       | Lieu statique (toujours avec préposition)   |
| `voc`  | Кличний        | Apostrophe                                  |

---

## Structure JSON de `phrases.json`

```json
"PHRASE_UKRAINIENNE": {
  "phrase_html": "HTML annoté avec les <span>",
  "traduction": "Traduction en français",
  "genereVerbe": {           // optionnel — pour génération de paradigmes
    "verbe": "infinitif",
    "temps": "pres|pass|fut|imp",
    "frag1": "HTML avant le sujet",
    "frag2": "HTML après le verbe conjugué"
  },
  "ref": { "source": "référence" },   // optionnel
  "remarque": "note linguistique"     // optionnel
}
```

---

## Règles importantes

1. **Le lemme est toujours à l'infinitif** pour les verbes, au **nominatif singulier** pour les noms/adj.
2. **Les mots non annotés** dans une phrase (déterminants non flexionnels, ponctuation, mots étrangers comme *Rafale*, *combat proven*) restent hors balise.
3. **`class="ukr"`** est constant — ne jamais le modifier.
4. **Aucune valeur hors schéma** ne doit apparaître dans `data-info`.
5. Pour les **noms propres indéclinables** (ex. *Верді*, *Rafale*), utiliser `nom;cas;nomi;s` si non fléchi en contexte.
