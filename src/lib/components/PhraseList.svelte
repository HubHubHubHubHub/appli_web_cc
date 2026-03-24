<script>
	import { dataStore } from '$lib/stores/dataStore.svelte.js';
	import { filterPhrases } from '$lib/utils/phrases.js';
	import HtmlContent from './HtmlContent.svelte';

	let searchQuery = $state('');

	const filteredPhrases = $derived(
		filterPhrases(dataStore.phraseData, searchQuery.trim())
	);
</script>

<div class="fixed top-5 right-5 bg-base-100/90 p-2.5 rounded-md shadow-floating z-floating">
	<label for="phrase-search" class="sr-only">Rechercher une phrase</label>
	<input id="phrase-search" type="text" class="input input-bordered input-sm" bind:value={searchQuery} placeholder="Rechercher..." />
</div>

{#if Object.keys(filteredPhrases).length === 0}
	<p class="text-neutral italic p-6">{searchQuery.trim() ? 'Aucune phrase trouvée.' : 'Aucune phrase disponible.'}</p>
{:else}
	<ul class="list-none p-0">
		{#each Object.entries(filteredPhrases) as [phraseKey, phraseInfo]}
			<li class="mb-4 p-3 rounded-lg hover:bg-base-200 transition-colors">
				<div class="font-bold">
					<HtmlContent html={phraseInfo.phrase_html} />
				</div>
				<div class="italic text-neutral mt-1">{phraseInfo.traduction}</div>
				{#if phraseInfo.ref}
					<div class="references text-sm opacity-60 mt-1">Références : {JSON.stringify(phraseInfo.ref)}</div>
				{/if}
			</li>
		{/each}
	</ul>
{/if}
