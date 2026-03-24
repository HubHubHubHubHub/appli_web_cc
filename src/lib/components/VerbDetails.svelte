<script>
	import { addAccent } from '$lib/utils/accent.js';
	import { toPairs, firstPair } from '$lib/utils/parsing.js';
	import { wordData } from '$lib/stores/dataStore.js';
	import { labelTenseLabel, labelPerson } from '$lib/utils/i18n.js';

	let { details } = $props();

	function renderCell(entry) {
		const pairs = toPairs(entry);
		if (!pairs.length) return '';
		return pairs.filter(([t]) => t).map(([t, p]) => `<span class="text-secondary font-bold">${addAccent(t, p)}</span>`).join(', ');
	}

	const infPair = $derived(firstPair(details.inf));
	const infDisplay = $derived(infPair ? addAccent(infPair[0], infPair[1]) : '');

	const tenses = ['imp', 'fut', 'pres', 'pass'];

	const impersData = $derived(details.conj?.impers ?? details.conj?.imper);

	const coupl = $derived((details.coupl || '').trim());
	const couplDisplay = $derived.by(() => {
		if (!coupl) return '';
		const couplInf = $wordData?.verb?.[coupl]?.inf;
		return couplInf ? renderCell(couplInf) : coupl;
	});

	const cp = 'px-3 py-2 max-md:px-2 max-md:py-1.5';
</script>

{#if details.conj}
	<div class="gram-table-wrap mt-5">
		<table class="table gram-table font-body">
			<tbody>
				<!-- Infinitif -->
				<tr class="gram-section">
					<td class="{cp} gram-label">Infinitif</td>
					<td colspan="2" class="{cp} text-center">
						<span class="text-secondary font-bold">{infDisplay}</span>
					</td>
				</tr>

				{#each tenses as tenseKey}
					{#if details.conj[tenseKey]}
						<tr class="gram-section">
							<td colspan="3" class="{cp} text-center text-lg">{labelTenseLabel(tenseKey)}</td>
						</tr>

						{#if tenseKey === 'pass'}
							{#each Object.entries(details.conj.pass) as [gKey, forms]}
								<tr>
									<td class="{cp} gram-label">{labelPerson(gKey)}</td>
									<td class="{cp} text-center">{@html renderCell(forms.s)}</td>
									{#if gKey === 'm'}
										<td rowspan="3" class="{cp} text-center">{@html renderCell(forms.pl)}</td>
									{/if}
								</tr>
							{/each}
						{:else}
							<tr>
								<td class="{cp}">&nbsp;</td>
								<td class="{cp} gram-label text-center">sg.</td>
								<td class="{cp} gram-label text-center">pl.</td>
							</tr>
							{#each Object.entries(details.conj[tenseKey]) as [pKey, forms]}
								<tr>
									<td class="{cp} gram-label">{@html labelPerson(pKey)}</td>
									<td class="{cp} text-center">{@html renderCell(forms.s)}</td>
									<td class="{cp} text-center">{@html renderCell(forms.pl)}</td>
								</tr>
							{/each}
						{/if}
					{/if}
				{/each}

				<!-- Forme impersonnelle -->
				{#if impersData}
					<tr class="gram-section">
						<td colspan="3" class="{cp} text-center text-lg">Forme impersonnelle</td>
					</tr>
					<tr>
						<td colspan="3" class="{cp} text-center">{@html renderCell(impersData)}</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>

	{#if coupl}
		<p class="gram-note">Couple aspectuel : {@html couplDisplay}</p>
	{/if}
{/if}
