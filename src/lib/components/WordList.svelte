<script>
  import { dataStore } from "$lib/stores/dataStore.svelte.js";
  import { groupByFirstLetter } from "$lib/utils/ukrainianSort.js";
  import { hasAnyExpanded } from "$lib/utils/foldState.js";
  import { sidebarGroups, collectWords } from "$lib/utils/morphoRegistry.js";
  import CategorySection from "./CategorySection.svelte";

  import { uiStore } from "$lib/stores/uiStore.svelte.js";
  import { getPrincipalForm } from "$lib/utils/dataAccess.js";

  let categoryOpen = $state({});
  let letterOpen = $state({});
  let initialized = false;
  let searchQuery = $state("");

  /**
   * Build flat list of displayable sections from sidebarGroups.
   * Each section has: key, label, words (grouped by letter), posLookup (map word→pos).
   */
  let sections = $derived.by(() => {
    const wd = dataStore.wordData;
    if (!wd) return [];

    const result = [];

    // Build a reverse map: word → pos (for LetterGroup to know where to look in wordData)
    function buildPosLookup(words, filter) {
      const lookup = {};
      for (const [pos, entries] of Object.entries(wd)) {
        if (!entries || typeof entries !== "object") continue;
        for (const lemma of Object.keys(entries)) {
          const meta = entries[lemma]?.meta;
          if (meta && filter(meta) && words.includes(lemma)) {
            lookup[lemma] = pos;
          }
        }
      }
      return lookup;
    }

    for (const group of sidebarGroups) {
      if (group.subgroups) {
        // Parent group with subgroups
        const subs = [];
        for (const sub of group.subgroups) {
          const words = collectWords(wd, sub.filter);
          if (words.length > 0) {
            const posLookup = buildPosLookup(words, sub.filter);
            const ordered = sub.order ? sub.order.filter((w) => words.includes(w)) : words;
            subs.push({
              key: sub.key,
              label: sub.label,
              flat: sub.flat || false,
              words: ordered,
              letterGroups: sub.flat ? null : groupByFirstLetter(words),
              posLookup,
            });
          }
        }
        if (subs.length > 0) {
          result.push({ key: group.key, label: group.label, subgroups: subs });
        }
      } else {
        const words = collectWords(wd, group.filter);
        if (words.length > 0) {
          const posLookup = buildPosLookup(words, group.filter);
          result.push({
            key: group.key,
            label: group.label,
            letterGroups: groupByFirstLetter(words),
            posLookup,
          });
        }
      }
    }
    return result;
  });

  // Search: collect all words with pos for filtering
  let searchResults = $derived.by(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    const wd = dataStore.wordData;
    if (!wd) return [];
    const results = [];
    for (const [pos, entries] of Object.entries(wd)) {
      if (!entries || typeof entries !== "object") continue;
      for (const lemma of Object.keys(entries)) {
        if (lemma.toLowerCase().startsWith(q)) {
          results.push({ lemma, pos });
        }
      }
    }
    return results.slice(0, 30); // Limit to 30 results
  });

  // Flat list of all section keys (including subgroups) for fold state
  let allSectionKeys = $derived.by(() => {
    const keys = [];
    for (const s of sections) {
      keys.push(s.key);
      if (s.subgroups) {
        for (const sub of s.subgroups) keys.push(sub.key);
      }
    }
    return keys;
  });

  // Collect all groupedData for hasAnyExpanded
  let allGroupedData = $derived.by(() => {
    const out = {};
    for (const s of sections) {
      if (s.letterGroups) out[s.key] = s.letterGroups;
      if (s.subgroups) {
        for (const sub of s.subgroups) out[sub.key] = sub.letterGroups;
      }
    }
    return out;
  });

  let anyExpanded = $derived(allSectionKeys.some((k) => categoryOpen[k]));

  // Initialize fold state when data loads (once)
  $effect(() => {
    const data = dataStore.wordData;
    if (!data || Object.keys(data).length === 0) return;
    if (initialized) return;
    initialized = true;

    const newCatOpen = {};
    const newLetterOpen = {};
    for (const key of allSectionKeys) {
      newCatOpen[key] = false;
      const groups = allGroupedData[key];
      if (groups) {
        for (const letter of groups.keys()) {
          newLetterOpen[`${key}:${letter}`] = false;
        }
      }
    }
    categoryOpen = newCatOpen;
    letterOpen = newLetterOpen;
  });

  function toggleCategory(catKey) {
    categoryOpen = { ...categoryOpen, [catKey]: !categoryOpen[catKey] };
  }

  function toggleAllLetters(catKey) {
    const groups = allGroupedData[catKey];
    if (!groups) return;
    const letters = [...groups.keys()];
    const anyOpen = letters.some((l) => letterOpen[`${catKey}:${l}`]);
    const updated = { ...letterOpen };
    for (const l of letters) {
      updated[`${catKey}:${l}`] = !anyOpen;
    }
    letterOpen = updated;
  }

  function toggleLetter(catKey, letter) {
    letterOpen = { ...letterOpen, [`${catKey}:${letter}`]: !letterOpen[`${catKey}:${letter}`] };
  }

  let wordListEl = $state(null);

  function handleKeydown(ev) {
    if (!wordListEl) return;
    if (ev.key !== "ArrowDown" && ev.key !== "ArrowUp" && ev.key !== "Enter") return;

    // Collect all visible word buttons (not category/letter toggles)
    const buttons = [...wordListEl.querySelectorAll("li button")];
    if (!buttons.length) return;

    const current = document.activeElement;
    const idx = buttons.indexOf(current);

    if (ev.key === "ArrowDown") {
      ev.preventDefault();
      const next = idx < buttons.length - 1 ? idx + 1 : 0;
      buttons[next].focus();
      buttons[next].scrollIntoView({ block: "nearest" });
    } else if (ev.key === "ArrowUp") {
      ev.preventDefault();
      const prev = idx > 0 ? idx - 1 : buttons.length - 1;
      buttons[prev].focus();
      buttons[prev].scrollIntoView({ block: "nearest" });
    } else if (ev.key === "Enter" && idx >= 0) {
      ev.preventDefault();
      buttons[idx].click();
    }
  }

  function toggleAll() {
    const expand = !anyExpanded;
    const newCatOpen = {};
    const newLetterOpen = {};
    for (const key of allSectionKeys) {
      newCatOpen[key] = expand;
      const groups = allGroupedData[key];
      if (groups) {
        for (const letter of groups.keys()) {
          newLetterOpen[`${key}:${letter}`] = expand;
        }
      }
    }
    categoryOpen = newCatOpen;
    letterOpen = newLetterOpen;
  }
</script>

<div
  id="wordList"
  bind:this={wordListEl}
  class="grow overflow-y-auto pr-1.5 scrollbar-thin"
  style="--global-toggle-height: 38px; scrollbar-gutter: stable;"
  onkeydown={handleKeydown}
  role="listbox"
>
  <div class="sticky top-0 z-[2] bg-base-200 pb-1">
    <input
      type="text"
      class="w-full px-2.5 py-1.5 border border-base-300 rounded text-sm font-[inherit] bg-base-100"
      placeholder="Chercher un mot..."
      bind:value={searchQuery}
    />
    {#if !searchQuery.trim()}
      <button
        type="button"
        class="block w-full bg-base-200 border border-base-300 rounded px-2.5 py-1 mt-1 font-[inherit] text-sm cursor-pointer text-neutral text-left hover:bg-base-300 hover:text-base-content"
        onclick={toggleAll}
        aria-expanded={anyExpanded}
      >
        {anyExpanded ? "▼ Tout replier" : "▶ Tout déplier"}
      </button>
    {/if}
  </div>

  {#if searchResults}
    <ul class="list-none p-0 m-0">
      {#each searchResults as { lemma, pos }}
        <li
          class="py-1.5 px-2 pl-3 cursor-pointer border-b border-base-200 hover:bg-primary/10 {uiStore.selectedWord ===
            lemma && uiStore.selectedCategory === pos
            ? 'bg-primary/15 rounded'
            : ''}"
        >
          <button
            type="button"
            class="bg-transparent border-none p-0 m-0 font-[inherit] text-inherit cursor-pointer text-left w-full focus:bg-primary/10 focus:outline-none rounded-sm"
            onclick={() => {
              uiStore.selectedWord = lemma;
              uiStore.selectedCategory = pos;
            }}
          >
            {@html uiStore.accentEnabled ? getPrincipalForm(dataStore.wordData, lemma, pos) : lemma}
            <span class="text-xs text-neutral ml-1">{pos}</span>
          </button>
        </li>
      {/each}
      {#if searchResults.length === 0}
        <li class="py-3 px-2 text-neutral italic text-sm">Aucun mot trouvé</li>
      {/if}
    </ul>
  {:else}
    {#each sections as section}
      {#if section.subgroups}
        <!-- Parent group with subgroups (e.g. Pronoms, Mots invariables) -->
        <div class="pt-2.5">
          <div
            class="flex items-center justify-between border-b-2 border-base-300 pb-1 sticky top-[var(--global-toggle-height,0px)] z-[1] bg-base-200"
          >
            <button
              type="button"
              class="flex items-center gap-1.5 bg-transparent border-none p-0 m-0 font-[inherit] cursor-pointer text-left text-inherit"
              onclick={() => toggleCategory(section.key)}
            >
              <span
                class="inline-block text-2xs transition-transform duration-150 ease-in-out"
                class:rotate-90={categoryOpen[section.key]}>▶</span
              >
              <h2 class="m-0 text-lg">{section.label}</h2>
            </button>
          </div>
          {#if categoryOpen[section.key]}
            {#each section.subgroups as sub}
              <div class="pl-4">
                <CategorySection
                  catKey={sub.key}
                  catLabel={sub.label}
                  isOpen={categoryOpen[sub.key] ?? true}
                  letterGroups={sub.letterGroups}
                  letterOpenState={letterOpen}
                  posLookup={sub.posLookup}
                  flat={sub.flat}
                  words={sub.words}
                  onToggleCategory={() => toggleCategory(sub.key)}
                  onToggleAllLetters={() => toggleAllLetters(sub.key)}
                  onToggleLetter={(letter) => toggleLetter(sub.key, letter)}
                />
              </div>
            {/each}
          {/if}
        </div>
      {:else}
        <!-- Simple group -->
        <CategorySection
          catKey={section.key}
          catLabel={section.label}
          isOpen={categoryOpen[section.key] ?? true}
          letterGroups={section.letterGroups}
          letterOpenState={letterOpen}
          posLookup={section.posLookup}
          onToggleCategory={() => toggleCategory(section.key)}
          onToggleAllLetters={() => toggleAllLetters(section.key)}
          onToggleLetter={(letter) => toggleLetter(section.key, letter)}
        />
      {/if}
    {/each}
  {/if}
</div>
