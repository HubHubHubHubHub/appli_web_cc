<script>
  import { renderCellSimple as renderCell } from "$lib/utils/parsing.js";
  import { labelCase, labelGender } from "$lib/utils/i18n.js";

  let { details } = $props();

  const genders = ["m", "f", "n", "pl"];
</script>

{#if details.cas}
  <div class="gram-table-wrap mt-2.5">
    <table class="table gram-table font-body">
      <thead>
        <tr>
          <th scope="col"></th>
          {#each genders as g}
            <th scope="col" class="text-center">{labelGender(g)}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each Object.entries(details.cas) as [caseKey, forms]}
          <tr>
            <th scope="row">{labelCase(caseKey)}</th>
            {#each genders as gender}
              <td class="text-center">
                <span class="font-bold">{@html renderCell(forms[gender])}</span>
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
