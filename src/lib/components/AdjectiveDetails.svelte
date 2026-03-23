<script>
	import { addAccent } from '$lib/utils/accent.js';
	import { firstPair } from '$lib/utils/parsing.js';
	import { labelCase, labelGender } from '$lib/utils/i18n.js';

	let { details } = $props();

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
				<td class="cell">cas</td>
				{#each genders as g}
					<td class="cell">{labelGender(g)}</td>
				{/each}
			</tr>
			{#each Object.entries(details.cas) as [caseKey, forms]}
				<tr class="row">
					<td class="cell header">{labelCase(caseKey)}</td>
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
