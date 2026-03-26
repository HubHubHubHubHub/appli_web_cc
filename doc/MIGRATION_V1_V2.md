# Migration V1 → V2 — Journal

Ce document retrace la migration du format morphologique V1 (positionnel) vers V2 (clé=valeur), réalisée en mars 2026. Il sert de référence en cas de bugs résiduels ou de questions sur les décisions prises.

## Chronologie

| Commit    | Description                                                             |
| --------- | ----------------------------------------------------------------------- |
| `282c0d5` | Migration initiale data.json + phrases.json (601 entrées)               |
| `fabca4e` | Phase 1 corpus réduit (50 entrées) + tests migration                    |
| `4eae231` | Adaptation utils (parsing, dataAccess, accentDom, bubble, i18n, colors) |
| `e6a5d04` | Adaptation composants Svelte                                            |
| `df80044` | Fix hoverHandlers/UkrSpan/GrammarTable — parsing V2                     |
| `dbf6cef` | Fix data-info guillemets simples dans phrases.json                      |
| `c9a4f0d` | resolveEntry canonique + suppression dead code V1                       |
| `7d1812c` | Sidebar avec sous-catégories syntaxiques (morphoRegistry)               |
| `b6b03cc` | PronDetails pour les pronoms personnels                                 |
| `75a09a2` | Pronoms personnels en liste plate ordonnée                              |
| `1ef6313` | Ajout de 45 entrées pronominales NooJ                                   |
| `b84ce4e` | Remplissage des paradigmes pronominaux depuis goroh                     |
| `26cfade` | Fix CSS table-layout:auto sur .gram-table                               |
| `006f190` | Fix accents sidebar — getPrincipalForm au lieu de HtmlContent           |

## Bugs rencontrés et corrigés

### 1. Infobulles vides après migration (`df80044`)

**Symptôme** : les infobulles au hover ne s'affichaient plus.

**Cause** : `hoverHandlers.js` et `UkrSpan.svelte` utilisaient encore `parseInfo()` (split brut par `;`) au lieu de `parseDataInfo()`. Avec un data-info V2 comme `машина;pos=noun;case=acc;number=sg`, le split donnait `category = "pos=noun"` au lieu de `"noun"` — `wordData["pos=noun"]` n'existait pas.

**Fix** : remplacer `parseInfo` par `parseDataInfo` dans ces deux fichiers.

### 2. data-info à guillemets simples non migrés (`dbf6cef`)

**Symptôme** : les phrases n'affichaient ni accents ni infobulles.

**Cause** : le script `migrate_data_info_in_html` utilisait la regex `data-info="([^"]+)"` — elle ne matchait que les guillemets doubles. Or 321 data-info dans `phrases.json` utilisaient des guillemets simples (`data-info='...'`).

**Fix** : regex étendue pour matcher les deux types, normalisation en guillemets doubles.

### 3. Tables de déclinaison vides pour les noms (`NounDetails.svelte`)

**Symptôme** : les cellules sg. étaient vides dans la table des noms.

**Cause** : `forms.s` au lieu de `forms.sg` (clé V1 résiduelle dans le composant).

**Fix** : `forms.s` → `forms.sg`.

### 4. Tables vides pour les pronoms personnels (`b6b03cc`)

**Symptôme** : aucune forme affichée quand on cliquait sur un pronom personnel.

**Cause** : les pronoms personnels (`pos=pron`) étaient routés vers `NounDetails` qui cherchait `forms.sg/pl`. Or les pronoms ont un paradigme plat (`cas → forme` sans sous-niveau nombre).

**Fix** : création de `PronDetails.svelte` avec une table simple (cas → forme).

### 5. GrammarTable ne résolvait pas les clé=valeur (`df80044`)

**Symptôme** : la table de grammaire (sidebar droite) ne montrait pas les formes fléchies.

**Cause** : `GrammarTable.svelte` passait les tokens bruts `["pos=noun", "case=nom", "number=sg"]` comme `infos[1]` et `infos[2]` aux fonctions `generateTable*`, qui attendaient des valeurs nues (`"nom"`, `"sg"`).

**Fix** : ajout d'un parseur `parseInfos(infos)` local qui extrait les valeurs des clé=valeur.

### 6. Accents manquants dans la sidebar pour les verbes (`006f190`)

**Symptôme** : les accents s'affichaient pour les noms dans la sidebar mais pas pour les verbes.

**Cause** : problème de timing Svelte — `HtmlContent` utilisait un `$effect` pour appeler `applyAccents` sur le DOM après injection du `base_html`. Pour certaines catégories (verbes), l'effect ne se re-déclenchait pas correctement.

**Fix** : remplacement de `HtmlContent` + `applyAccents` par `getPrincipalForm()` dans `LetterGroup` et `CategorySection`. Calcul direct de la forme accentuée sans manipulation DOM.

**Conséquence** : les mots de la sidebar ne sont plus des `<span class="ukr">` interactifs — ce sont du texte statique accentué. C'est plus cohérent visuellement (même police que le reste de la sidebar) et l'interactivité est gérée par le `onclick` du bouton parent.

### 7. Césures dans les tables de déclinaison (`26cfade`)

**Symptôme** : les mots étaient coupés dans les cellules des tables grammaticales.

**Cause** : daisyUI `.table` impose `table-layout: fixed` et `width: 100%`. Notre `.gram-table` avait `width: auto` mais pas `table-layout: auto` — daisyUI gagnait en spécificité.

**Fix** : ajout de `table-layout: auto` dans `.gram-table`.

### 8. Erreurs factuelles dans les données V1 (`fabca4e`)

Découvertes lors de la phase 1 (corpus réduit) :

- `гроші` : `genre: "m"` → corrigé en `"f"` (féminin plurale tantum)
- `двері` : `genre: "pl"` → corrigé en `"f"`
- `бігти` : `asp: "perfectif"` → corrigé en `"impf"` (imperfectif déterminé)

## Transformations appliquées

### Clés top-level

| V1             | V2           | Action                                           |
| -------------- | ------------ | ------------------------------------------------ |
| `nom`          | `noun`       | Renommé                                          |
| `verb`         | `verb`       | Inchangé                                         |
| `adj`          | `adj`        | + fusions depuis `proposs`, `pron`               |
| `proper`       | `pron`       | Renommé (pronoms personnels)                     |
| `proposs`      | → `adj`      | Fusionné avec `adjType=poss`, `syntax=pron_poss` |
| `pron` (V1)    | → `adj`      | Fusionné avec `adjType=dem`, `syntax=pron_dem`   |
| `card`         | `num`        | Renommé avec `numType=card`                      |
| `adv`          | `adv`        | Inchangé                                         |
| `prep`         | `prep`       | Inchangé                                         |
| `conj`         | `conj`       | Inchangé                                         |
| `part`         | `part`       | Inchangé                                         |
| `INTERJECTION` | _(supprimé)_ | Était vide                                       |
| `LOCUTION`     | _(supprimé)_ | Était vide                                       |

### Clés internes

| V1                   | V2                        | Contexte           |
| -------------------- | ------------------------- | ------------------ |
| `nomi`               | `nom`                     | Cas nominatif      |
| `s`                  | `sg`                      | Nombre singulier   |
| `1p`/`2p`/`3p`       | `1`/`2`/`3`               | Personne           |
| `pass`               | `past`                    | Temps passé        |
| `genre`              | `meta.gender`             | Genre nominal      |
| `asp: "imperfectif"` | `meta.aspect: "impf"`     | Aspect             |
| `asp: "perfectif"`   | `meta.aspect: "perf"`     |                    |
| `asp: "biaspectuel"` | `meta.aspect: "biaspect"` |                    |
| `coupl`              | `meta.couple`             | Couple aspectuel   |
| `gramm`              | `meta.motionType`         | Verbe de mouvement |

### Format des formes fléchies

V1 mélangeait deux formats :

- Plat : `["mot", accent]`
- Liste de paires : `[["mot", accent]]`

V2 : toujours `[["mot", accent], ...]`.

### data-info dans les phrases

V1 positionnel : `машина;nom;cas;acc;s`
V2 clé=valeur : `машина;pos=noun;case=acc;number=sg`

## Fichiers modifiés

### Utilitaires

| Fichier              | Changement                                                                 |
| -------------------- | -------------------------------------------------------------------------- |
| `parsing.js`         | `toPairs()` simplifié, `parseInfo()` supprimé                              |
| `dataAccess.js`      | `parseDataInfo()` + `resolveEntry()` ajoutés, `getDataFromJson()` supprimé |
| `accentDom.js`       | Utilise `parseDataInfo` + `resolveEntry`                                   |
| `hoverHandlers.js`   | Utilise `parseDataInfo` au lieu de `parseInfo`                             |
| `bubble.js`          | `buildBubbleHTML` + `getHoverColor` adaptés clé=valeur                     |
| `i18n.js`            | Clés V2 (noun, past, sg, 1/2/3)                                            |
| `colors.js`          | `nomi` → `nom`                                                             |
| `gramFunc.js`        | data-info V2, personnes 1/2/3, past, sg                                    |
| `tableGeneration.js` | `generateTableProper` → `generateTablePron`, clés V2                       |
| `morphoRegistry.js`  | Nouveau — registre des groupes sidebar                                     |

### Composants

| Fichier                  | Changement                                                 |
| ------------------------ | ---------------------------------------------------------- |
| `WordList.svelte`        | Itère sur `sidebarGroups`, groupes parents/sous-groupes    |
| `CategorySection.svelte` | Mode flat + `getPrincipalForm`                             |
| `LetterGroup.svelte`     | `posLookup` + `getPrincipalForm`                           |
| `WordDetails.svelte`     | Routage V2 (noun/adj/pron/verb), meta.gender/aspect/couple |
| `GrammarSidebar.svelte`  | meta.aspect/gender                                         |
| `GrammarTable.svelte`    | Parseur clé=valeur local, noun/pron/adj/num/verb           |
| `VerbDetails.svelte`     | past, sg, meta.couple                                      |
| `NounDetails.svelte`     | forms.sg                                                   |
| `PronDetails.svelte`     | Nouveau — table simple cas → forme                         |
| `UkrSpan.svelte`         | `parseDataInfo` + `resolveEntry`                           |

### Scripts Python

| Fichier                    | Changement                                       |
| -------------------------- | ------------------------------------------------ |
| `migrate_v1_to_v2.py`      | Nouveau — script de migration idempotent         |
| `test_migrate_v1_to_v2.py` | Nouveau — 41 tests                               |
| `ukr_morph_parser.py`      | `parse_table_pron()` ajouté, fix `"5p"` → `"3p"` |

## Chiffres

|                      | V1                | V2  |
| -------------------- | ----------------- | --- |
| Entrées              | 603               | 646 |
| Catégories top-level | 13 (dont 2 vides) | 9   |
| Tests JS             | 156               | 158 |
| Tests Python         | 27                | 68  |
| Pronoms (total)      | 17                | 59  |
