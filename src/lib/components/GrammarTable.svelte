<script>
  import {
    generateTableNoun,
    generateTablePron,
    generateTableAdj,
    generateTableVerb,
  } from "$lib/utils/tableGeneration.js";
  import { dataStore } from "$lib/stores/dataStore.svelte.js";

  let { data } = $props();

  // Parse V2 infos (clé=valeur tokens) into a tag object
  function parseInfos(infos) {
    const t = {};
    for (const s of infos || []) {
      const eq = s.indexOf("=");
      if (eq > 0) t[s.slice(0, eq)] = s.slice(eq + 1);
    }
    return t;
  }

  const tableHTML = $derived.by(() => {
    if (!data) return "";
    const { word, category, infos } = data;
    const wd = dataStore.wordData;
    const tag = parseInfos(infos);

    try {
      if (category === "noun") {
        const d = wd?.noun?.[word]?.cas;
        if (d) return generateTableNoun(d, tag.case, tag.number);
      } else if (category === "pron") {
        const d = wd?.pron?.[word]?.cas;
        if (d) return generateTablePron(d, tag.case);
      } else if (["adj", "num"].includes(category)) {
        const d = wd?.[category]?.[word]?.cas;
        if (d) return generateTableAdj(d, tag.case, tag.gender);
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
