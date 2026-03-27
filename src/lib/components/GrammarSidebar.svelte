<script>
  import { fly } from "svelte/transition";
  import { uiStore } from "$lib/stores/uiStore.svelte.js";
  import { dataStore } from "$lib/stores/dataStore.svelte.js";
  import GrammarTable from "./GrammarTable.svelte";
  import { getPrincipalForm } from "$lib/utils/dataAccess.js";
  import { labelCategory } from "$lib/utils/i18n.js";

  const visible = $derived(uiStore.grammarTableData !== null);

  function handleKeydown(ev) {
    if (ev.key === "Escape" && uiStore.pinnedElement !== null) {
      document.querySelectorAll(".ukr").forEach((el) => { el.style.color = ""; el.style.textDecorationColor = ""; });
      uiStore.pinnedElement = null;
      uiStore.grammarTableData = null;
    }
  }

  const headerHTML = $derived.by(() => {
    const tag = uiStore.grammarTableData;
    if (!tag) return "";
    const word = tag.lemma;
    const category = tag.pos;
    const wd = dataStore.wordData;
    let meta = labelCategory(category);
    const entryMeta = wd?.[category]?.[word]?.meta;
    if (category === "verb" && entryMeta?.aspect) {
      if (entryMeta.aspect === "impf") meta += ", imperf.";
      else if (entryMeta.aspect === "perf") meta += ", perf.";
      else if (entryMeta.aspect === "biaspect") meta += ", bi.";
    } else if (category === "noun" && entryMeta?.gender) {
      meta += `, ${entryMeta.gender}`;
    }
    const head = getPrincipalForm(wd, word, category);
    return `<span class="gram-header-word">${head}</span> <span class="gram-header-meta"> — ${meta}</span>`;
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if visible}
  <aside
    transition:fly={{ x: 300, duration: 250 }}
    class="grammar-sidebar card card-sm fixed right-2.5 top-1/2 -translate-y-1/2 z-[2000] bg-base-100 w-auto max-w-sm max-h-[85vh] overflow-y-auto scrollbar-thin text-sm leading-snug max-md:hidden {uiStore.pinnedElement !==
    null
      ? 'border-primary shadow-grammar-pinned'
      : 'shadow-grammar'}"
    aria-label="Grammaire"
    style:zoom={uiStore.contentScale === 1 ? null : uiStore.contentScale}
  >
    <div class="card-body p-3">
      <div
        class="flex items-start justify-between gap-2 px-2 py-1.5 mb-1 border-b border-base-300 text-sm"
      >
        <span>{@html headerHTML}</span>
        {#if uiStore.pinnedElement !== null}
          <button
            type="button"
            class="bg-transparent border-none p-0 m-0 cursor-pointer text-neutral hover:text-base-content text-lg leading-none"
            title="Dépingler"
            onclick={() => {
              document.querySelectorAll(".ukr").forEach((el) => { el.style.color = ""; el.style.textDecorationColor = ""; });
              uiStore.pinnedElement = null;
              uiStore.grammarTableData = null;
            }}>×</button
          >
        {/if}
      </div>
      <GrammarTable data={uiStore.grammarTableData} />
    </div>
  </aside>
{/if}
