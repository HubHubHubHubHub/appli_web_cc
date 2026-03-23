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
	<div class="flex items-center justify-between border-b-2 border-border pb-1 sticky top-[var(--global-toggle-height,0px)] z-[1] bg-sidebar-bg">
		<button type="button" class="flex items-center gap-1.5 bg-transparent border-none p-0 m-0 font-[inherit] cursor-pointer text-left text-inherit" onclick={onToggleCategory}>
			<span class="inline-block text-[0.7em] transition-transform duration-150 ease-in-out" class:rotate-90={isOpen}>▶</span>
			<h2 class="m-0 text-[1.1em]">{catLabel}</h2>
		</button>
		{#if isOpen}
			<button type="button" class="bg-transparent border border-border rounded-sm px-1.5 py-px text-[0.85em] cursor-pointer text-text-muted-light leading-none hover:bg-hover-bg hover:text-text-heading" onclick={onToggleAllLetters}
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

