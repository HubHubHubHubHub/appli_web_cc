# Rapport de vérification — phrases.json

## État actuel

| Métrique                                     | Valeur                                               |
| -------------------------------------------- | ---------------------------------------------------- |
| Balises `data-info` totales                  | 1 330                                                |
| Vérifiables (lemme présent dans `data.json`) | 1 035                                                |
| Correctes                                    | 1 034                                                |
| Corrections auto restantes                   | **0**                                                |
| Vérification manuelle restante               | 1 (converbe `сподіваючись`, limitation structurelle) |
| Lemmes absents de `data.json`                | 1                                                    |

## Historique des corrections

### Session initiale (script v1 sur Claude web)

54 corrections automatiques appliquées dans 46 phrases :

| Type d'erreur                                             | Nombre |
| --------------------------------------------------------- | ------ |
| Genre incorrect sur adjectif (+ `number` manquant ajouté) | 37     |
| Nombre incorrect (`sg` ↔ `pl`)                            | 11     |
| Cas incorrect                                             | 5      |
| Autre (lemme, nounType)                                   | 1      |

### Session d'enrichissement (Claude Code)

Corrections et enrichissements de `data.json` (toutes marquées `automate: true`) :

**Verbes — passé pluriel :**

- настати, робити, бути : `past.f.pl` et `past.n.pl` remplis (même forme que `past.m.pl`)
- послухати : formes réflexives remplacées par non-réflexives
- 10 data-info dans phrases.json : ajout `gender=m` pour le passé pluriel

**Noms :**

- Сашко : `dat.sg` ajouté (Сашкові)
- ряд : 2e locatif ajouté (ряду, en plus de ряді)
- новина : `acc.pl` et `nom.pl` remplis (новини)
- Сєргійко : clé renommée (minuscule → majuscule) + variante orthographique

**Adjectifs — comparatifs (bloc `comp`) :**

- довгий → довший/довша/довше/довші
- легкий → легший/легша/легше/легші
- високий → вищий/вища/вище/вищі
- поганий → гірший/гірша/гірше/гірші (supplétif)

**Adjectif — superlatif (bloc `super`) :**

- кращий → найкращий (paradigme complet, 6 cas)

**Adjectifs — possessifs :**

- сестрин : `ins.m` ajouté (сестриним)
- викладачевий : paradigme complet (était un stub)
- кошенятине : `nom` étendu à tous les genres

**Corrections data-info dans phrases.json :**

- 4 comparatifs (довша, легша, вища, гірша) : ajout `adjDegree=comp`
- 2 positifs (довга, погана) : retrait `adjDegree=comp` (faux positif corrigé)

## Cas non modélisé (limitation acceptée)

Le **converbe** (gérondif ukrainien, ex: `сподіваючись`) n'est pas modélisé dans les paradigmes verbaux. Le `data-info` utilise `verbForm=conv` mais aucun slot n'existe dans `data.json`. Ce cas est signalé en « vérification manuelle requise » mais ne bloque pas le test automatisé.

## Script de vérification

`outil_python/validation/verify_phrases.py` — exécuter depuis la racine du projet :

```bash
python3 outil_python/validation/verify_phrases.py          # rapport
python3 outil_python/validation/verify_phrases.py --fix     # appliquer les corrections
```

Test automatisé : `cd outil_python/validation && python3 -m unittest test_verify_phrases`
