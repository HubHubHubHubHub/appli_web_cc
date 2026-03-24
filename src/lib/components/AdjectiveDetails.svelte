<script>
	import { renderCellSimple as renderCell } from '$lib/utils/parsing.js';
	import { labelCase, labelGender } from '$lib/utils/i18n.js';

	let { details } = $props();

	const genders = ['m', 'f', 'n', 'pl'];
</script>

{#if details.cas}
	<table class="table table-zebra mt-2.5 font-body text-[inherit]">
		<thead>
			<tr>
				<th></th>
				{#each genders as g}
					<th class="text-center">{labelGender(g)}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each Object.entries(details.cas) as [caseKey, forms]}
				<tr>
					<th>{labelCase(caseKey)}</th>
					{#each genders as gender}
						<td class="text-center">
							<span class="text-secondary font-bold">{renderCell(forms[gender])}</span>
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
