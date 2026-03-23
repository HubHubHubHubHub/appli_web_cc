<script>
	import { onMount } from 'svelte';
	import { wordData } from '$lib/stores/dataStore.js';
	import { accentEnabled, pinnedElement, grammarTableData } from '$lib/stores/uiStore.js';
	import { parseInfo, firstPair, getVariantIndex } from '$lib/utils/parsing.js';
	import { getDataFromJson, getPrincipalForm } from '$lib/utils/dataAccess.js';
	import { addAccent, highlightLetter } from '$lib/utils/accent.js';
	import { labelCategory, labelTense, labelNumber } from '$lib/utils/i18n.js';
	import { classesToColors } from '$lib/utils/colors.js';
	import { get } from 'svelte/store';

	let { html, disableHover = false } = $props();
	let container = $state(null);

	// Re-apply accent highlighting and hover handlers when accentEnabled or html changes
	$effect(() => {
		const _ = $accentEnabled; // track reactivity
		const __ = html; // track html prop changes
		if (container) {
			applyAccents(container);
			if (!disableHover) applyHoverHandlers(container);
		}
	});

	function applyAccents(el) {
		const wd = get(wordData);
		const enabled = get(accentEnabled);
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
		const words = el.querySelectorAll('.ukr');
		words.forEach((word) => {
			if (word.dataset.hoverBound === '1') return;
			word.dataset.hoverBound = '1';

			const raw = word.getAttribute('data-info');
			if (!raw) return;
			const dataInfo = parseInfo(raw);
			const [w, category, ...infos] = dataInfo;

			// Hover color
			let hoverColor = 'inherit';
			for (const [className, color] of Object.entries(classesToColors)) {
				if (dataInfo.includes(className)) { hoverColor = color; break; }
			}

			word.addEventListener('mouseenter', function () {
				if (get(pinnedElement)) return;
				this.style.color = hoverColor;

				const wd = get(wordData);
				grammarTableData.set({ word: w, category, infos, wordData: wd });

				// Show bubble
				const bubble = getOrCreateBubble();
				const bHTML = buildBubbleHTML(wd, w, category, dataInfo);
				if (bHTML && bHTML.trim()) {
					bubble.innerHTML = bHTML;
					bubble.style.display = 'block';
					positionBubble(bubble, this);
				}
			});

			word.addEventListener('mouseleave', function () {
				this.style.color = '';
				hideBubble();
				if (!get(pinnedElement)) {
					grammarTableData.set(null);
				}
			});

			word.addEventListener('click', function (ev) {
				ev.preventDefault();
				const currentPinned = get(pinnedElement);

				if (currentPinned === this) {
					pinnedElement.set(null);
					grammarTableData.set(null);
					return;
				}

				const wd = get(wordData);
				grammarTableData.set({ word: w, category, infos, wordData: wd });
				pinnedElement.set(this);
			});
		});
	}

	function buildBubbleHTML(wd, w, category, dataInfo) {
		const tokens = dataInfo.slice(1);
		const filtered = tokens.filter(t => t !== 'cas' && t !== 'base');

		if (category === 'nom') {
			const g = wd?.nom?.[w]?.genre;
			if (g) filtered.splice(1, 0, g);
		}

		if (filtered.length) {
			filtered[0] = labelCategory(filtered[0]);
			for (let i = 1; i < filtered.length; i++) {
				filtered[i] = labelTense(filtered[i]);
				filtered[i] = labelNumber(filtered[i]);
			}
		}

		const variantIndex = getVariantIndex(dataInfo);
		let lemmaEntry = null;
		switch (category) {
			case 'nom': lemmaEntry = wd?.nom?.[w]?.cas?.nomi?.s; break;
			case 'proposs': case 'card': case 'adj': case 'pron':
				lemmaEntry = wd?.[category]?.[w]?.cas?.nomi?.m; break;
			case 'proper': lemmaEntry = wd?.proper?.[w]?.cas?.nomi; break;
			case 'verb': lemmaEntry = wd?.verb?.[w]?.inf; break;
			case 'adv': lemmaEntry = wd?.adv?.[w]?.base; break;
			case 'conj': lemmaEntry = wd?.conj?.[w]?.base; break;
			case 'part': lemmaEntry = wd?.part?.[w]?.base; break;
		}

		const pair = firstPair(lemmaEntry, variantIndex);
		if (pair) {
			const [mot, pos] = pair;
			const accented = addAccent(mot, pos);
			return `<strong>${accented}</strong>${filtered.length ? ' &nbsp;<em>' + filtered.join(', ') + '</em>' : ''}`;
		}
		return filtered.length ? `<em>${filtered.join(', ')}</em>` : '';
	}

	function getOrCreateBubble() {
		let b = document.getElementById('hover-info-bubble');
		if (!b) {
			b = document.createElement('div');
			b.id = 'hover-info-bubble';
			b.className = 'hover-bubble';
			b.style.display = 'none';
			document.body.appendChild(b);
		}
		return b;
	}

	function positionBubble(bubble, anchor) {
		const rect = anchor.getBoundingClientRect();
		const tmp = bubble.getBoundingClientRect();
		const top = window.scrollY + rect.top - tmp.height - 8;
		const left = window.scrollX + rect.left + (rect.width - tmp.width) / 2;
		bubble.style.top = `${Math.max(window.scrollY + 4, top)}px`;
		bubble.style.left = `${Math.max(window.scrollX + 4, left)}px`;
	}

	function hideBubble() {
		const b = document.getElementById('hover-info-bubble');
		if (b) b.style.display = 'none';
	}
</script>

<span bind:this={container}>
	{@html html}
</span>
