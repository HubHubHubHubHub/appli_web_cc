<script>
  import { uiStore } from "$lib/stores/uiStore.svelte.js";
  import { dataStore } from "$lib/stores/dataStore.svelte.js";
  import GrammarTable from "./GrammarTable.svelte";
  import { getPrincipalForm } from "$lib/utils/dataAccess.js";
  import { labelCategory } from "$lib/utils/i18n.js";

  const visible = $derived(uiStore.grammarTableData !== null);

  const headerHTML = $derived.by(() => {
    if (!uiStore.grammarTableData) return "";
    const { word, category } = uiStore.grammarTableData;
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

{#if visible}
  <aside
    class="grammar-sidebar card card-sm fixed right-2.5 top-1/2 -translate-y-1/2 z-grammar-sidebar bg-base-100 w-auto max-w-sm max-h-[85vh] overflow-y-auto text-sm leading-snug max-md:hidden {uiStore.pinnedElement !==
    null
      ? 'border-primary shadow-grammar-pinned'
      : 'shadow-grammar'}"
    aria-label="Grammaire"
  >
    <div class="card-body p-3">
      <div class="px-2 py-1.5 mb-1 border-b border-base-300 text-sm">
        {@html headerHTML}
      </div>
      <GrammarTable data={uiStore.grammarTableData} />
    </div>
  </aside>
{/if}
