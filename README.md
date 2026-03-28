# Словоскарб — Trésor lexical ukrainien

Application web d'apprentissage du vocabulaire ukrainien : déclinaisons, conjugaisons, phrases d'exemple avec mise en évidence grammaticale interactive.

**764 entrées** couvrant 12 catégories grammaticales, **255 phrases** annotées, format morphologique V2 aligné avec le dictionnaire NooJ ukrainien.

## Fonctionnalités

- **Lexique** : sidebar avec recherche rapide, sous-catégories syntaxiques (pronoms personnels/possessifs/démonstratifs...), accents interactifs
- **Phrases** : recherche multi-termes avec infobulles grammaticales au survol
- **Tables de grammaire** : déclinaisons et conjugaisons complètes, sidebar épinglable
- **Dark mode** : thème clair/sombre
- **Accents** : toggle global pour afficher/masquer les accents sur tous les mots ukrainiens
- **Taille de police** : boutons A+/A- pour ajuster le zoom du contenu

## Stack technique

- **SvelteKit 2** + **Svelte 5** (runes)
- **Tailwind CSS v4** + **daisyUI** (thèmes `ukrvocab` / `ukrvocab-dark`)
- **Vitest** (160 tests JS) + **unittest** Python (71 tests)
- Site statique (pas de backend)
- Interface en français
- Scripts Python pour le scraping goroh.pp.ua et la validation du schéma

## Prérequis

- Node.js >= 20
- Python 3.11+ (pour les scripts d'enrichissement)

## Installation

```bash
npm install
```

## Commandes

| Commande                                          | Description                       |
| ------------------------------------------------- | --------------------------------- |
| `npm run dev`                                     | Serveur de développement avec HMR |
| `npm run build`                                   | Build statique dans `build/`      |
| `npm run preview`                                 | Prévisualisation du build         |
| `npm run test`                                    | Lancer les 160 tests JS           |
| `npm run lint`                                    | Vérification ESLint               |
| `npm run format`                                  | Formatage Prettier                |
| `cd outil_python && python3 -m unittest discover` | 71 tests Python                  |
| `python3 outil_python/build_entries_from_phrases.py` | Génération d'entrées depuis goroh (batch) |
| `python3 outil_python/merge_entries.py`              | Insertion de out.json dans data.json (tri ukrainien) |
| `python3 outil_python/verify_phrases.py`           | Vérification cohérence data-info / paradigmes |
| `python3 outil_python/validate_v2.py`             | Validateur de schéma V2           |

## Structure du projet

```
src/
├── lib/
│   ├── components/    # Composants Svelte (WordList, WordDetails, GrammarSidebar,
│   │                  #   NounDetails, VerbDetails, PronDetails, PrepDetails...)
│   ├── stores/        # Stores réactifs (dataStore, uiStore)
│   └── utils/         # Utilitaires (dataAccess, morphoRegistry, accent, parsing...)
├── routes/
│   ├── +layout.*      # Layout principal (header, onglets, toggles)
│   ├── +page.svelte   # Page Lexique (sidebar + détails)
│   └── phrases/       # Page Phrases (recherche)
static/
├── data.json          # Base de données vocabulaire (764 entrées, format V2)
└── phrases.json       # Base de données phrases (255 phrases annotées)
outil_python/          # Scripts Python (parseur goroh, migration, validation)
doc/                   # Documentation (schéma V2, migration, raccourcis)
tests/                 # Tests Vitest
```

## Données

Format V2 (clé=valeur). Chaque entrée a un bloc `meta` avec les traits morphologiques et un `nooj` pour la traçabilité vers le dictionnaire NooJ.

Voir `doc/MORPHO_SCHEMA_V2.md` pour la spécification complète et `doc/MIGRATION_V1_V2.md` pour le journal de migration.

## Documentation

| Fichier                     | Description                              |
| --------------------------- | ---------------------------------------- |
| `CLAUDE.md`                 | Instructions pour Claude Code            |
| `doc/MORPHO_SCHEMA_V2.md`   | Spécification du schéma V2 (13 sections) |
| `doc/MORPHO_SCHEMA.md`      | Schéma V1 (référence historique)         |
| `doc/MIGRATION_V1_V2.md`    | Journal de migration V1 → V2             |
| `doc/RACCOURCIS_CLAVIER.md` | Raccourcis clavier                       |
| `doc/DATA_ENRICHMENT.md`   | Double protocole d'enrichissement des données |
| `doc/verification_report.md`| Rapport de vérification phrases/paradigmes |
| `outil_python/README.md`    | Documentation des scripts Python         |
