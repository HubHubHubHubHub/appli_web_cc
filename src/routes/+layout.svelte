<script>
  import "../app.css";
  import { dataStore } from "$lib/stores/dataStore.svelte.js";
  import GrammarSidebar from "$lib/components/GrammarSidebar.svelte";
  import AccentCheckbox from "$lib/components/AccentCheckbox.svelte";

  let { data, children } = $props();

  // Initialiser les stores avec les données du serveur (réactif)
  $effect(() => {
    dataStore.wordData = data.wordData;
    dataStore.phraseData = data.phraseData;
  });
</script>

{@render children()}

<GrammarSidebar />
<AccentCheckbox />
