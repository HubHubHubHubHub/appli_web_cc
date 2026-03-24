<script>
	import { wordData } from '$lib/stores/dataStore.js';
	import { selectedWord, selectedCategory, accentEnabled } from '$lib/stores/uiStore.js';
	import { getPrincipalForm } from '$lib/utils/dataAccess.js';
	import { addAccent } from '$lib/utils/accent.js';
	import { firstPair } from '$lib/utils/parsing.js';
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
		if ($selectedCategory === 'verb' && details?.asp) {
			const aspLabel = details.asp === 'imperfectif' ? 'imp.' : details.asp === 'perfectif' ? 'p.' : '';
			return aspLabel ? `v. ${aspLabel}` : cat;
		}
		return cat;
	});

	const couplDisplay = $derived.by(() => {
		if ($selectedCategory !== 'verb' || !details?.coupl) return '';
		const couplVerb = $wordData?.verb?.[details.coupl];
		if (!couplVerb?.inf) return details.coupl;
		const pair = firstPair(couplVerb.inf);
		return pair ? addAccent(pair[0], pair[1]) : details.coupl;
	});
</script>

<div class="max-w-3xl mx-auto p-6 text-[1.2rem]">
	{#if details}
		<h2 class="text-xl font-semibold">{displayWord} <span class="badge badge-ghost text-xs font-normal align-middle ml-2">{displayMeta}</span>{#if couplDisplay} <span class="text-sm font-normal ml-2">— couple asp. : {couplDisplay}</span>{/if}</h2>

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
	{:else}
		<p class="text-neutral italic">Sélectionnez un mot dans la liste.</p>
	{/if}
</div>

