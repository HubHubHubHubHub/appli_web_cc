<script>
  import { renderCellSimple as renderCell } from "$lib/utils/parsing.js";
  import { labelCase } from "$lib/utils/i18n.js";

  let { details } = $props();

  const governs = $derived(details?.meta?.governs || []);
</script>

{#if details}
  <div class="mt-4">
    {#if governs.length > 0}
      <div class="text-base">
        <span class="text-neutral">Régit :</span>
        {#each governs as cas, i}
          <span class="font-semibold">{labelCase(cas)}</span>{#if i < governs.length - 1},
          {/if}
        {/each}
      </div>
    {/if}
    {#if details.base}
      <div class="mt-2 text-lg">
        {@html renderCell(details.base)}
      </div>
    {/if}
  </div>
{/if}
