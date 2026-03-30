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
  import PrepDetails from "./PrepDetails.svelte";
  import PredDetails from "./PredDetails.svelte";
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

<div
  class="max-w-3xl mx-auto p-6 text-[1.2rem]"
  style:zoom={uiStore.contentScale === 1 ? null : uiStore.contentScale}
>
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
    {:else if uiStore.selectedCategory === "prep"}
      <PrepDetails {details} />
    {:else if uiStore.selectedCategory === "pred"}
      <PredDetails {details} />
    {:else if ["conj", "part", "adv", "intj", "insert"].includes(uiStore.selectedCategory)}
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
    <div class="empty-state">
      <svg
        class="empty-state-tryzub"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="-62 10 124 205"
        fill="currentColor"
      >
        <path
          d="M5.985561 78.82382a104.079383 104.079383 0 0 0 14.053598 56.017033 55 55 0 0 1-13.218774 70.637179A20 20 0 0 0 0 212.5a20 20 0 0 0-6.820384-7.021968 55 55 0 0 1-13.218774-70.637179A104.079383 104.079383 0 0 0-5.98556 78.82382l-1.599642-45.260519A30.103986 30.103986 0 0 1 0 12.5a30.103986 30.103986 0 0 1 7.585202 21.063301zM5 193.624749a45 45 0 0 0 6.395675-53.75496A114.079383 114.079383 0 0 1 0 112.734179a114.079383 114.079383 0 0 1-11.395675 27.13561A45 45 0 0 0-5 193.624749V162.5H5z"
        />
        <path
          id="a"
          d="M27.779818 75.17546A62.64982 62.64982 0 0 1 60 27.5v145H0l-5-10a22.5 22.5 0 0 1 17.560976-21.95122l14.634147-3.292683a10 10 0 1 0-4.427443-19.503751zm5.998315 34.353887a20 20 0 0 1-4.387889 37.482848l-14.634146 3.292683A12.5 12.5 0 0 0 5 162.5h45V48.265462a52.64982 52.64982 0 0 0-12.283879 28.037802zM42 122.5h10v10H42z"
        />
        <use xlink:href="#a" transform="scale(-1 1)" />
      </svg>
      <p class="empty-state-welcome">Ласкаво просимо!</p>
      <p class="empty-state-hint">
        Choisissez un mot dans la liste<br />pour explorer sa grammaire.
      </p>
    </div>
  {/if}
</div>
