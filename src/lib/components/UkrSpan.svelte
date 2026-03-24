<script>
	import { uiStore } from '$lib/stores/uiStore.svelte.js';
	import { dataStore } from '$lib/stores/dataStore.svelte.js';
	import { parseInfo, firstPair, getVariantIndex } from '$lib/utils/parsing.js';
	import { getDataFromJson } from '$lib/utils/dataAccess.js';
	import { highlightLetter } from '$lib/utils/accent.js';
	import { buildBubbleHTML, getHoverColor, getOrCreateBubble, positionBubble, hideBubble } from '$lib/utils/bubble.js';

	let { dataInfo, text } = $props();

	let spanEl = $state(null);

	const tokens = $derived(parseInfo(dataInfo));
	const word = $derived(tokens[0]);
	const category = $derived(tokens[1]);
	const hoverColor = $derived(getHoverColor(tokens));

	// Compute displayed text (with or without accent)
	const displayHTML = $derived.by(() => {
		if (!uiStore.accentEnabled) return text;

		const wd = dataStore.wordData;
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

	function buildGrammarData() {
		const infos = tokens.slice(2);
		return { word, category, infos };
	}

	function handleMouseEnter() {
		if (uiStore.pinnedElement) return;
		const wd = dataStore.wordData;
		const html = buildBubbleHTML(wd, word, category, tokens);
		if (html && html.trim()) {
			const bubble = getOrCreateBubble();
			bubble.innerHTML = html;
			bubble.style.display = 'block';
			positionBubble(bubble, spanEl);
		}
		uiStore.grammarTableData = buildGrammarData();
	}

	function handleMouseLeave() {
		hideBubble();
		if (!uiStore.pinnedElement) {
			uiStore.grammarTableData = null;
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
		if (uiStore.pinnedElement === spanEl) {
			uiStore.pinnedElement = null;
			uiStore.grammarTableData = null;
			return;
		}

		uiStore.grammarTableData = buildGrammarData();
		uiStore.pinnedElement = spanEl;
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
