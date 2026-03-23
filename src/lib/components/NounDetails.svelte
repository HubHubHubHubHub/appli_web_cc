<script>
	import { addAccent } from '$lib/utils/accent.js';
	import { firstPair } from '$lib/utils/parsing.js';
	import { labelCase } from '$lib/utils/i18n.js';

	let { details } = $props();

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
				<td class="cell">sg.</td>
				<td class="cell">pl.</td>
			</tr>
			{#each Object.entries(details.cas) as [caseKey, forms]}
				<tr class="row">
					<td class="cell header">{labelCase(caseKey)}</td>
					<td class="cell"><span class="word">{renderCell(forms.s)}</span></td>
					<td class="cell"><span class="word">{renderCell(forms.pl)}</span></td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
