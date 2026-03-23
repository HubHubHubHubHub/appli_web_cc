# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ukrainian vocabulary learning web app built with SvelteKit 2 + Svelte 5, deployed as a static site. UI language is French.

## Commands

- `npm run dev` — dev server with HMR
- `npm run build` — static build to `build/`
- `npm run preview` — preview the static build
- `npm run test` — run all Vitest tests
- `npx vitest tests/utils/accent.test.js` — run a single test file

## Architecture

### Data Pipeline

`outil_python/` scripts generate `static/data.json` and `static/phrases.json` from linguistic source data. These JSON files are the app's entire dataset — there is no backend or API.

### Data Loading

`+layout.server.js` reads both JSON files at build time (prerender). `+layout.svelte` initializes two global Svelte stores (`wordData`, `phraseData` in `src/lib/stores/dataStore.js`). All components read from these stores reactively.

### Routes

- `/` — main vocabulary interface: `WordList` sidebar (categories → letters → words, double-fold expandable) + `WordDetails` panel
- `/phrases` — phrase search with multi-term AND filtering

### Component Hierarchy

`+layout.svelte` renders `GrammarSidebar` (fixed right panel showing pinned/hovered grammar) and `AccentCheckbox` (toggle accent marks). Page components compose detail components (`NounDetails`, `VerbDetails`, `AdjectiveDetails`, `BaseDetails`) based on word category. `UkrSpan` and `HtmlContent` handle interactive Ukrainian text (hover/click triggers grammar sidebar).

### UI Stores (`src/lib/stores/uiStore.js`)

`selectedWord`, `selectedCategory`, `accentEnabled`, `grammarTableData`, `pinnedElement` — drive all UI state.

### Data Format

Words use `[text, accentPosition]` pairs where accent position is 1-based. Variants are arrays of pairs: `[[form1, pos1], [form2, pos2]]`. Accent rendering adds combining acute (U+0301) after the character at the given position.

Categories: `nom`, `verb`, `adj`, `proposs`, `pron`, `card`, `proper`, `adv`, `conj`, `part`, `prep` — each with different declension/conjugation structures.

### Utils (`src/lib/utils/`)

- `dataAccess.js` — navigate the nested JSON structure (`getDataFromJson`, `getPrincipalForm`)
- `parsing.js` — parse semicolon-separated info strings, extract text/accent from pairs
- `accent.js` — apply combining acute accent to Ukrainian strings
- `gramFunc.js` — generate verb conjugation HTML
- `ukrainianSort.js` — Ukrainian alphabet ordering and letter grouping
- `i18n.js` — French labels for grammatical categories, cases, tenses
- `colors.js` — grammatical case → RGB color mapping
- `phrases.js` — phrase filtering logic

### Tests

Vitest with jsdom. Tests live in `tests/utils/` and import directly from `src/lib/utils/`. Pattern: `describe`/`it` blocks with `expect` assertions.

### CSS

Global styles in `src/app.css`. `.ukr` spans are interactive (blue, clickable). `.accent` letters are crimson. Grammar sidebar is fixed-right with z-index 2000. Responsive breakpoint at 768px.
