<script>
  import { dataStore } from "$lib/stores/dataStore.svelte.js";
  import { uiStore } from "$lib/stores/uiStore.svelte.js";
  import { getPrincipalForm } from "$lib/utils/dataAccess.js";
  import { addAccentHTML } from "$lib/utils/accent.js";
  import { firstPair } from "$lib/utils/parsing.js";
  import NounDetails from "./NounDetails.svelte";
  import AdjectiveDetails from "./AdjectiveDetails.svelte";
  import PronDetails from "./PronDetails.svelte";
  import VerbDetails from "./VerbDetails.svelte";
  import BaseDetails from "./BaseDetails.svelte";
  import ExamplePhrases from "./ExamplePhrases.svelte";

  const shortCategory = {
    noun: "n.",
    verb: "v.",
    adj: "adj.",
    pron: "pron.",
    num: "num.",
    adv: "adv.",
    conj: "conj.",
    part: "part.",
    prep: "prép.",
    intj: "intj.",
    pred: "préd.",
    insert: "par.",
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
    if (!uiStore.selectedCategory || !details) return "";
    const cat = shortCategory[uiStore.selectedCategory] ?? uiStore.selectedCategory;
    const meta = details.meta || {};
    if (meta.pos === "noun" && meta.gender) {
      return `${cat}${meta.gender}.`;
    }
    if (meta.pos === "verb" && meta.aspect) {
      const aspLabel =
        meta.aspect === "impf"
          ? "imp."
          : meta.aspect === "perf"
            ? "p."
            : meta.aspect === "biaspect"
              ? "bi."
              : "";
      return aspLabel ? `v. ${aspLabel}` : cat;
    }
    return cat;
  });

  const couplDisplay = $derived.by(() => {
    if (uiStore.selectedCategory !== "verb" || !details?.meta?.couple) return "";
    const couple = details.meta.couple;
    const couplVerb = dataStore.wordData?.verb?.[couple];
    if (!couplVerb?.inf) return couple;
    const pair = firstPair(couplVerb.inf);
    return pair ? addAccentHTML(pair[0], pair[1]) : couple;
  });
</script>

<div class="max-w-3xl mx-auto p-6 text-[1.2rem]">
  {#if details}
    <h2 class="text-xl font-semibold">
      {@html displayWord}
      <span class="badge badge-ghost text-xs font-normal align-middle ml-2">{displayMeta}</span
      >{#if couplDisplay}
        <button
          type="button"
          class="text-sm font-normal ml-2 bg-transparent border-none p-0 m-0 cursor-pointer text-primary hover:underline"
          onclick={() => {
            uiStore.selectedWord = details.meta.couple;
            uiStore.selectedCategory = "verb";
          }}>— couple asp. : {@html couplDisplay}</button
        >{/if}
    </h2>

    {#if uiStore.selectedCategory === "noun"}
      <NounDetails {details} />
    {:else if uiStore.selectedCategory === "num"}
      {#if details.cas && Array.isArray(details.cas.nom)}
        <PronDetails {details} />
      {:else if details.cas?.nom?.sg !== undefined}
        <NounDetails {details} />
      {:else}
        <AdjectiveDetails {details} />
      {/if}
    {:else if uiStore.selectedCategory === "adj"}
      <AdjectiveDetails {details} />
    {:else if uiStore.selectedCategory === "pron"}
      <PronDetails {details} />
    {:else if uiStore.selectedCategory === "verb"}
      <VerbDetails {details} />
    {:else if ["conj", "part", "prep", "adv", "intj", "pred", "insert"].includes(uiStore.selectedCategory)}
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
