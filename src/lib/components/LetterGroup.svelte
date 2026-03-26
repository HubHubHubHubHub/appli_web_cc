<script>
  import { dataStore } from "$lib/stores/dataStore.svelte.js";
  import { uiStore } from "$lib/stores/uiStore.svelte.js";
  import { getPrincipalForm } from "$lib/utils/dataAccess.js";

  let { letter, words, isOpen, catKey, posLookup = {}, onToggle } = $props();

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

<div>
  <button
    type="button"
    class="flex items-center gap-1.5 bg-transparent border-none py-1 pl-3 pr-0 m-0 font-[inherit] cursor-pointer w-full text-left text-neutral hover:text-base-content"
    onclick={onToggle}
  >
    <span
      class="inline-block text-2xs transition-transform duration-150 ease-in-out"
      class:rotate-90={isOpen}>▶</span
    >
    <span class="font-semibold text-base">{letter}</span>
    <span class="text-xs opacity-50">({words.length})</span>
  </button>
  {#if isOpen}
    <ul class="list-none p-0 m-0">
      {#each words as word}
        <li class="py-1.5 px-2 pl-5 cursor-pointer border-b border-base-200 hover:bg-base-200">
          <button
            type="button"
            class="bg-transparent border-none p-0 m-0 font-[inherit] text-inherit cursor-pointer text-left w-full"
            onclick={() => handleWordClick(word)}
          >
            {@html getDisplay(word)}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>
