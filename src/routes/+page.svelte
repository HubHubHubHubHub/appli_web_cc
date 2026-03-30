<script>
  import WordList from "$lib/components/WordList.svelte";
  import WordDetails from "$lib/components/WordDetails.svelte";
</script>

<svelte:head>
  <title>Liste de mots avec fiches descriptives</title>
</svelte:head>

<div class="flex w-full h-[calc(100vh-var(--header-height))] max-md:flex-col">
  <nav
    class="w-64 shrink-0 bg-base-200 p-3 shadow-sidebar h-full flex flex-col max-md:w-full max-md:h-auto"
    aria-label="Liste de mots"
  >
    <WordList />
  </nav>
  <main
    class="grow min-w-0 p-6 max-md:w-full bg-base-100 mr-[var(--grammar-sidebar-gap)] max-md:mr-0"
  >
    <WordDetails />
  </main>
</div>
