<script>
  import "../app.css";
  import { page } from "$app/stores";
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

<header class="app-header">
  <div class="app-header-brand">
    <span class="app-header-title">Слов<span class="app-header-o">о</span>скарб</span>
    <span class="app-header-subtitle">Trésor lexical ukrainien</span>
  </div>
  <nav class="app-nav">
    <a href="/" class="app-nav-tab" class:active={$page.url.pathname === "/"}>Lexique</a>
    <a href="/phrases" class="app-nav-tab" class:active={$page.url.pathname === "/phrases"}
      >Phrases</a
    >
  </nav>
  <div class="mr-[60px]">
    <AccentCheckbox />
  </div>
</header>

{@render children()}

<GrammarSidebar />
