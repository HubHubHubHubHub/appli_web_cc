<script>
	import HtmlContent from './HtmlContent.svelte';

	let { letter, words, isOpen, wordData, onToggle, onWordClick } = $props();
</script>

<div>
	<button type="button" class="flex items-center gap-1.5 bg-transparent border-none py-1 pl-3 pr-0 m-0 font-[inherit] cursor-pointer w-full text-left text-neutral hover:text-base-content" onclick={onToggle}>
		<span class="inline-block text-2xs transition-transform duration-150 ease-in-out" class:rotate-90={isOpen}>▶</span>
		<span class="font-semibold text-base">{letter}</span>
		<span class="text-xs opacity-50">({words.length})</span>
	</button>
	{#if isOpen}
		<ul class="list-none p-0 m-0">
			{#each words as word}
				<li class="py-2 px-2 pl-6 cursor-pointer border-b border-base-200 hover:bg-base-200">
					<button type="button" class="bg-transparent border-none p-0 m-0 font-[inherit] text-inherit cursor-pointer text-left w-full" onclick={() => onWordClick(word)}>
						<HtmlContent html={wordData[word].base_html} disableHover={true} />
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
