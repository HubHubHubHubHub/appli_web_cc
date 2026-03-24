<script>
	import { renderCellSimple as renderCell } from '$lib/utils/parsing.js';
	import { labelCase } from '$lib/utils/i18n.js';

	let { details } = $props();
</script>

{#if details.cas}
	<div class="gram-table-wrap mt-2.5">
		<table class="table gram-table font-body">
			<thead>
				<tr>
					<th></th>
					<th class="text-center">sg.</th>
					<th class="text-center">pl.</th>
				</tr>
			</thead>
			<tbody>
				{#each Object.entries(details.cas) as [caseKey, forms]}
					<tr>
						<th>{labelCase(caseKey)}</th>
						<td class="text-center"><span class="text-secondary font-bold">{renderCell(forms.s)}</span></td>
						<td class="text-center"><span class="text-secondary font-bold">{renderCell(forms.pl)}</span></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
