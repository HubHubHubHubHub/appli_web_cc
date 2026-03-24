<script>
  import { dataStore } from "$lib/stores/dataStore.svelte.js";
  import { uiStore } from "$lib/stores/uiStore.svelte.js";
  import { getPrincipalForm } from "$lib/utils/dataAccess.js";
  import { addAccent } from "$lib/utils/accent.js";
  import { firstPair } from "$lib/utils/parsing.js";
  import NounDetails from "./NounDetails.svelte";
  import AdjectiveDetails from "./AdjectiveDetails.svelte";
  import VerbDetails from "./VerbDetails.svelte";
  import BaseDetails from "./BaseDetails.svelte";
  import ExamplePhrases from "./ExamplePhrases.svelte";

  const shortCategory = {
    nom: "n.",
    verb: "v.",
    adj: "adj.",
    proposs: "pron.pos.",
    proper: "pron.per.",
    card: "card.",
    pron: "pron.",
    adv: "adv.",
    conj: "conj.",
    part: "part.",
    prep: "prép.",
  };

  const details = $derived(
    uiStore.selectedWord && uiStore.selectedCategory && dataStore.wordData[uiStore.selectedCategory]
      ? dataStore.wordData[uiStore.selectedCategory][uiStore.selectedWord]
      : null,
  );

  const displayWord = $derived.by(() => {
    if (!uiStore.selectedWord || !uiStore.selectedCategory) return "";
    if (uiStore.accentEnabled)
      return getPrincipalForm(dataStore.wordData, uiStore.selectedWord, uiStore.selectedCategory);
    return uiStore.selectedWord;
  });

  const displayMeta = $derived.by(() => {
    if (!uiStore.selectedCategory) return "";
    const cat = shortCategory[uiStore.selectedCategory] ?? uiStore.selectedCategory;
    if (uiStore.selectedCategory === "nom" && details?.genre) {
      return `${cat}${details.genre}.`;
    }
    if (uiStore.selectedCategory === "verb" && details?.asp) {
      const aspLabel =
        details.asp === "imperfectif" ? "imp." : details.asp === "perfectif" ? "p." : "";
      return aspLabel ? `v. ${aspLabel}` : cat;
    }
    return cat;
  });

  const couplDisplay = $derived.by(() => {
    if (uiStore.selectedCategory !== "verb" || !details?.coupl) return "";
    const couplVerb = dataStore.wordData?.verb?.[details.coupl];
    if (!couplVerb?.inf) return details.coupl;
    const pair = firstPair(couplVerb.inf);
    return pair ? addAccent(pair[0], pair[1]) : details.coupl;
  });
</script>

<div class="max-w-3xl mx-auto p-6 text-[1.2rem]">
  {#if details}
    <h2 class="text-xl font-semibold">
      {displayWord}
      <span class="badge badge-ghost text-xs font-normal align-middle ml-2">{displayMeta}</span
      >{#if couplDisplay}
        <span class="text-sm font-normal ml-2">— couple asp. : {couplDisplay}</span>{/if}
    </h2>

    {#if uiStore.selectedCategory === "nom"}
      <NounDetails {details} />
    {:else if ["adj", "proposs", "card", "pron"].includes(uiStore.selectedCategory)}
      <AdjectiveDetails {details} />
    {:else if uiStore.selectedCategory === "verb"}
      <VerbDetails {details} />
    {:else if ["conj", "part"].includes(uiStore.selectedCategory)}
      <BaseDetails {details} />
    {:else}
      <p>Catégorie non prise en charge.</p>
    {/if}

    {#if details.phrases}
      <ExamplePhrases phrases={details.phrases} />
    {/if}
  {:else if uiStore.selectedWord}
    <p>Aucun détail disponible pour ce mot.</p>
  {:else}
    <p class="text-neutral italic">Sélectionnez un mot dans la liste.</p>
  {/if}
</div>
