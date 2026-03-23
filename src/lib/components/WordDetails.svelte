<script>
	import { wordData } from '$lib/stores/dataStore.js';
	import { selectedWord, selectedCategory, accentEnabled } from '$lib/stores/uiStore.js';
	import { getPrincipalForm } from '$lib/utils/dataAccess.js';
	import NounDetails from './NounDetails.svelte';
	import AdjectiveDetails from './AdjectiveDetails.svelte';
	import VerbDetails from './VerbDetails.svelte';
	import BaseDetails from './BaseDetails.svelte';
	import ExamplePhrases from './ExamplePhrases.svelte';

	const shortCategory = {
		nom: 'n.',
		verb: 'v.',
		adj: 'adj.',
		proposs: 'pron.pos.',
		proper: 'pron.per.',
		card: 'card.',
		pron: 'pron.',
		adv: 'adv.',
		conj: 'conj.',
		part: 'part.',
		prep: 'prép.',
	};

	const details = $derived(
		$selectedWord && $selectedCategory && $wordData[$selectedCategory]
			? $wordData[$selectedCategory][$selectedWord]
			: null
	);

	const displayWord = $derived.by(() => {
		if (!$selectedWord || !$selectedCategory) return '';
		if ($accentEnabled) return getPrincipalForm($wordData, $selectedWord, $selectedCategory);
		return $selectedWord;
	});

	const displayMeta = $derived.by(() => {
		if (!$selectedCategory) return '';
		const cat = shortCategory[$selectedCategory] ?? $selectedCategory;
		if ($selectedCategory === 'nom' && details?.genre) {
			return `${cat}${details.genre}.`;
		}
		return cat;
	});
</script>

<div class="word-details">
	{#if details}
		<h2>{displayWord} <span class="word-meta">: {displayMeta}</span></h2>

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

	.word-meta {
		font-size: 0.65em;
		font-weight: normal;
		color: #666;
		vertical-align: middle;
	}
</style>
