<script>
	import { accentEnabled, pinnedElement, grammarTableData } from '$lib/stores/uiStore.js';
	import { wordData } from '$lib/stores/dataStore.js';
	import { parseInfo, firstPair, getVariantIndex } from '$lib/utils/parsing.js';
	import { getDataFromJson, getPrincipalForm, getLemmaEntry } from '$lib/utils/dataAccess.js';
	import { addAccent, highlightLetter } from '$lib/utils/accent.js';
	import { labelCategory, labelTense, labelNumber } from '$lib/utils/i18n.js';
	import { classesToColors } from '$lib/utils/colors.js';
	import { get } from 'svelte/store';

	let { dataInfo, text } = $props();

	let spanEl = $state(null);
	let showBubble = $state(false);
	let bubbleHTML = $state('');
	let bubbleStyle = $state('');
	let hoverColor = $state('inherit');

	const tokens = $derived(parseInfo(dataInfo));
	const word = $derived(tokens[0]);
	const category = $derived(tokens[1]);

	// Compute hover color
	$effect(() => {
		let color = 'inherit';
		for (const [className, c] of Object.entries(classesToColors)) {
			if (tokens.includes(className)) { color = c; break; }
		}
		hoverColor = color;
	});

	// Compute displayed text (with or without accent)
	const displayHTML = $derived.by(() => {
		if (!$accentEnabled) return text;

		const wd = $wordData;
		const infos = [word, ...tokens.slice(2)];
		const variantIndex = getVariantIndex(tokens);
		const entry = getDataFromJson(wd, category, infos);

		if (entry) {
			const pair = firstPair(entry, variantIndex);
			if (pair && Number.isInteger(pair[1]) && pair[1] > 0) {
				const pos0 = pair[1] - 1;
				return highlightLetter(text, pos0, 'accent');
			}
		}
		return text;
	});

	function buildBubbleHTML() {
		const wd = $wordData;
		const infos = tokens.slice(1);
		const filtered = infos.filter(t => t !== 'cas' && t !== 'base');

		// Insert gender for nouns
		if (category === 'nom') {
			const g = wd?.nom?.[word]?.genre;
			if (g) filtered.splice(1, 0, g);
		}

		// i18n mapping
		if (filtered.length) {
			filtered[0] = labelCategory(filtered[0]);
			for (let i = 1; i < filtered.length; i++) {
				filtered[i] = labelTense(filtered[i]);
				filtered[i] = labelNumber(filtered[i]);
			}
		}

		const variantIndex = getVariantIndex(tokens);
		const lemmaEntry = getLemmaEntry(wd, category, word);
		const pair = firstPair(lemmaEntry, variantIndex);

		if (pair) {
			const [mot, pos] = pair;
			const accented = addAccent(mot, pos);
			return `<strong>${accented}</strong>${filtered.length ? ' &nbsp;<em>' + filtered.join(', ') + '</em>' : ''}`;
		}
		return filtered.length ? `<em>${filtered.join(', ')}</em>` : '';
	}

	function buildGrammarData() {
		const wd = $wordData;
		const infos = tokens.slice(2);
		return { word, category, infos, wordData: wd };
	}

	function handleMouseEnter() {
		if ($pinnedElement) return;
		const html = buildBubbleHTML();
		if (html && html.trim()) {
			showBubble = true;
			bubbleHTML = html;
			positionBubble();
		}
		grammarTableData.set(buildGrammarData());
	}

	function handleMouseLeave() {
		showBubble = false;
		if (!$pinnedElement) {
			grammarTableData.set(null);
		}
	}

	function handleKeydown(ev) {
		if (ev.key === 'Enter' || ev.key === ' ') {
			ev.preventDefault();
			handleClick(ev);
		}
	}

	function handleClick(ev) {
		ev.preventDefault();
		const currentPinned = $pinnedElement;

		if (currentPinned === spanEl) {
			pinnedElement.set(null);
			grammarTableData.set(null);
			return;
		}

		grammarTableData.set(buildGrammarData());
		pinnedElement.set(spanEl);
	}

	function positionBubble() {
		if (!spanEl) return;
		const rect = spanEl.getBoundingClientRect();
		const top = window.scrollY + rect.top - 40;
		const left = window.scrollX + rect.left + rect.width / 2;
		bubbleStyle = `top: ${Math.max(window.scrollY + 4, top)}px; left: ${Math.max(4, left)}px; transform: translateX(-50%);`;
	}
</script>

<span
	bind:this={spanEl}
	class="ukr"
	role="button"
	tabindex="0"
	data-info={dataInfo}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	onclick={handleClick}
	onkeydown={handleKeydown}
>
	{@html displayHTML}
</span>

{#if showBubble}
	<div class="absolute z-hover-bubble max-w-[360px] px-2 py-1.5 rounded-md shadow-bubble bg-white/[.98] border border-black/10 text-sm leading-[1.25] pointer-events-none" style={bubbleStyle}>
		{@html bubbleHTML}
	</div>
{/if}
