<script>
	import { wordData } from '$lib/stores/dataStore.js';
	import { selectedWord, selectedCategory } from '$lib/stores/uiStore.js';
	import NounDetails from './NounDetails.svelte';
	import AdjectiveDetails from './AdjectiveDetails.svelte';
	import VerbDetails from './VerbDetails.svelte';
	import BaseDetails from './BaseDetails.svelte';
	import ExamplePhrases from './ExamplePhrases.svelte';

	const details = $derived(
		$selectedWord && $selectedCategory && $wordData[$selectedCategory]
			? $wordData[$selectedCategory][$selectedWord]
			: null
	);
</script>

<div class="word-details">
	{#if details}
		<h2>{$selectedWord} ({$selectedCategory})</h2>

		{#if $selectedCategory === 'nom'}
			<NounDetails {details} />
		{:else if ['adj', 'proposs', 'card', 'pron'].includes($selectedCategory)}
			<AdjectiveDetails {details} />
		{:else if $selectedCategory === 'verb'}
			<VerbDetails {details} />
		{:else if ['conj', 'part'].includes($selectedCategory)}
			<BaseDetails {details} />
		{:else}
			<p>Catégorie non prise en charge.</p>
		{/if}

		{#if details.phrases}
			<ExamplePhrases phrases={details.phrases} />
		{/if}
	{:else if $selectedWord}
		<p>Aucun détail disponible pour ce mot.</p>
	{/if}
</div>

<style>
	.word-details {
		margin-left: 10%;
		margin-right: 10%;
		padding: 20px;
	}
</style>
