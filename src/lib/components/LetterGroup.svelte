<script>
	import HtmlContent from './HtmlContent.svelte';

	let { letter, words, isOpen, wordData, onToggle, onWordClick } = $props();
</script>

<div class="letter-group">
	<button type="button" class="letter-header" onclick={onToggle}>
		<span class="chevron" class:open={isOpen}>▶</span>
		<span class="letter">{letter}</span>
		<span class="count">({words.length})</span>
	</button>
	{#if isOpen}
		<ul class="word-list">
			{#each words as word}
				<li class="word-item">
					<button type="button" class="word-btn" onclick={() => onWordClick(word)}>
						<HtmlContent html={wordData[word].base_html} disableHover={true} />
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.letter-header {
		display: flex;
		align-items: center;
		gap: 6px;
		background: none;
		border: none;
		padding: 4px 0 4px 12px;
		margin: 0;
		font: inherit;
		cursor: pointer;
		width: 100%;
		text-align: left;
		color: #555;
	}

	.letter-header:hover {
		color: #222;
	}

	.chevron {
		display: inline-block;
		font-size: 0.65em;
		transition: transform 0.15s ease;
	}

	.chevron.open {
		transform: rotate(90deg);
	}

	.letter {
		font-weight: 600;
		font-size: 0.95em;
	}

	.count {
		font-size: 0.8em;
		color: #999;
	}

	.word-list {
		list-style-type: none;
		padding: 0;
		margin: 0;
	}

	.word-item {
		padding: 8px 8px 8px 24px;
		cursor: pointer;
		border-bottom: 1px solid #eee;
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
