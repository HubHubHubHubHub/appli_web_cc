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
	<div class="grammar-sidebar fixed right-2.5 top-1/2 -translate-y-1/2 z-grammar-sidebar bg-white border border-border rounded-[10px] w-auto max-w-[380px] max-h-[85vh] overflow-y-auto text-[0.95rem] leading-[1.2] px-2.5 py-2 shadow-grammar {$pinnedElement !== null ? 'border-pinned-border shadow-grammar-pinned' : ''}">
		<div class="my-1.5 mb-2 px-2 py-1.5 rounded-md bg-black/[.04] text-[15px]">
			{@html headerHTML}
		</div>
		<GrammarTable data={$grammarTableData} />
	</div>
{/if}
