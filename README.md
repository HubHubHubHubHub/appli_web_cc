# Vocabulaire ukrainien — Application web

Application web d'apprentissage du vocabulaire ukrainien : déclinaisons, conjugaisons, phrases d'exemple avec mise en évidence grammaticale interactive.

## Stack technique

- **SvelteKit 2** + **Svelte 5** (runes)
- **Tailwind CSS v4** + **daisyUI**
- **Vitest** (tests unitaires)
- Site statique (pas de backend)
- Interface en français

## Prérequis

- Node.js >= 20

## Installation

```bash
npm install
```

## Commandes

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement avec HMR |
| `npm run build` | Build statique dans `build/` |
| `npm run preview` | Prévisualisation du build |
| `npm run test` | Lancer tous les tests |

## Structure du projet

```
src/
├── lib/
│   ├── components/    # Composants Svelte (WordList, WordDetails, GrammarSidebar…)
│   ├── stores/        # Stores réactifs (dataStore, uiStore)
│   └── utils/         # Fonctions utilitaires (accents, parsing, tri ukrainien…)
├── routes/
│   ├── +layout.*      # Layout principal, chargement des données
│   ├── +page.svelte   # Page vocabulaire (sidebar + détails)
│   └── phrases/       # Page recherche de phrases
static/
├── data.json          # Base de données vocabulaire
└── phrases.json       # Base de données phrases
outil_python/          # Scripts Python d'alimentation des données
doc/                   # Documentation LaTeX
tests/                 # Tests Vitest
```

## Données

Les fichiers `static/data.json` et `static/phrases.json` constituent la base de données complète de l'application. Les scripts dans `outil_python/` permettent d'y ajouter des entrées ; les fichiers JSON peuvent aussi être édités directement.
