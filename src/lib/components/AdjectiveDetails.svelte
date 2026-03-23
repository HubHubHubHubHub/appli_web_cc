<script>
	import { addAccent } from '$lib/utils/accent.js';
	import { firstPair } from '$lib/utils/parsing.js';

	let { details } = $props();

	const caseNames = {
		nomi: 'називний',
		gen: 'родовий',
		dat: 'давальний',
		acc: 'знахідний',
		ins: 'орудний',
		loc: 'місцевий',
		voc: 'кличний',
	};

	const genders = ['m', 'f', 'n', 'pl'];

	function renderCell(entry) {
		if (!entry) return '';
		const pair = firstPair(entry);
		return pair ? addAccent(pair[0], pair[1]) : '';
	}
</script>

{#if details.cas}
	<table class="table">
		<tbody>
			<tr class="row column-header">
				<td class="cell">відмінок</td>
				<td class="cell" title="чоловічий рід">чол. р.</td>
				<td class="cell" title="жіночий рід">жін. р.</td>
				<td class="cell" title="середній рід">сер. р.</td>
				<td class="cell">множина</td>
			</tr>
			{#each Object.entries(details.cas) as [caseKey, forms]}
				<tr class="row">
					<td class="cell header">{caseNames[caseKey] || caseKey}</td>
					{#each genders as gender}
						<td class="cell">
							<span class="word">{renderCell(forms[gender])}</span>
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
