<script>
	import PhraseList from '$lib/components/PhraseList.svelte';
</script>

<svelte:head>
	<title>Recherche de Phrases</title>
</svelte:head>

<div class="phrases-page">
	<h1>Recherche de Phrases</h1>
	<PhraseList />
</div>

<style>
	.phrases-page {
		margin-left: 25px;
		margin-right: 450px;
		margin-bottom: 45px;
		font-family: Arial, sans-serif;
	}

	@media (max-width: 768px) {
		.phrases-page {
			margin-right: 25px;
		}
	}
</style>
