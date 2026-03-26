<script>
  import {
    generateTableNoun,
    generateTablePron,
    generateTableAdj,
    generateTableVerb,
  } from "$lib/utils/tableGeneration.js";
  import { dataStore } from "$lib/stores/dataStore.svelte.js";

  let { data: tag } = $props();

  const tableHTML = $derived.by(() => {
    if (!tag || !tag.pos || !tag.lemma) return "";
    const wd = dataStore.wordData;
    const word = tag.lemma;
    const category = tag.pos;

    try {
      if (category === "noun") {
        const d = wd?.noun?.[word]?.cas;
        if (d) return generateTableNoun(d, tag.case, tag.number);
      } else if (category === "pron") {
        const d = wd?.pron?.[word]?.cas;
        if (d) return generateTablePron(d, tag.case);
      } else if (category === "num") {
        const d = wd?.num?.[word]?.cas;
        if (d) {
          const sample = d.nom || d.gen || Object.values(d)[0];
          if (Array.isArray(sample)) return generateTablePron(d, tag.case);
          if (sample?.sg !== undefined) return generateTableNoun(d, tag.case, tag.number);
          return generateTableAdj(d, tag.case, tag.gender);
        }
      } else if (category === "adj") {
        const d = wd?.adj?.[word]?.cas;
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
