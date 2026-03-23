<script>
	import WordList from '$lib/components/WordList.svelte';
	import WordDetails from '$lib/components/WordDetails.svelte';
</script>

<svelte:head>
	<title>Liste de mots avec fiches descriptives</title>
</svelte:head>

<div class="flex w-full h-full max-md:flex-col">
	<div class="w-1/4 bg-sidebar-bg p-5 shadow-sidebar h-screen flex flex-col max-md:w-full max-md:h-auto">
		<WordList />
	</div>
	<div class="w-3/4 p-5 max-md:w-full">
		<WordDetails />
	</div>
</div>
