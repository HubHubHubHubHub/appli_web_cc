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

<div id="wordList" class="grow overflow-y-auto pr-1.5" style="--global-toggle-height: 38px; scrollbar-width: thin; scrollbar-color: var(--color-scrollbar-thumb) var(--color-scrollbar-track); scrollbar-gutter: stable;">
	<button type="button" class="block w-full bg-base-200 border border-base-300 rounded px-2.5 py-1.5 mb-0 font-[inherit] text-sm cursor-pointer text-neutral text-left sticky top-0 z-[2] hover:bg-base-300 hover:text-base-content" onclick={toggleAll}>
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

