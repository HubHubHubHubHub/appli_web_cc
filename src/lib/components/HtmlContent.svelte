<script>
	import { dataStore } from '$lib/stores/dataStore.svelte.js';
	import { uiStore } from '$lib/stores/uiStore.svelte.js';
	import { parseInfo, firstPair, getVariantIndex } from '$lib/utils/parsing.js';
	import { getDataFromJson } from '$lib/utils/dataAccess.js';
	import { highlightLetter } from '$lib/utils/accent.js';
	import { buildBubbleHTML, getHoverColor, getOrCreateBubble, positionBubble, hideBubble } from '$lib/utils/bubble.js';

	let { html, disableHover = false } = $props();
	let container = $state(null);

	// Re-apply accent highlighting and hover handlers when accentEnabled or html changes
	$effect(() => {
		const _ = uiStore.accentEnabled; // track reactivity
		const __ = html; // track html prop changes
		if (!container) return;

		applyAccents(container);

		const cleanups = [];
		if (!disableHover) {
			cleanups.push(...applyHoverHandlers(container));
		}

		return () => {
			for (const cleanup of cleanups) cleanup();
		};
	});

	function applyAccents(el) {
		const wd = dataStore.wordData;
		const enabled = uiStore.accentEnabled;
		const words = el.querySelectorAll('.ukr');

		words.forEach((word) => {
			if (!word.dataset.original) {
				word.dataset.original = word.textContent;
			}

			if (enabled) {
				const raw = word.getAttribute('data-info');
				if (!raw) return;
				const dataInfo = parseInfo(raw);
				const [lemma, categorie, ...rest] = dataInfo;
				const infos = [lemma, ...rest];
				const variantIndex = getVariantIndex(dataInfo);
				const entry = getDataFromJson(wd, categorie, infos);

				if (entry) {
					const pair = firstPair(entry, variantIndex);
					if (pair && Number.isInteger(pair[1]) && pair[1] > 0) {
						const pos0 = pair[1] - 1;
						word.innerHTML = highlightLetter(word.dataset.original, pos0, 'accent');
						return;
					}
				}
				word.innerHTML = word.dataset.original;
			} else {
				word.innerHTML = word.dataset.original;
			}
		});
	}

	function applyHoverHandlers(el) {
		const cleanups = [];
		const words = el.querySelectorAll('.ukr');

		words.forEach((word) => {
			const raw = word.getAttribute('data-info');
			if (!raw) return;

			word.setAttribute('role', 'button');
			word.setAttribute('tabindex', '0');

			const dataInfo = parseInfo(raw);
			const [w, category, ...infos] = dataInfo;

			const hoverColor = getHoverColor(dataInfo);

			function onMouseEnter() {
				if (uiStore.pinnedElement) return;
				word.style.color = hoverColor;

				const wd = dataStore.wordData;
				uiStore.grammarTableData = { word: w, category, infos };

				const bubble = getOrCreateBubble();
				const bHTML = buildBubbleHTML(wd, w, category, dataInfo);
				if (bHTML && bHTML.trim()) {
					bubble.innerHTML = bHTML;
					bubble.style.display = 'block';
					positionBubble(bubble, word);
				}
			}

			function onMouseLeave() {
				word.style.color = '';
				hideBubble();
				if (!uiStore.pinnedElement) {
					uiStore.grammarTableData = null;
				}
			}

			function onClick(ev) {
				ev.preventDefault();
				if (uiStore.pinnedElement === word) {
					uiStore.pinnedElement = null;
					uiStore.grammarTableData = null;
					return;
				}

				uiStore.grammarTableData = { word: w, category, infos };
				uiStore.pinnedElement = word;
			}

			function onKeydown(ev) {
				if (ev.key === 'Enter' || ev.key === ' ') {
					ev.preventDefault();
					onClick(ev);
				}
			}

			word.addEventListener('mouseenter', onMouseEnter);
			word.addEventListener('mouseleave', onMouseLeave);
			word.addEventListener('click', onClick);
			word.addEventListener('keydown', onKeydown);

			cleanups.push(() => {
				word.removeEventListener('mouseenter', onMouseEnter);
				word.removeEventListener('mouseleave', onMouseLeave);
				word.removeEventListener('click', onClick);
				word.removeEventListener('keydown', onKeydown);
				word.removeAttribute('role');
				word.removeAttribute('tabindex');
			});
		});

		return cleanups;
	}
</script>

<span bind:this={container}>
	{@html html}
</span>
