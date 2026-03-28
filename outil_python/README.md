# outil_python/

Scripts Python pour l'enrichissement et la validation de la base de données ukrainienne.

Voir `doc/DATA_ENRICHMENT.md` pour le double protocole d'enrichissement.

## Structure

```
outil_python/
├── goroh/                        ← Bibliothèque de scraping goroh.pp.ua
│   ├── ukr_morph_parser.py       ← Parseurs de tables morphologiques
│   └── test_ukr_morph_parser.py  ← 22 tests
├── enrichissement/               ← Protocole 2 : batch depuis phrases annotées
│   ├── build_entries.py          ← Génère out.json + rapport HTML depuis goroh
│   ├── merge_entries.py          ← Insère out.json dans data.json (tri ukrainien)
│   ├── test_build_entries.py     ← 35 tests
│   ├── input/                    ← (gitignored) phrases_a_traiter.json
│   └── output/                   ← (gitignored) out.json, entries_report.html
├── validation/                   ← Vérification (les 2 protocoles)
│   ├── validate_v2.py            ← Validateur de schéma V2
│   ├── verify_phrases.py         ← Cross-référence data-info ↔ paradigmes
│   ├── test_validate_v2.py       ← 12 tests
│   └── test_verify_phrases.py    ← 2 tests
└── README.md
```

## Commandes

### Enrichissement (Protocole 2)

```bash
# 1. Mettre les phrases dans enrichissement/input/phrases_a_traiter.json
# 2. Générer les entrées
python3 outil_python/enrichissement/build_entries.py

# 3. Relire output/out.json + output/entries_report.html
# 4. Insérer dans data.json
python3 outil_python/enrichissement/merge_entries.py --dry-run   # prévisualisation
python3 outil_python/enrichissement/merge_entries.py              # insertion
```

### Validation (les 2 protocoles)

```bash
python3 outil_python/validation/verify_phrases.py           # cohérence data-info
python3 outil_python/validation/verify_phrases.py --fix      # corrections auto
python3 outil_python/validation/validate_v2.py               # schéma V2
```

### Tests

```bash
# Par sous-dossier
cd outil_python/goroh && python3 -m unittest discover            # 22 tests
cd outil_python/enrichissement && python3 -m unittest discover   # 35 tests
cd outil_python/validation && python3 -m unittest discover       # 14 tests

# Total : 71 tests
```

## Dépendances

- Python 3.11+
- `beautifulsoup4` (parsing HTML goroh)
- `requests` (HTTP goroh — optionnel, mockable en tests)
