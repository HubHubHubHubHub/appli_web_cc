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

<div class="pt-3">
	<div class="flex items-center justify-between border-b-2 border-base-300 pb-1 sticky top-[var(--global-toggle-height,0px)] z-[1] bg-base-200">
		<button type="button" class="flex items-center gap-1.5 bg-transparent border-none p-0 m-0 font-[inherit] cursor-pointer text-left text-inherit" onclick={onToggleCategory}>
			<span class="inline-block text-2xs transition-transform duration-150 ease-in-out" class:rotate-90={isOpen}>▶</span>
			<h2 class="m-0 text-lg">{catLabel}</h2>
		</button>
		{#if isOpen}
			<button type="button" class="bg-transparent border border-base-300 rounded-sm px-1.5 py-px text-sm cursor-pointer text-neutral leading-none hover:bg-base-300 hover:text-base-content" onclick={onToggleAllLetters}
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

