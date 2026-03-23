<script>
	import '../app.css';
	import { wordData, phraseData } from '$lib/stores/dataStore.js';
	import GrammarSidebar from '$lib/components/GrammarSidebar.svelte';
	import AccentCheckbox from '$lib/components/AccentCheckbox.svelte';

	let { data, children } = $props();

	// Initialiser les stores avec les données du serveur (réactif)
	$effect(() => {
		wordData.set(data.wordData);
		phraseData.set(data.phraseData);
	});
</script>

{@render children()}

<GrammarSidebar />
<AccentCheckbox />
