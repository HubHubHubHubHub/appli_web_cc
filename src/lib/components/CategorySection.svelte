<script>
	import LetterGroup from './LetterGroup.svelte';

	let {
		catKey,
		catLabel,
		isOpen,
		letterGroups,
		letterOpenState,
		wordData,
		onToggleCategory,
		onToggleAllLetters,
		onToggleLetter,
		onWordClick,
	} = $props();
</script>

<div class="category-section">
	<div class="category-header">
		<button type="button" class="category-toggle" onclick={onToggleCategory}>
			<span class="chevron" class:open={isOpen}>▶</span>
			<h2>{catLabel}</h2>
		</button>
		{#if isOpen}
			<button type="button" class="expand-all-btn" onclick={onToggleAllLetters}
				title="Tout déplier / replier">
				±
			</button>
		{/if}
	</div>
	{#if isOpen}
		{#each [...letterGroups] as [letter, words]}
			<LetterGroup
				{letter}
				{words}
				isOpen={letterOpenState[`${catKey}:${letter}`] ?? false}
				{wordData}
				onToggle={() => onToggleLetter(letter)}
				onWordClick={(word) => onWordClick(word, catKey)}
			/>
		{/each}
	{/if}
</div>

<style>
	.category-section {
		padding-top: 12px;
	}

	.category-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 2px solid #ccc;
		padding-bottom: 4px;
		position: sticky;
		top: 0;
		z-index: 1;
		background-color: #f0f0f0;
	}

	.category-toggle {
		display: flex;
		align-items: center;
		gap: 6px;
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		font: inherit;
		cursor: pointer;
		text-align: left;
		color: inherit;
	}

	.category-toggle h2 {
		margin: 0;
		font-size: 1.1em;
	}

	.chevron {
		display: inline-block;
		font-size: 0.7em;
		transition: transform 0.15s ease;
	}

	.chevron.open {
		transform: rotate(90deg);
	}

	.expand-all-btn {
		background: none;
		border: 1px solid #ccc;
		border-radius: 3px;
		padding: 1px 6px;
		font-size: 0.85em;
		cursor: pointer;
		color: #777;
		line-height: 1;
	}

	.expand-all-btn:hover {
		background-color: #e0e0e0;
		color: #333;
	}
</style>
