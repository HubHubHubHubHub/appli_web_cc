<script>
	import { wordData } from '$lib/stores/dataStore.js';
	import { selectedWord, selectedCategory } from '$lib/stores/uiStore.js';
	import { groupByFirstLetter } from '$lib/utils/ukrainianSort.js';
	import { hasAnyExpanded } from '$lib/utils/foldState.js';
	import CategorySection from './CategorySection.svelte';

	const categories = {
		nom: 'Noms',
		adj: 'Adjectifs',
		pron: 'Pronoms (déterminants)',
		verb: 'Verbes',
		conj: 'Conjonctions',
		part: 'Particules',
		card: 'Cardinaux',
		proposs: 'Pronoms possessifs',
		proper: 'Pronoms personnels',
		prep: 'Prépositions',
	};

	let categoryOpen = $state({});
	let letterOpen = $state({});
	let initialized = false;

	// Compute grouped data per category
	let groupedData = $derived(
		Object.fromEntries(
			Object.keys(categories)
				.filter((catKey) => $wordData[catKey] && Object.keys($wordData[catKey]).length > 0)
				.map((catKey) => [catKey, groupByFirstLetter(Object.keys($wordData[catKey]))])
		)
	);

	// True when at least one category or letter group is open (drives the toggle label)
	let anyExpanded = $derived(hasAnyExpanded(groupedData, categoryOpen, letterOpen));

	// Initialize fold state when data loads (once)
	$effect(() => {
		const data = $wordData;
		if (!data || Object.keys(data).length === 0) return;
		if (initialized) return;
		initialized = true;

		const newCatOpen = {};
		const newLetterOpen = {};
		for (const catKey of Object.keys(categories)) {
			const groups = groupedData[catKey];
			if (groups) {
				newCatOpen[catKey] = true;
				for (const letter of groups.keys()) {
					newLetterOpen[`${catKey}:${letter}`] = false;
				}
			}
		}
		categoryOpen = newCatOpen;
		letterOpen = newLetterOpen;
	});

	function toggleCategory(catKey) {
		categoryOpen = { ...categoryOpen, [catKey]: !categoryOpen[catKey] };
	}

	function toggleAllLetters(catKey) {
		const groups = groupedData[catKey];
		if (!groups) return;
		const letters = [...groups.keys()];
		const anyOpen = letters.some((l) => letterOpen[`${catKey}:${l}`]);
		const updated = { ...letterOpen };
		for (const l of letters) {
			updated[`${catKey}:${l}`] = !anyOpen;
		}
		letterOpen = updated;
	}

	function toggleLetter(catKey, letter) {
		letterOpen = { ...letterOpen, [`${catKey}:${letter}`]: !letterOpen[`${catKey}:${letter}`] };
	}

	function toggleAll() {
		const expand = !anyExpanded;
		const newCatOpen = {};
		const newLetterOpen = {};
		for (const catKey of Object.keys(groupedData)) {
			newCatOpen[catKey] = expand;
			for (const letter of groupedData[catKey].keys()) {
				newLetterOpen[`${catKey}:${letter}`] = expand;
			}
		}
		categoryOpen = newCatOpen;
		letterOpen = newLetterOpen;
	}

	function handleWordClick(word, catKey) {
		selectedWord.set(word);
		selectedCategory.set(catKey);
	}
</script>

<div id="wordList">
	<button type="button" class="global-toggle" onclick={toggleAll}>
		{anyExpanded ? '▼ Tout replier' : '▶ Tout déplier'}
	</button>

	{#each Object.entries(categories) as [catKey, catLabel]}
		{#if groupedData[catKey]}
			<CategorySection
				{catKey}
				{catLabel}
				isOpen={categoryOpen[catKey] ?? true}
				letterGroups={groupedData[catKey]}
				letterOpenState={letterOpen}
				wordData={$wordData[catKey]}
				onToggleCategory={() => toggleCategory(catKey)}
				onToggleAllLetters={() => toggleAllLetters(catKey)}
				onToggleLetter={(letter) => toggleLetter(catKey, letter)}
				onWordClick={handleWordClick}
			/>
		{/if}
	{/each}
</div>

<style>
	#wordList {
		--global-toggle-height: 38px;
		flex-grow: 1;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: #b0b0b0 #e0e0e0;
		scrollbar-gutter: stable;
		padding-right: 6px;
	}

	.global-toggle {
		display: block;
		width: 100%;
		background-color: #f0f0f0;
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 6px 10px;
		margin-bottom: 0;
		font: inherit;
		font-size: 0.85em;
		cursor: pointer;
		color: #555;
		text-align: left;
		position: sticky;
		top: 0;
		z-index: 2;
	}

	.global-toggle:hover {
		background-color: #e0e0e0;
		color: #222;
	}
</style>
