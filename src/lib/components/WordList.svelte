<script>
	import { wordData } from '$lib/stores/dataStore.js';
	import { selectedWord, selectedCategory } from '$lib/stores/uiStore.js';
	import HtmlContent from './HtmlContent.svelte';

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

	function handleWordClick(word, category) {
		selectedWord.set(word);
		selectedCategory.set(category);
	}
</script>

<ul id="wordList">
	{#each Object.entries(categories) as [catKey, catLabel]}
		{#if $wordData[catKey] && Object.keys($wordData[catKey]).length > 0}
			<h2>{catLabel}</h2>
			<ul class="word-list">
				{#each Object.entries($wordData[catKey]) as [word, wordInfo]}
					<li class="word-item">
						<button type="button" class="word-btn" onclick={() => handleWordClick(word, catKey)}>
							<HtmlContent html={wordInfo.base_html} disableHover={true} />
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	{/each}
</ul>

<style>
	ul {
		list-style-type: none;
		padding: 0;
	}

	#wordList {
		flex-grow: 1;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: #b0b0b0 #e0e0e0;
	}

	.word-item {
		padding: 10px;
		cursor: pointer;
		border-bottom: 1px solid #ddd;
	}

	.word-item:hover {
		background-color: #e0e0e0;
	}

	.word-btn {
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		font: inherit;
		color: inherit;
		cursor: pointer;
		text-align: left;
		width: 100%;
	}
</style>
