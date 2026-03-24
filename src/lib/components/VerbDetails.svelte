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

	const cellBase = 'px-3 py-2 text-center max-md:px-2 max-md:py-1.5';
</script>

{#if details.conj}
	<table class="table mt-5 font-body">
		<tbody>
			<!-- Infinitif -->
			<tr class="bg-warning">
				<td class="{cellBase}">Infinitif</td>
				<td colspan="2" class="{cellBase}">
					<span class="text-secondary font-bold">{infDisplay}</span>
				</td>
			</tr>

			{#each tenses as tenseKey}
				{#if details.conj[tenseKey]}
					<tr class="bg-info text-info-content text-lg">
						<td colspan="3" class="{cellBase} font-bold">{labelTenseLabel(tenseKey)}</td>
					</tr>

					{#if tenseKey === 'pass'}
						{#each Object.entries(details.conj.pass) as [gKey, forms]}
							<tr>
								<td class="{cellBase} text-left font-bold bg-base-200">{labelPerson(gKey)}</td>
								<td class="{cellBase}">{@html renderCell(forms.s)}</td>
								{#if gKey === 'm'}
									<td rowspan="3" class="{cellBase}">{@html renderCell(forms.pl)}</td>
								{/if}
							</tr>
						{/each}
					{:else}
						<tr class="bg-base-200 font-bold">
							<td class="{cellBase}">&nbsp;</td>
							<td class="{cellBase} bg-base-300">sg.</td>
							<td class="{cellBase} bg-base-300">pl.</td>
						</tr>
						{#each Object.entries(details.conj[tenseKey]) as [pKey, forms]}
							<tr>
								<td class="{cellBase} text-left font-bold bg-base-200">{@html labelPerson(pKey)}</td>
								<td class="{cellBase}">{@html renderCell(forms.s)}</td>
								<td class="{cellBase}">{@html renderCell(forms.pl)}</td>
							</tr>
						{/each}
					{/if}
				{/if}
			{/each}

			<!-- Forme impersonnelle -->
			{#if impersData}
				<tr class="bg-info text-info-content text-lg">
					<td colspan="3" class="{cellBase} font-bold">Forme impersonnelle</td>
				</tr>
				<tr>
					<td colspan="3" class="{cellBase}">{@html renderCell(impersData)}</td>
				</tr>
			{/if}

			<!-- Couple aspectuel -->
			{#if coupl}
				<tr>
					<td colspan="3" class="{cellBase} text-right italic">
						Couple aspectuel : {@html couplDisplay}
					</td>
				</tr>
			{/if}
		</tbody>
	</table>
{/if}
