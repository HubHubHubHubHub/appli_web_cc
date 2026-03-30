# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ukrainian vocabulary learning web app built with SvelteKit 2 + Svelte 5 (runes), deployed as a static site. UI language is French. Node version pinned in `.nvmrc` (currently 22). Requires Node >= 20 (Tailwind v4 native binding).

## Commands

- `npm run dev` — dev server with HMR
- `npm run build` — static build to `build/`
- `npm run preview` — preview the static build
- `npm run test` — run all Vitest tests (160 tests)
- `npm run test:coverage` — run tests with coverage report (text + HTML in `coverage/`)
- `npx vitest tests/utils/accent.test.js` — run a single test file
- `npm run lint` — ESLint check
- `npm run format` — Prettier auto-format
- `npm run format:check` — Prettier check (used in CI)
- `cd outil_python/goroh && python3 -m unittest discover` — goroh parser tests (22)
- `cd outil_python/enrichissement && python3 -m unittest discover` — enrichissement tests (35)
- `cd outil_python/validation && python3 -m unittest discover` — validation tests (14)

## Architecture

### Data Pipeline

`outil_python/` scripts ADD entries to `static/data.json` and `static/phrases.json` — they don't regenerate these files. Both can be edited directly. These JSON files are the app's entire dataset — there is no backend or API.

`enrichissement/build_entries.py` reads `enrichissement/input/phrases_a_traiter.json`, scrapes goroh.pp.ua for each new lemma, and produces `enrichissement/output/out.json` (V2 entries for human review) + an HTML report. `enrichissement/merge_entries.py` inserts validated entries into `data.json` with Ukrainian alphabetical ordering. Entries with a validated `nooj` field are skipped. When regenerating, non-paradigm data (phrases, meta, traduction) is preserved.

### Data Format (V2)

Data uses the V2 format (key=value). See `doc/MORPHO_SCHEMA_V2.md` for the full specification. Migration log in `doc/MIGRATION_V1_V2.md`.

**data.json** — 12 top-level categories (764 entries): `noun` (289), `verb` (108), `adj` (191), `pron` (21), `num` (18), `adv` (44), `prep` (28), `conj` (21), `part` (16), `pred` (10), `insert` (10), `intj` (8).

Each entry has a `meta` block with morphological traits. Entries enriched by AI have `"automate": true` in meta.

```json
"машина": {
  "meta": { "pos": "noun", "gender": "f" },
  "cas": { "nom": { "sg": [["машина", 4]], "pl": [...] }, ... },
  "nooj": { "line": "...", "status": "pending", "flx": "..." }
}
```

Forms are always `[["text", accentPosition], ...]` (list of pairs). Accent position is 1-based on the letter. Special values: `-1` (monosyllable), `-2` (unknown). Adjective entries may have optional `comp` and `super` blocks (same structure as `cas`) for comparative and superlative forms.

**data-info** attributes use key=value format: `"lemma;pos=noun;case=acc;number=sg"`. Valid cases: `nom`, `gen`, `dat`, `acc`, `ins`, `loc`, `voc`. Valid tenses: `pres`, `fut`, `imp`, `past`.

### Data Loading

`+layout.server.js` reads both JSON files at build time (prerender). `+layout.svelte` initializes two rune-based stores (`dataStore.wordData`, `dataStore.phraseData`). All components read from these stores reactively.

### Routes

- `/` — main vocabulary interface: `WordList` sidebar (categories → letters → words, with subgroups for pronouns/invariables) + `WordDetails` panel
- `/phrases` — phrase search with multi-term AND filtering

### Component Hierarchy

`+layout.svelte` renders header (tabs Lexique/Phrases, A+/A- font size buttons, accent toggle, dark mode toggle), `GrammarSidebar` (fixed right panel with slide-in transition), and page content. Page components compose detail components based on `meta.pos`:

- `noun` → `NounDetails` (cas × sg/pl)
- `adj` → `AdjectiveDetails` (cas × m/f/n/pl)
- `pron` → `PronDetails` (cas → forme directe)
- `verb` → `VerbDetails` (conjugation tables)
- `num` → dynamic (PronDetails, NounDetails, or AdjectiveDetails depending on paradigm format)
- `prep` → `PrepDetails` (governs display)
- `pred` → `PredDetails` (construction display)
- `conj`, `part`, `adv`, `intj`, `insert` → `BaseDetails`

`UkrSpan` and `HtmlContent` handle interactive Ukrainian text (hover/click triggers grammar sidebar).

### Sidebar grouping

The sidebar uses `morphoRegistry.js` for syntactic grouping (not morphological). Example: possessives are `pos=adj` but appear under Pronouns. Groups with `flat: true` show words directly without letter grouping.

### Utils (`src/lib/utils/`)

- `dataAccess.js` — `parseDataInfo(raw)` → MorphoTag, `resolveEntry(dataV2, tag)` → form, `getLemmaEntry`, `getPrincipalForm`
- `parsing.js` — `toPairs(entry)`, `firstPair`, `firstText`, `firstAccent`, `renderCellSimple`
- `morphoRegistry.js` — `sidebarGroups`, `collectWords(wordData, filter)`, `getSidebarGroup(meta)`
- `accent.js` — `addAccent`, `addAccentHTML`, `highlightLetter`
- `accentDom.js` — `applyAccents(el, wordData, enabled)` — DOM accent toggle
- `hoverHandlers.js` — `applyHoverHandlers(el, deps)` — hover/click/pin on `.ukr` elements
- `bubble.js` — `buildBubbleHTML`, `positionBubble`, `getHoverColor`
- `gramFunc.js` — `generateVerbForms` — verb conjugation HTML with pronouns
- `tableGeneration.js` — `generateTableNoun`, `generateTablePron`, `generateTableAdj`, `generateTableVerb`
- `i18n.js` — French labels (V2 keys: noun, past, sg, 1/2/3)
- `colors.js` — grammatical case → RGB color mapping (V2 key: `nom`), `classesToColorsDark` for dark theme
- `ukrainianSort.js` — Ukrainian alphabet ordering and letter grouping
- `phrases.js` — phrase filtering logic
- `validation/verify_phrases.py` — cross-reference verification of data-info tags in phrases.json against paradigms in data.json
- `validation/validate_v2.py` — V2 schema validator for data.json and phrases.json
- `goroh/ukr_morph_parser.py` — goroh.pp.ua scraping library (parsers, accent extraction)
- `enrichissement/build_entries.py` — batch entry generation from annotated phrases via goroh
- `enrichissement/merge_entries.py` — insert out.json entries into data.json (Ukrainian sort)

### Stores (Svelte 5 runes)

- `uiStore.svelte.js` — `selectedWord`, `selectedCategory`, `accentEnabled`, `grammarTableData`, `pinnedElement`, `contentScale`, `resetCounter`, `resetHome()`
- `dataStore.svelte.js` — `wordData`, `phraseData`

Access pattern: `uiStore.selectedWord` (read) / `uiStore.selectedWord = value` (write).

### Svelte 5 Reactivity

Components use runes (`$state`, `$derived`, `$effect`, `$props`). In `$effect` blocks, all reactive values must be read inside the effect body to be tracked.

### CSS

Tailwind CSS v4 + daisyUI (themes `ukrvocab` light + `ukrvocab-dark` dark in `app.css`). Dark mode toggled via `data-theme` attribute on `<html>`. Font: Playfair Display for Ukrainian text, Source Sans 3 for labels.

Global CSS rules that must stay in `app.css`: `.ukr`, `.accent`, `.with-accent`, `.grammar-sidebar table`, `.hover-bubble`, `.gram-table`, `.scrollbar-thin`, `.empty-state`, `[data-theme="ukrvocab-dark"]` overrides.

### Tests

- **JS**: Vitest with jsdom. 160 tests in `tests/utils/` and `tests/components/`.
- **Python**: unittest. 71 tests in `outil_python/*/test_*.py` (goroh: 22, enrichissement: 35, validation: 14).

### CI

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on push/PR to main: lint → format:check → test → build. Node 22.

### Documentation

- `doc/MORPHO_SCHEMA_V2.md` — full V2 schema specification (13 sections)
- `doc/V1/MORPHO_SCHEMA.md` — V1 schema (legacy reference)
- `doc/V1/MIGRATION_V1_V2.md` — migration journal V1→V2 (référence historique)
- `doc/RACCOURCIS_CLAVIER.md` — keyboard shortcuts
- `doc/DATA_ENRICHMENT.md` — double protocol for data enrichment (direct IA vs batch goroh)
- `doc/verification_report.md` — phrase verification report and history
