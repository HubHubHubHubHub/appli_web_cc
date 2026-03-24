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
		return `<span class="gram-header-word">${head}</span> <span class="gram-header-meta"> — ${meta}</span>`;
	});
</script>

{#if visible}
	<div class="grammar-sidebar card card-sm fixed right-2.5 top-1/2 -translate-y-1/2 z-grammar-sidebar bg-base-100 w-auto max-w-sm max-h-[85vh] overflow-y-auto text-sm leading-snug {$pinnedElement !== null ? 'border-primary shadow-grammar-pinned' : 'shadow-grammar'}">
		<div class="card-body p-3">
			<div class="px-2 py-1.5 mb-1 border-b border-base-300 text-sm">
				{@html headerHTML}
			</div>
			<GrammarTable data={$grammarTableData} />
		</div>
	</div>
{/if}
