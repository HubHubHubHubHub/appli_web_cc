<script>
  import LetterGroup from "./LetterGroup.svelte";
  import { dataStore } from "$lib/stores/dataStore.svelte.js";
  import { uiStore } from "$lib/stores/uiStore.svelte.js";
  import { getPrincipalForm } from "$lib/utils/dataAccess.js";

  let {
    catKey,
    catLabel,
    isOpen,
    letterGroups = null,
    letterOpenState = {},
    posLookup = {},
    flat = false,
    words = [],
    onToggleCategory,
    onToggleAllLetters = () => {},
    onToggleLetter = () => {},
  } = $props();

  function handleWordClick(word) {
    uiStore.selectedWord = word;
    uiStore.selectedCategory = posLookup[word] || catKey;
  }

  function getDisplay(word) {
    const pos = posLookup[word] || catKey;
    if (uiStore.accentEnabled) {
      return getPrincipalForm(dataStore.wordData, word, pos);
    }
    return word;
  }
</script>

<div class="pt-2.5">
  <div
    class="flex items-center justify-between border-b-2 border-base-300 pb-1 sticky top-[var(--global-toggle-height,0px)] z-[1] bg-base-200"
  >
    <button
      type="button"
      class="flex items-center gap-1.5 bg-transparent border-none p-0 m-0 font-[inherit] cursor-pointer text-left text-inherit"
      onclick={onToggleCategory}
      aria-expanded={isOpen}
    >
      <span
        class="inline-block text-2xs transition-transform duration-150 ease-in-out"
        class:rotate-90={isOpen}>▶</span
      >
      <h2 class="m-0 text-lg">{catLabel}</h2>
    </button>
    {#if isOpen && !flat}
      <button
        type="button"
        class="bg-transparent border border-base-300 rounded-sm px-1.5 py-px text-sm cursor-pointer text-neutral leading-none hover:bg-base-300 hover:text-base-content"
        onclick={onToggleAllLetters}
        title="Tout déplier / replier"
      >
        ±
      </button>
    {/if}
  </div>
  {#if isOpen}
    {#if flat}
      <!-- Flat list: no letter grouping, ordered directly -->
      <ul class="list-none p-0 m-0">
        {#each words as word}
          <li
            class="py-1.5 px-2 pl-5 cursor-pointer border-b border-base-200 hover:bg-primary/10 {uiStore.selectedWord ===
              word && (posLookup[word] || catKey) === uiStore.selectedCategory
              ? 'bg-primary/15 rounded'
              : ''}"
          >
            <button
              type="button"
              class="bg-transparent border-none p-0 m-0 font-[inherit] text-inherit cursor-pointer text-left w-full focus:outline-none rounded-sm"
              onclick={() => handleWordClick(word)}
            >
              {@html getDisplay(word)}
            </button>
          </li>
        {/each}
      </ul>
    {:else if letterGroups}
      {#each [...letterGroups] as [letter, letterWords]}
        <LetterGroup
          {letter}
          words={letterWords}
          isOpen={letterOpenState[`${catKey}:${letter}`] ?? false}
          {catKey}
          {posLookup}
          onToggle={() => onToggleLetter(letter)}
        />
      {/each}
    {/if}
  {/if}
</div>
