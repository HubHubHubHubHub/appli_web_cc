<script>
	import WordList from '$lib/components/WordList.svelte';
	import WordDetails from '$lib/components/WordDetails.svelte';
</script>

<svelte:head>
	<title>Liste de mots avec fiches descriptives</title>
</svelte:head>

<div class="container">
	<div class="sidebar">
		<WordList />
	</div>
	<div class="content">
		<WordDetails />
	</div>
</div>

<style>
	.container {
		display: flex;
		width: 100%;
		height: 100%;
	}

	.sidebar {
		width: 25%;
		background-color: #f0f0f0;
		padding: 20px;
		box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.sidebar :global(h3) {
		margin-bottom: 10px;
		font-size: 1.2em;
		color: #333;
	}

	.content {
		width: 75%;
		padding: 20px;
	}

	@media (max-width: 768px) {
		.container {
			flex-direction: column;
		}
		.sidebar {
			width: 100%;
			height: auto;
		}
		.content {
			width: 100%;
		}
	}
</style>
