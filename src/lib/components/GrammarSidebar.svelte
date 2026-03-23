<script>
	import { grammarTableData, pinnedElement } from '$lib/stores/uiStore.js';
	import GrammarTable from './GrammarTable.svelte';
	import { getPrincipalForm } from '$lib/utils/dataAccess.js';
	import { labelCategory } from '$lib/utils/i18n.js';

	const visible = $derived($grammarTableData !== null);

	const headerHTML = $derived.by(() => {
		if (!$grammarTableData) return '';
		const { word, category, wordData } = $grammarTableData;
		let meta = labelCategory(category);
		if (category === 'verb') {
			const asp = wordData?.verb?.[word]?.asp;
			if (asp === 'imperfectif') meta += ', imperf.';
			else if (asp === 'perfectif') meta += ', perf.';
		} else if (category === 'nom') {
			const g = wordData?.nom?.[word]?.genre;
			if (g) meta += `, ${g}`;
		}
		const head = getPrincipalForm(wordData, word, category);
		return `<strong style="font-weight:600;">${head}</strong> <span style="opacity:.8;"> — ${meta}</span>`;
	});
</script>

{#if visible}
	<div class="grammar-sidebar" class:pinned={$pinnedElement !== null}>
		<div class="lemma-head">
			{@html headerHTML}
		</div>
		<GrammarTable data={$grammarTableData} />
	</div>
{/if}
