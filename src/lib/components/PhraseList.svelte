<script>
	import { phraseData } from '$lib/stores/dataStore.js';
	import { filterPhrases } from '$lib/utils/phrases.js';
	import HtmlContent from './HtmlContent.svelte';

	let searchQuery = $state('');

	const filteredPhrases = $derived(
		filterPhrases($phraseData, searchQuery.trim())
	);
</script>

<div class="fixed top-5 right-5 bg-white/90 p-2.5 rounded-md shadow-floating z-floating">
	<input type="text" bind:value={searchQuery} placeholder="Rechercher..." />
</div>

<ul class="list-none p-0">
	{#each Object.entries(filteredPhrases) as [phraseKey, phraseInfo]}
		<li class="mb-4">
			<div class="font-bold">
				<HtmlContent html={phraseInfo.phrase_html} />
			</div>
			<div class="italic text-text-muted">{phraseInfo.traduction}</div>
			{#if phraseInfo.ref}
				<div class="references">Références : {JSON.stringify(phraseInfo.ref)}</div>
			{/if}
		</li>
	{/each}
</ul>
