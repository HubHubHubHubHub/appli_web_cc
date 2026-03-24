<script>
	import { renderCellSimple as renderCell } from '$lib/utils/parsing.js';
	import { labelCase, labelGender } from '$lib/utils/i18n.js';

	let { details } = $props();

	const genders = ['m', 'f', 'n', 'pl'];
</script>

{#if details.cas}
	<table class="w-full border-collapse mt-2.5 font-body">
		<tbody>
			<tr>
				<td class="border border-border px-3 py-2 text-center font-bold bg-header-bg"></td>
				{#each genders as g}
					<td class="border border-border px-3 py-2 text-center font-bold bg-header-bg">{labelGender(g)}</td>
				{/each}
			</tr>
			{#each Object.entries(details.cas) as [caseKey, forms]}
				<tr>
					<td class="border border-border px-3 py-2 font-bold text-left bg-row-bg">{labelCase(caseKey)}</td>
					{#each genders as gender}
						<td class="border border-border px-3 py-2 text-center">
							<span class="text-ukr-word font-bold">{renderCell(forms[gender])}</span>
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
