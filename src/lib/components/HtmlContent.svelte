<script>
  import { dataStore } from "$lib/stores/dataStore.svelte.js";
  import { uiStore } from "$lib/stores/uiStore.svelte.js";
  import { applyAccents } from "$lib/utils/accentDom.js";
  import { applyHoverHandlers } from "$lib/utils/hoverHandlers.js";

  let { html, disableHover = false } = $props();
  let container = $state(null);

  const hoverDeps = {
    getWordData: () => dataStore.wordData,
    getPinnedElement: () => uiStore.pinnedElement,
    setPinnedElement: (val) => {
      uiStore.pinnedElement = val;
    },
    setGrammarTableData: (val) => {
      uiStore.grammarTableData = val;
    },
  };

  $effect(() => {
    const _ = uiStore.accentEnabled;
    const __ = html;
    if (!container) return;

    applyAccents(container, dataStore.wordData, uiStore.accentEnabled);

    const cleanups = [];
    if (!disableHover) {
      cleanups.push(...applyHoverHandlers(container, hoverDeps));
    }

    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  });
</script>

<span bind:this={container}>
  {@html html}
</span>
