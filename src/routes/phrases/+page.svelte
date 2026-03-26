<script>
  import PhraseList from "$lib/components/PhraseList.svelte";
  import { uiStore } from "$lib/stores/uiStore.svelte.js";
</script>

<svelte:head>
  <title>Recherche de Phrases</title>
</svelte:head>

<main class="max-w-4xl mx-auto px-6 pb-11 font-body">
  <h1 class="text-2xl font-semibold mt-4 mb-2" style:zoom={uiStore.contentScale === 1 ? null : uiStore.contentScale}>Recherche de phrases</h1>
  <PhraseList contentScale={uiStore.contentScale} />
</main>
