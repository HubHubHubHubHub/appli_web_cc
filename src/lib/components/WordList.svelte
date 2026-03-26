<script>
  import { dataStore } from "$lib/stores/dataStore.svelte.js";
  import { groupByFirstLetter } from "$lib/utils/ukrainianSort.js";
  import { hasAnyExpanded } from "$lib/utils/foldState.js";
  import { sidebarGroups, collectWords } from "$lib/utils/morphoRegistry.js";
  import CategorySection from "./CategorySection.svelte";

  let categoryOpen = $state({});
  let letterOpen = $state({});
  let initialized = false;

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
      newCatOpen[key] = true;
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
  class="grow overflow-y-auto pr-1.5"
  style="--global-toggle-height: 38px; scrollbar-width: thin; scrollbar-color: var(--color-scrollbar-thumb) var(--color-scrollbar-track); scrollbar-gutter: stable;"
>
  <button
    type="button"
    class="block w-full bg-base-200 border border-base-300 rounded px-2.5 py-1.5 mb-0 font-[inherit] text-sm cursor-pointer text-neutral text-left sticky top-0 z-[2] hover:bg-base-300 hover:text-base-content"
    onclick={toggleAll}
  >
    {anyExpanded ? "▼ Tout replier" : "▶ Tout déplier"}
  </button>

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
</div>
