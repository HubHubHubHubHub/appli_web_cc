<script>
  import {
    generateTableNoun,
    generateTablePron,
    generateTableAdj,
    generateTableVerb,
  } from "$lib/utils/tableGeneration.js";
  import { dataStore } from "$lib/stores/dataStore.svelte.js";

  let { data } = $props();

  const tableHTML = $derived.by(() => {
    if (!data) return "";
    const { word, category, infos } = data;
    const wd = dataStore.wordData;

    try {
      if (category === "noun") {
        const d = wd?.noun?.[word]?.cas;
        if (d) return generateTableNoun(d, infos[1], infos[2]);
      } else if (category === "pron") {
        const d = wd?.pron?.[word]?.cas;
        if (d) return generateTablePron(d, infos[1]);
      } else if (["adj", "num"].includes(category)) {
        const d = wd?.[category]?.[word]?.cas;
        if (d) return generateTableAdj(d, infos[1], infos[2]);
      } else if (category === "verb") {
        const v = wd?.verb?.[word];
        if (v) return generateTableVerb(v, wd);
      }
    } catch (err) {
      console.warn(`GrammarTable: erreur pour "${word}" (${category}) :`, err);
    }
    return "";
  });
</script>

{#if tableHTML}
  {@html tableHTML}
{/if}
