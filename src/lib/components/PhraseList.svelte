<script>
	import { phraseData } from '$lib/stores/dataStore.js';
	import { filterPhrases } from '$lib/utils/phrases.js';
	import HtmlContent from './HtmlContent.svelte';

	let searchQuery = $state('');

	const filteredPhrases = $derived(
		filterPhrases($phraseData, searchQuery.trim())
	);
</script>

<div class="search-box">
	<input type="text" bind:value={searchQuery} placeholder="Rechercher..." />
</div>

<ul class="phrase-list">
	{#each Object.entries(filteredPhrases) as [phraseKey, phraseInfo]}
		<li>
			<div class="phrase-html">
				<HtmlContent html={phraseInfo.phrase_html} />
			</div>
			<div class="traduction">{phraseInfo.traduction}</div>
			{#if phraseInfo.ref}
				<div class="references">Références : {JSON.stringify(phraseInfo.ref)}</div>
			{/if}
		</li>
	{/each}
</ul>

<style>
	.search-box {
		position: fixed;
		top: 20px;
		right: 20px;
		background-color: rgba(255, 255, 255, 0.9);
		padding: 10px;
		border-radius: 5px;
		z-index: 1000;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
	}

	.phrase-list {
		list-style-type: none;
		padding: 0;
	}

	.phrase-list li {
		margin-bottom: 15px;
	}

	.phrase-html {
		font-weight: bold;
	}

	.traduction {
		font-style: italic;
		color: #555;
	}
</style>
