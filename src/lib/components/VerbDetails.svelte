<script>
  import { addAccentHTML } from "$lib/utils/accent.js";
  import { toPairs, firstPair } from "$lib/utils/parsing.js";
  import { dataStore } from "$lib/stores/dataStore.svelte.js";
  import { labelTenseLabel, labelPerson } from "$lib/utils/i18n.js";

  let { details } = $props();

  function renderCell(entry) {
    const pairs = toPairs(entry);
    if (!pairs.length) return "";
    return pairs
      .filter(([t]) => t)
      .map(([t, p]) => `<span class="font-bold">${addAccentHTML(t, p)}</span>`)
      .join(", ");
  }

  const infPair = $derived(firstPair(details.inf));
  const infDisplay = $derived(infPair ? addAccentHTML(infPair[0], infPair[1]) : "");

  const tenses = ["imp", "fut", "pres", "past"];

  const impersData = $derived(details.conj?.impers ?? details.conj?.imper);

  const couple = $derived((details.meta?.couple || "").trim());
  const coupleDisplay = $derived.by(() => {
    if (!couple) return "";
    const coupleInf = dataStore.wordData?.verb?.[couple]?.inf;
    return coupleInf ? renderCell(coupleInf) : couple;
  });
</script>

{#if details.conj}
  <div class="gram-table-wrap mt-5">
    <table class="table gram-table font-body">
      <tbody>
        <!-- Infinitif -->
        <tr class="gram-section">
          <td class="gram-label">Infinitif</td>
          <td colspan="2" class="text-center">
            <span class="font-bold">{@html infDisplay}</span>
          </td>
        </tr>

        {#each tenses as tenseKey}
          {#if details.conj[tenseKey]}
            <tr class="gram-section">
              <td colspan="3" class="text-center text-xl">{labelTenseLabel(tenseKey)}</td>
            </tr>

            {#if tenseKey === "past"}
              {#each Object.entries(details.conj.past) as [gKey, forms]}
                <tr>
                  <td class="gram-label">{labelPerson(gKey)}</td>
                  <td class="text-center">{@html renderCell(forms.sg)}</td>
                  {#if gKey === "m"}
                    <td rowspan="3" class="text-center">{@html renderCell(forms.pl)}</td>
                  {/if}
                </tr>
              {/each}
            {:else}
              <tr class="gram-label-row">
                <td>&nbsp;</td>
                <td class="gram-label text-center">sg.</td>
                <td class="gram-label text-center">pl.</td>
              </tr>
              {#each Object.entries(details.conj[tenseKey]) as [pKey, forms]}
                <tr>
                  <td class="gram-label">{@html labelPerson(pKey)}</td>
                  <td class="text-center">{@html renderCell(forms.sg)}</td>
                  <td class="text-center">{@html renderCell(forms.pl)}</td>
                </tr>
              {/each}
            {/if}
          {/if}
        {/each}

        <!-- Forme impersonnelle -->
        {#if impersData}
          <tr class="gram-section">
            <td colspan="3" class="text-center text-xl">Forme impersonnelle</td>
          </tr>
          <tr>
            <td colspan="3" class="text-center">{@html renderCell(impersData)}</td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>
{/if}
