<script>
  import { addAccentHTML } from "$lib/utils/accent.js";
  import { firstPair } from "$lib/utils/parsing.js";

  let { details } = $props();

  const pair = $derived(firstPair(details.base));
  const cell = $derived(pair ? addAccentHTML(pair[0], pair[1]) : "");
</script>

<h3>Forme de base</h3>
<p><span class="font-bold">{@html cell}</span></p>
