<script>
	import { addAccent } from '$lib/utils/accent.js';
	import { toPairs, firstPair } from '$lib/utils/parsing.js';
	import { wordData } from '$lib/stores/dataStore.js';

	let { details } = $props();

	function renderCell(entry) {
		const pairs = toPairs(entry);
		if (!pairs.length) return '';
		return pairs.filter(([t]) => t).map(([t, p]) => `<span class="conj-word">${addAccent(t, p)}</span>`).join(', ');
	}

	const infPair = $derived(firstPair(details.inf));
	const infDisplay = $derived(infPair ? addAccent(infPair[0], infPair[1]) : '');

	const tenses = {
		imp: 'Наказовий спосіб',
		fut: 'Майбутній час',
		pres: 'Теперішній час',
		pass: 'Минулий час',
	};

	const persons = {
		'1p': '1 особа',
		'2p': '2 особа',
		'3p': '3 особа',
		m: 'чол. р.',
		f: 'жін. р.',
		n: 'сер. р.',
	};

	const impersData = $derived(details.conj?.impers ?? details.conj?.imper);

	const coupl = $derived((details.coupl || '').trim());
	const couplDisplay = $derived.by(() => {
		if (!coupl) return '';
		const couplInf = $wordData?.verb?.[coupl]?.inf;
		return couplInf ? renderCell(couplInf) : coupl;
	});
</script>

{#if details.conj}
	<table class="conj-table">
		<tbody>
			<!-- Infinitif -->
			<tr class="conj-row conj-infinitive">
				<td class="conj-cell conj-inf-label">Інфінітив</td>
				<td colspan="2" class="conj-cell conj-inf-word">
					<span class="conj-word">{infDisplay}</span>
				</td>
			</tr>

			{#each Object.entries(tenses) as [tenseKey, tenseName]}
				{#if details.conj[tenseKey]}
					<tr class="conj-row conj-tense-header">
						<td colspan="3" class="conj-cell conj-tense-name">{tenseName}</td>
					</tr>

					{#if tenseKey === 'pass'}
						{#each Object.entries(details.conj.pass) as [gKey, forms]}
							<tr class="conj-row conj-form-row">
								<td class="conj-cell conj-person">{persons[gKey]}</td>
								<td class="conj-cell conj-singular">{@html renderCell(forms.s)}</td>
								{#if gKey === 'm'}
									<td rowspan="3" class="conj-cell conj-plural">{@html renderCell(forms.pl)}</td>
								{/if}
							</tr>
						{/each}
					{:else}
						<tr class="conj-row conj-person-header">
							<td class="conj-cell conj-person-label">&nbsp;</td>
							<td class="conj-cell conj-singular-header">Однина</td>
							<td class="conj-cell conj-plural-header">Множина</td>
						</tr>
						{#each Object.entries(details.conj[tenseKey]) as [pKey, forms]}
							<tr class="conj-row conj-form-row">
								<td class="conj-cell conj-person">{persons[pKey]}</td>
								<td class="conj-cell conj-singular">{@html renderCell(forms.s)}</td>
								<td class="conj-cell conj-plural">{@html renderCell(forms.pl)}</td>
							</tr>
						{/each}
					{/if}
				{/if}
			{/each}

			<!-- Impersonnel -->
			{#if impersData}
				<tr class="conj-row conj-tense-header">
					<td colspan="3" class="conj-cell conj-tense-name">Безособова форма</td>
				</tr>
				<tr class="conj-row conj-impersonal">
					<td colspan="3" class="conj-cell conj-impersonal-form">{@html renderCell(impersData)}</td>
				</tr>
			{/if}

			<!-- Couple aspectuel -->
			{#if coupl}
				<tr class="conj-row">
					<td colspan="3" class="conj-cell" style="text-align:right; font-style:italic;">
						Couple aspectuel : {@html couplDisplay}
					</td>
				</tr>
			{/if}
		</tbody>
	</table>
{/if}
