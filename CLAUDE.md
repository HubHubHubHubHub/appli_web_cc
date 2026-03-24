# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ukrainian vocabulary learning web app built with SvelteKit 2 + Svelte 5 (runes), deployed as a static site. UI language is French. Requires Node >= 20 (Tailwind v4 native binding).

## Commands

- `npm run dev` — dev server with HMR
- `npm run build` — static build to `build/`
- `npm run preview` — preview the static build
- `npm run test` — run all Vitest tests
- `npx vitest tests/utils/accent.test.js` — run a single test file

## Architecture

### Data Pipeline

`outil_python/` scripts ADD entries to `static/data.json` and `static/phrases.json` — they don't regenerate these files. Both can be edited directly. These JSON files are the app's entire dataset — there is no backend or API.

### Data Loading

`+layout.server.js` reads both JSON files at build time (prerender). `+layout.svelte` initializes two rune-based stores (`dataStore.wordData`, `dataStore.phraseData` in `src/lib/stores/dataStore.svelte.js`). All components read from these stores reactively via property access (no `$store` syntax or `get()`).

### Routes

- `/` — main vocabulary interface: `WordList` sidebar (categories → letters → words, double-fold expandable) + `WordDetails` panel
- `/phrases` — phrase search with multi-term AND filtering

### Component Hierarchy

`+layout.svelte` renders `GrammarSidebar` (fixed right panel showing pinned/hovered grammar) and `AccentCheckbox` (toggle accent marks). Page components compose detail components (`NounDetails`, `VerbDetails`, `AdjectiveDetails`, `BaseDetails`) based on word category. `UkrSpan` and `HtmlContent` handle interactive Ukrainian text (hover/click triggers grammar sidebar).

### Svelte 5 Reactivity

Components use runes (`$state`, `$derived`, `$effect`, `$props`). In `$effect` blocks, all reactive values must be read inside the effect body to be tracked — assigning to a local variable is the pattern used (see `HtmlContent.svelte`: `const __ = html;` to track prop changes).

### Stores (Svelte 5 runes)

- `src/lib/stores/uiStore.svelte.js` — `uiStore` object with reactive properties: `selectedWord`, `selectedCategory`, `accentEnabled`, `grammarTableData`, `pinnedElement`
- `src/lib/stores/dataStore.svelte.js` — `dataStore` object with reactive properties: `wordData`, `phraseData`

Access pattern: `uiStore.selectedWord` (read) / `uiStore.selectedWord = value` (write). No `writable()`, no `$store`, no `get()`.

### Data Format

Words use `[text, accentPosition]` pairs where accent position is 1-based. Special values: `-1` (no accent/single syllable), `-2` (unknown accent). Variants are inline arrays of pairs: `["form1", pos1, "form2", pos2]`. Accent rendering adds combining acute (U+0301) after the character at the given position. Accent positions must always point to a Ukrainian vowel (`аеєиіїоуюя`).

Categories: `nom`, `verb`, `adj`, `proposs`, `pron`, `card`, `proper`, `adv`, `conj`, `part`, `prep` — each with different declension/conjugation structures.

`data-info` attributes use semicolon-separated tokens: `"lemma;category;type;case;number"` (e.g., `"балкон;nom;cas;nomi;s"`). Valid cases: `nomi`, `gen`, `dat`, `acc`, `ins`, `loc`, `voc`. Valid tenses: `pres`, `fut`, `imp`, `pass`.

### Utils (`src/lib/utils/`)

- `dataAccess.js` — navigate the nested JSON structure (`getDataFromJson`, `getPrincipalForm`)
- `parsing.js` — parse semicolon-separated info strings, extract text/accent from pairs
- `accent.js` — apply combining acute accent to Ukrainian strings
- `gramFunc.js` — generate verb conjugation HTML
- `ukrainianSort.js` — Ukrainian alphabet ordering and letter grouping
- `i18n.js` — French labels for grammatical categories, cases, tenses
- `colors.js` — grammatical case → RGB color mapping
- `phrases.js` — phrase filtering logic
- `bubble.js` — shared hover bubble logic (`buildBubbleHTML`, `positionBubble`, `getOrCreateBubble`, `hideBubble`, `getHoverColor`)

### Tests

Vitest with jsdom. Tests live in `tests/utils/` and import directly from `src/lib/utils/`. Pattern: `describe`/`it` blocks with `expect` assertions.

### CSS

Tailwind CSS v4 via `@tailwindcss/vite` plugin. Design tokens defined in `@theme` block in `src/app.css` (colors, shadows, z-index, fonts). Components use Tailwind utility classes. Font: Times New Roman (required — Inter breaks combining acute rendering on Cyrillic).

Global CSS rules that must stay in `app.css` (not migratable to Tailwind):
- `.ukr`, `.accent`, `.remarque` — referenced from `@html` content, `querySelectorAll`, and JS utilities
- `.grammar-sidebar table/th/td` — descendant selectors for `@html`-generated tables
- `.hover-bubble` — created via `document.createElement` in `bubble.js` (shared singleton used by both `UkrSpan` and `HtmlContent`)

Responsive breakpoint at 768px (`max-md:` prefix in Tailwind).
