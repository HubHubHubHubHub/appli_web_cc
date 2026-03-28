# outil_python/

Scripts Python pour l'enrichissement de la base de données ukrainienne.

Voir `doc/DATA_ENRICHMENT.md` pour le double protocole d'enrichissement.

## Scripts

### `ukr_morph_parser.py` — Parseur goroh.pp.ua

Parseur de tables morphologiques depuis [goroh.pp.ua](https://goroh.pp.ua/Словозміна/). Produit directement du format V2.

**Parseurs de tables :**

| Fonction                                     | Format goroh                            | Sortie                                                                              | Usage                                     |
| -------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------- |
| `parse_table_nom(html, lemma)`               | відмінок × однина/множина               | `{cas: {nom: {sg: [...], pl: [...]}}}`                                              | Noms, тисяча                              |
| `parse_table_adj(html)`                      | відмінок × чол.р./жін.р./сер.р./множина | `{cas: {nom: {m: [...], f: [...], n: [...], pl: [...]}}}`                           | Adjectifs, possessifs, démonstratifs      |
| `parse_table_pron(html)`                     | відмінок × forme (1 colonne)            | `{cas: {nom: [...], gen: [...]}}`                                                   | Pronoms personnels, хто, що, себе, trois+ |
| `parse_verb_imperfective_table(html, lemma)` | Temps × personne/genre × nombre         | `{inf: [...], conj: {pres: {1: {sg: [...]}}, past: {m: {sg: [...]}}}, asp: "impf"}` | Verbes imperfectifs                       |
| `parse_verb_perfective_table(html, lemma)`   | Idem (sans présent)                     | `{inf: [...], conj: {fut: {...}, past: {...}}, asp: "perf"}`                        | Verbes perfectifs                         |

**Utilitaires :**

| Fonction                                   | Description                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------- |
| `parse_ukrainian_word_accent_policy(word)` | Extrait les accents d'un mot (combinant U+0301) → `[(word_clean, pos)]`   |
| `remove_all_accents(text)`                 | Retire les combinant aigus                                                |
| `extract_article_blocks(html)`             | Extrait les blocs article d'une page goroh                                |
| `fetch_html(word)`                         | Récupère le HTML d'une page goroh                                         |

### `build_entries_from_phrases.py` — Enrichissement batch (Protocole 2)

Lit `phrases_a_traiter.json`, scrape goroh.pp.ua pour chaque lemme nouveau, et produit :
- `out.json` — entrées V2 pour relecture humaine
- `entries_report.html` — rapport visuel

**Comportement clé :**
- Les entrées avec un `nooj` validé sont ignorées (déjà relues)
- Si une entrée existe sans nooj validé : paradigme régénéré, données annexes préservées (phrases, meta, traduction)
- Pas de marqueur `automate: true` — la relecture humaine est garantie par le workflow

```bash
python3 outil_python/build_entries_from_phrases.py                    # Génère out.json + rapport
python3 outil_python/build_entries_from_phrases.py --limit 5          # Debug (5 premiers lemmes)
python3 outil_python/build_entries_from_phrases.py --data path.json   # Chemin data.json custom
```

### `verify_phrases.py` — Vérification cohérence data-info

Cross-référence des balises `data-info` dans `phrases.json` avec les paradigmes de `data.json`. Détecte les incohérences paradigmatiques et contextuelles (régime des prépositions).

```bash
python3 outil_python/verify_phrases.py           # Rapport
python3 outil_python/verify_phrases.py --fix      # Appliquer les corrections auto
```

### `validate_v2.py` — Validateur de schéma V2

Vérifie la structure de `data.json` et `phrases.json` (clés V2, meta, nooj, data-info).

### `migrate_v1_to_v2.py` — Script de migration (historique)

Migration complète data.json V1 → V2. **Idempotent**.

### `webscrapp_goroh.py` — Legacy

Script historique. À nettoyer.

### `extract.py` — Utilitaire

Extrait les phrases de data.json vers phrases.json.

## Tests

```bash
cd outil_python
python3 -m unittest discover -v               # Tous les tests (112)
python3 -m unittest test_ukr_morph_parser -v   # Parseur goroh (22 tests)
python3 -m unittest test_migrate_v1_to_v2 -v   # Migration (41 tests)
python3 -m unittest test_build_entries -v       # Build entries (35 tests)
python3 -m unittest test_verify_phrases -v      # Vérification phrases (2 tests)
python3 -m unittest test_validate_v2 -v         # Validation V2 (12 tests)
```

## Dépendances

- Python 3.11+
- `beautifulsoup4` (parsing HTML goroh)
- `requests` (HTTP goroh — optionnel, mockable en tests)
