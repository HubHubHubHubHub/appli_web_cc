<script>
  import { renderCellSimple as renderCell } from "$lib/utils/parsing.js";
  import { labelCase } from "$lib/utils/i18n.js";

  let { details } = $props();
</script>

{#if details.cas}
  <div class="gram-table-wrap mt-2.5">
    <table class="table gram-table font-body">
      <tbody>
        {#each Object.entries(details.cas) as [caseKey, forms]}
          <tr>
            <th scope="row">{labelCase(caseKey)}</th>
            <td class="text-center"><span class="font-bold">{@html renderCell(forms)}</span></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
