<script>
  import { dataStore } from "$lib/stores/dataStore.svelte.js";
  import { filterPhrases } from "$lib/utils/phrases.js";
  import HtmlContent from "./HtmlContent.svelte";

  let searchQuery = $state("");

  const filteredPhrases = $derived(filterPhrases(dataStore.phraseData, searchQuery.trim()));
  const resultCount = $derived(Object.keys(filteredPhrases).length);
  const totalCount = $derived(dataStore.phraseData ? Object.keys(dataStore.phraseData).length : 0);
</script>

<div
  class="sticky top-[var(--header-height)] bg-base-100/95 backdrop-blur-sm py-3 z-30 border-b border-base-300 mb-4"
>
  <input
    id="phrase-search"
    type="text"
    class="input input-bordered w-full"
    bind:value={searchQuery}
    placeholder="Rechercher une phrase (mots séparés par des espaces)..."
  />
  <p class="text-sm text-neutral mt-1.5 mb-0">
    {#if searchQuery.trim()}
      {resultCount} / {totalCount}
      {resultCount === 1 ? "phrase trouvée" : "phrases trouvées"}
    {:else}
      {totalCount} phrases
    {/if}
  </p>
</div>

{#if resultCount === 0}
  <p class="text-neutral italic py-8 text-center">
    {searchQuery.trim() ? "Aucune phrase trouvée." : "Aucune phrase disponible."}
  </p>
{:else}
  <div class="flex flex-col gap-3">
    {#each Object.entries(filteredPhrases) as [phraseKey, phraseInfo]}
      <div
        class="p-4 rounded-lg border border-base-300 hover:border-base-content/20 transition-colors"
      >
        <div class="text-[1.1rem] leading-relaxed">
          <HtmlContent html={phraseInfo.phrase_html} />
        </div>
        {#if phraseInfo.traduction}
          <div class="italic text-neutral mt-2 text-[0.95rem]">{phraseInfo.traduction}</div>
        {/if}
        {#if phraseInfo.remarque}
          <div class="text-sm text-neutral/70 mt-1.5 border-l-2 border-base-300 pl-2">
            {phraseInfo.remarque}
          </div>
        {/if}
      </div>
    {/each}
  </div>
{/if}
