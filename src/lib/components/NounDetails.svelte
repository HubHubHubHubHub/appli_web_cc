<script>
	import { addAccent } from '$lib/utils/accent.js';
	import { firstPair } from '$lib/utils/parsing.js';

	let { details } = $props();
</script>

{#if details.cas}
	<h3>Cas grammaticaux:</h3>
	<ul>
		{#each Object.entries(details.cas) as [cas, form]}
			{@const ps = firstPair(form.s)}
			{@const pp = firstPair(form.pl)}
			{@const sTxt = ps ? addAccent(ps[0], ps[1]) : ''}
			{@const pTxt = pp ? addAccent(pp[0], pp[1]) : ''}
			<li><strong>{cas} s.</strong> : {sTxt} , <strong>p.</strong> : {pTxt}</li>
		{/each}
	</ul>
{/if}
