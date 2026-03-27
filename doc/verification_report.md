# Rapport de vérification — phrases.json

## Résumé

| Métrique | Valeur |
|----------|--------|
| Balises `data-info` totales | 1 330 |
| Vérifiables (lemme présent dans `data.json`) | 1 035 |
| Correctes | 978 |
| **Corrections appliquées** | **54 balises dans 46 phrases** |
| Vérification manuelle requise | 12 |
| Lemmes absents de `data.json` (non vérifiables) | 1 |

### Répartition des corrections

| Type d'erreur | Nombre |
|---------------|--------|
| Genre incorrect sur adjectif (+ `number` manquant ajouté) | 37 |
| Nombre incorrect (`sg` ↔ `pl`) | 11 |
| Cas incorrect | 5 |
| Autre (lemme, nounType) | 1 |

---

## Protocole de vérification

Le script `verify_v3.py` exécute **4 passes** :

### Passe 1 — Validation structurelle
Vérifie le format `clé=valeur` de chaque `data-info`, la présence de `pos`, et la validité de chaque clé/valeur par rapport au schéma V2.

**Résultat** : 0 erreur structurelle.

### Passe 2 — Cross-référence paradigmatique
Pour chaque balise dont le lemme existe dans `data.json`, le script navigue dans le paradigme (cas × nombre × genre pour les noms/adjectifs, temps × personne × nombre pour les verbes) et vérifie que la forme textuelle du `<span>` correspond bien au slot déclaré.

### Passe 3 — Recherche du bon slot
Quand la forme ne correspond pas au slot déclaré, le script parcourt **tout** le paradigme du lemme pour trouver où la forme apparaît réellement, puis utilise des règles de désambiguïsation :

- Élimination du vocatif (rare en contexte courant)
- Régime des prépositions (з + gén, за + ins, про + acc, etc.)
- Accord avec le nom tête (pour les adjectifs)
- Contexte prédicatif (бути + adj → instrumental)
- Contexte de COD après verbe transitif → accusatif

### Passe 4 — Cohérence contextuelle
Même quand la forme est paradigmatiquement valide au slot déclaré, le script vérifie qu'une préposition précédente n'exige pas un autre cas. Exemple : `з України` — la forme `України` existe bien au nom/pl, mais `з` régit le génitif, donc le bon tag est gen/sg.

**Exceptions reconnues** :
- `у/в + génitif` de pronom personnel = possession (« у мене є »)
- Deuxième locatif en `-у/-ю` (« в ряду » au lieu de « в ряді »)

---

## Corrections automatiques (54)

### Erreurs de genre sur adjectifs (37)

Schéma récurrent : l'adjectif est étiqueté `gender=m` quel que soit le nom qu'il modifie. Corrigé en alignant le genre avec le nom tête.

| # | Phrase | Forme | Avant | Après |
|---|--------|-------|-------|-------|
| 1 | У Франції це відома особа. | відома | `case=nom;gender=m` | `case=nom;gender=f;number=sg` |
| 2 | Він живе у далекій країні. | далекій | `case=loc;gender=m` | `case=loc;gender=f;number=sg` |
| 3 | Ми йшли вузькою вулицею. | вузькою | `case=ins;gender=m` | `case=ins;gender=f;number=sg` |
| 4 | Я купив дорогу сумку. | дорогу | `case=acc;gender=m` | `case=acc;gender=f;number=sg` |
| 5 | На столі була порожня пляшка. | порожня | `case=nom;gender=m` | `case=nom;gender=f;number=sg` |
| 6 | У моєї сестри густе волосся… | моєї | `case=gen;gender=m` | `case=gen;gender=f;number=sg` |
| 7 | У моєї сестри густе волосся… | густе | `case=nom;gender=m` | `case=nom;gender=n;number=sg` |
| 8 | У моєї сестри густе волосся… | тонке | `case=nom;gender=m` | `case=nom;gender=n;number=sg` |
| 9 | Молода дівчина була тонкою… | Молода | `case=nom;gender=m` | `case=nom;gender=f;number=sg` |
| 10 | Молода дівчина була тонкою… | тонкою | `case=ins;gender=m` | `case=ins;gender=f;number=sg` |
| 11 | Я люблю солодке. | солодке | `case=acc;gender=m` | `case=acc;gender=n;number=sg` |
| 12 | Ця валіза занадто важка. | важка | `case=nom;gender=m` | `case=nom;gender=f;number=sg` |
| 13 | Ця дівчина дуже повільна. | повільна | `case=nom;gender=m` | `case=nom;gender=f;number=sg` |
| 14 | Ось жіноче взуття… | жіноче | `case=nom;gender=m` | `case=nom;gender=n;number=sg` |
| 15 | Ось жіноче взуття… | чоловіче | `case=nom;gender=m` | `case=nom;gender=n;number=sg` |
| 16 | Вона працює в книжковій крамниці. | книжковій | `case=loc;gender=m` | `case=loc;gender=f;number=sg` |
| 17 | У вас є сьогоднішня газета? | сьогоднішня | `case=nom;gender=m` | `case=nom;gender=f;number=sg` |
| 18 | Я познайомився з моєю дружиною… | моєю | `case=ins;gender=m` | `case=ins;gender=f;number=sg` |
| 19 | У моїй кімнаті стоїть… | моїй | `case=loc;gender=m` | `case=loc;gender=f;number=sg` |
| 20 | У неї було золотисте волосся. | золотисте | `case=nom;gender=m` | `case=nom;gender=n;number=sg` |
| 21 | Іспит був дуже складним. | складним | `case=nom;gender=m` | `case=ins;gender=m;number=sg` |

Plus 16 corrections d'adjectifs/verbes au pluriel où `gender=m` a été retiré (le pluriel n'a pas de distinction de genre en ukrainien) :

- довгі, основні, прості, дурні, студентські, срібні, лікарські (adj pl)
- лежать ×4, висять, стоять, подобаються, гуляємо (verbes pl)
- йшли, робили, говорили, купили, були, бачили, допомогли, настали, сіли ×2 (passé pl)

### Erreurs de nombre (11)

| # | Phrase | Forme | Avant | Après |
|---|--------|-------|-------|-------|
| 1–5 | Гроші/Речі/Журнали/Документи лежать… | лежать | `number=sg` | `number=pl` |
| 6 | Картини висять на стінах. | висять | `number=sg` | `number=pl` |
| 7 | Квіти стоять у вазі. | стоять | `number=sg` | `number=pl` |
| 8–9 | Я вішаю/повісив об'яву на двері. | двері | `number=sg` | `number=pl` |
| 10 | Мені подобаються довгі сукні. | подобаються | `number=sg` | `number=pl` |
| 11 | Ми гуляємо паризькими вулицями. | гуляємо | `number=sg` | `number=pl` |

### Erreurs de cas (5)

| # | Phrase | Forme | Avant | Après | Raison |
|---|--------|-------|-------|-------|--------|
| 1 | Доброго ранку, ми з **України**. | України | `case=nom;number=pl` | `case=gen;number=sg` | `з` régit le génitif |
| 2 | …сходити до **аптеки**. | аптеки | `case=nom;number=pl` | `case=gen;number=sg` | `до` régit le génitif |
| 3 | …одну книжку на **місяць**. | місяць | `case=nom` | `case=acc` | `на` + accusatif (durée) |
| 4 | Гості сидять за **столом**. | столом | `case=loc` | `case=ins` | `за` + instrumental |
| 5 | Це кошенятине місце. | кошенятине | `gender=n` | `gender=n;number=sg` | `number=sg` ajouté |

### Autre

| # | Phrase | Forme | Avant | Après |
|---|--------|-------|-------|-------|
| 1 | Сєргійко значно менший… | Сєргійко | `сєргійко;pos=noun` | `Сєргійко;pos=noun;nounType=proper;nounSubtype=fname` |

---

## À vérifier manuellement (12)

Ces cas nécessitent soit un enrichissement de `data.json`, soit une vérification linguistique humaine.

### Paradigmes incomplets dans data.json (8)

| # | Forme | Lemme | Explication |
|---|-------|-------|-------------|
| 1 | найкращих | кращий | Superlatif (най-) absent du paradigme |
| 2 | довша | довгий | Comparatif absent du paradigme |
| 3 | легша | легкий | Comparatif absent du paradigme |
| 4 | вища | високий | Comparatif absent du paradigme |
| 5 | гірша | поганий | Comparatif supplétif absent du paradigme |
| 6 | сестриним | сестрин | Paradigme possessif incomplet |
| 7 | послухав | послухати | Verbe absent ou paradigme incomplet |
| 8 | викладачеву | викладачевий | Paradigme possessif incomplet |

**Action recommandée** : enrichir les paradigmes dans `data.json` (ajouter les formes comparatives et les possessifs à paradigme complet).

### Slots manquants (3)

| # | Forme | data-info | Explication |
|---|-------|-----------|-------------|
| 1 | сподіваючись | `verbForm=conv` | Le gérondif (converb) n'est pas modélisé dans les paradigmes verbaux |
| 2 | Сашкові | `case=dat;number=sg` | Le datif de « Сашко » est absent du paradigme (nom propre) |
| 3 | Його | `pos=adj;case=nom` | Le possessif indéclinable « його » n'a pas de slot `case=nom` sans genre |

### Nom propre non référencé (1)

| # | Forme | Explication |
|---|-------|-------------|
| 1 | Мар'яна | Lemme avec apostrophe non trouvé — vérifier l'encodage |

---

## Schéma des erreurs récurrentes

L'analyse révèle un **pattern systématique** : les adjectifs étaient quasi-systématiquement étiquetés avec `gender=m` indépendamment du genre réel du nom modifié, et le champ `number` était souvent omis. Cela suggère que les data-info ont été générés à partir de la forme de citation (masculin singulier) sans adaptation au contexte de la phrase.

**Recommandation** : si un script de génération automatique est utilisé pour créer les `data-info`, il faudrait qu'il prenne en compte la morphologie de la forme fléchie pour déterminer le genre et le nombre, plutôt que de copier les traits du lemme.

---

## Fichiers produits

- `phrases_corrected.json` — version corrigée avec les 54 corrections appliquées
- `verify_v3.py` — script de vérification reproductible
