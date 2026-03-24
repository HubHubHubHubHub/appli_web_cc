<script>
	import { renderCellSimple as renderCell } from '$lib/utils/parsing.js';
	import { labelCase } from '$lib/utils/i18n.js';

	let { details } = $props();
</script>

{#if details.cas}
	<table class="w-full border-collapse mt-2.5 font-body">
		<tbody>
			<tr>
				<td class="border border-border px-3 py-2 text-center font-bold bg-header-bg"></td>
				<td class="border border-border px-3 py-2 text-center font-bold bg-header-bg">sg.</td>
				<td class="border border-border px-3 py-2 text-center font-bold bg-header-bg">pl.</td>
			</tr>
			{#each Object.entries(details.cas) as [caseKey, forms]}
				<tr>
					<td class="border border-border px-3 py-2 font-bold text-left bg-row-bg">{labelCase(caseKey)}</td>
					<td class="border border-border px-3 py-2 text-center"><span class="text-ukr-word font-bold">{renderCell(forms.s)}</span></td>
					<td class="border border-border px-3 py-2 text-center"><span class="text-ukr-word font-bold">{renderCell(forms.pl)}</span></td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
