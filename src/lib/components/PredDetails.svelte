<script>
  import { renderCellSimple as renderCell } from "$lib/utils/parsing.js";

  let { details } = $props();

  const construction = $derived(details?.meta?.construction || "");

  const constructionLabel = {
    inf: "+ infinitif",
    gen: "+ génitif",
    що: "+ що (complétive)",
  };
</script>

{#if details}
  <div class="mt-4">
    {#if construction}
      <div class="text-base">
        <span class="text-neutral">Construction :</span>
        <span class="font-semibold">{constructionLabel[construction] || construction}</span>
      </div>
    {/if}
    {#if details.base}
      <div class="mt-2 text-lg">
        {@html renderCell(details.base)}
      </div>
    {/if}
  </div>
{/if}
