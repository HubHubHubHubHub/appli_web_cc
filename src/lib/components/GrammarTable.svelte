<script>
  import {
    generateTableNoun,
    generateTableProper,
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
      if (category === "nom") {
        const d = wd?.nom?.[word]?.cas;
        if (d) return generateTableNoun(d, infos[1], infos[2]);
      } else if (category === "proper") {
        const d = wd?.proper?.[word]?.cas;
        if (d) return generateTableProper(d, infos[1]);
      } else if (["adj", "card", "proposs", "pron"].includes(category)) {
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
