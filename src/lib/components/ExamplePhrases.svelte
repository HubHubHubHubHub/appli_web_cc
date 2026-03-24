<script>
  import { dataStore } from "$lib/stores/dataStore.svelte.js";
  import { generateVerbForms } from "$lib/utils/gramFunc.js";
  import HtmlContent from "./HtmlContent.svelte";

  let { phrases } = $props();

  let expandedVerbs = $state({});

  function toggleVerbForms(key) {
    expandedVerbs[key] = !expandedVerbs[key];
  }

  function getVerbFormsHTML(genereVerbe) {
    return generateVerbForms(
      dataStore.wordData,
      genereVerbe.verbe,
      genereVerbe.temps,
      genereVerbe.frag1,
      genereVerbe.frag2,
    );
  }
</script>

<ul class="mt-6 text-base">
  {#each Object.entries(phrases) as [phraseKey, _phrase]}
    {@const pd = dataStore.phraseData[phraseKey]}
    {#if pd}
      <li>
        <HtmlContent html={pd.phrase_html} />
        <br /><em>{pd.traduction}</em>
        {#if pd.remarque}
          <p class="remarque">{pd.remarque}</p>
        {/if}
        {#if pd.genereVerbe}
          <label>
            <input
              type="checkbox"
              checked={expandedVerbs[phraseKey] || false}
              onchange={() => toggleVerbForms(phraseKey)}
            />
            Afficher les formes verbales
          </label>
          {#if expandedVerbs[phraseKey]}
            <div class="verb-forms-container" style="display: block;">
              <HtmlContent html={getVerbFormsHTML(pd.genereVerbe)} />
            </div>
          {/if}
        {/if}
      </li>
    {/if}
  {/each}
</ul>
