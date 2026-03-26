# outil_python/

Scripts Python pour l'enrichissement de la base de données ukrainienne.

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
| `should_skip_goroh(lemma, pos, data_v2)`   | Décide si le scraping est inutile (monosyllabe, invariable, déjà complet) |
| `validate_accent(word, pos)`               | Vérifie qu'un accent pointe sur une voyelle ukrainienne                   |
| `validate_entry_accents(entry, lemma)`     | Valide tous les accents d'une entrée                                      |
| `count_vowels(word)`                       | Compte les voyelles ukrainiennes                                          |

**Clés produites (V2)** : `nom` (pas `nomi`), `sg` (pas `s`), `1/2/3` (pas `1p/2p/3p`), `past` (pas `pass`), `impf/perf` (pas `imperfectif/perfectif`).

### `migrate_v1_to_v2.py` — Script de migration

Migration complète data.json V1 → V2. **Idempotent** (relancer ne change rien).

```bash
python3 migrate_v1_to_v2.py                     # Migration réelle
python3 migrate_v1_to_v2.py --dry-run            # Prévisualisation
python3 migrate_v1_to_v2.py --data path --phrases path  # Chemins custom
```

Transformations : renommage clés top-level, ajout meta, structuration nooj, renommage clés internes, normalisation paires, migration data-info phrases.

### `build_entries_from_phrases.py` — Enrichissement depuis les phrases

Lit les phrases annotées et enrichit data.json avec de nouvelles entrées via goroh.

Accepte les 13 POS V2. Produit des data-info V2 (clé=valeur). Détecte l'aspect (impf/perf/biaspect) depuis les tags goroh.

### `webscrapp_goroh.py` — Legacy

Script historique avec du code dupliqué de `ukr_morph_parser.py`. À nettoyer (importer depuis `ukr_morph_parser` au lieu de dupliquer).

### `extract.py` — Utilitaire

Extrait les phrases de data.json vers phrases.json.

## Tests

```bash
cd outil_python
python3 -m unittest discover -v        # Tous les tests (87)
python3 -m unittest test_ukr_morph_parser -v   # Parseur (22 tests)
python3 -m unittest test_migrate_v1_to_v2 -v   # Migration (41 tests)
python3 -m unittest test_build_entries -v       # Build entries (24 tests)
```

## Dépendances

- Python 3.11+
- `beautifulsoup4` (parsing HTML goroh)
- `requests` (HTTP goroh — optionnel, mockable en tests)
