<script>
  import "../app.css";
  import { page } from "$app/stores";
  import { dataStore } from "$lib/stores/dataStore.svelte.js";
  import GrammarSidebar from "$lib/components/GrammarSidebar.svelte";
  import AccentCheckbox from "$lib/components/AccentCheckbox.svelte";

  let { data, children } = $props();
  let darkMode = $state(false);

  // Initialiser les stores avec les données du serveur (réactif)
  $effect(() => {
    dataStore.wordData = data.wordData;
    dataStore.phraseData = data.phraseData;
  });

  // Dark mode : appliquer le data-theme sur <html>
  $effect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "ukrvocab-dark" : "ukrvocab");
  });
</script>

<header class="app-header">
  <a href="/" class="app-header-brand">
    <span class="app-header-title">Слов<span class="app-header-o">о</span>скарб</span>
    <span class="app-header-subtitle">Trésor lexical ukrainien</span>
  </a>
  <nav class="app-nav">
    <a href="/" class="app-nav-tab" class:active={$page.url.pathname === "/"}>Lexique</a>
    <a href="/phrases" class="app-nav-tab" class:active={$page.url.pathname === "/phrases"}
      >Phrases</a
    >
  </nav>
  <div class="flex items-center gap-3 mr-[60px]">
    <AccentCheckbox />
    <label class="flex items-center gap-1.5 cursor-pointer text-sm">
      <input type="checkbox" class="toggle toggle-sm" bind:checked={darkMode} />
      <span class="select-none">{darkMode ? "☾" : "☀"}</span>
    </label>
  </div>
</header>

{@render children()}

<GrammarSidebar />
