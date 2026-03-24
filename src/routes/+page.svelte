<script>
	import WordList from '$lib/components/WordList.svelte';
	import WordDetails from '$lib/components/WordDetails.svelte';
</script>

<svelte:head>
	<title>Liste de mots avec fiches descriptives</title>
</svelte:head>

<div class="flex w-full h-full max-md:flex-col">
	<div class="w-72 shrink-0 bg-base-200 p-4 shadow-sidebar h-screen flex flex-col max-md:w-full max-md:h-auto">
		<WordList />
	</div>
	<div class="grow min-w-0 p-6 max-md:w-full bg-base-100">
		<WordDetails />
	</div>
</div>
