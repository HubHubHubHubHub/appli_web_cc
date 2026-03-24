<script>
	import { addAccent } from '$lib/utils/accent.js';
	import { toPairs, firstPair } from '$lib/utils/parsing.js';
	import { labelTense, labelNumber } from '$lib/utils/i18n.js';

	let { data } = $props();

	function renderCell(entry) {
		const pairs = toPairs(entry);
		if (!pairs.length) return '';
		return pairs.filter(([t]) => t).map(([t, p]) => addAccent(t, p)).join(' / ');
	}

	const tableHTML = $derived.by(() => {
		if (!data) return '';
		const { word, category, infos, wordData } = data;

		try {
			if (category === 'nom') {
				const d = wordData?.nom?.[word]?.cas;
				if (d) return generateTableNoun(d, infos[1], infos[2]);
			} else if (category === 'proper') {
				const d = wordData?.proper?.[word]?.cas;
				if (d) return generateTableProper(d, infos[1]);
			} else if (['adj', 'card', 'proposs', 'pron'].includes(category)) {
				const d = wordData?.[category]?.[word]?.cas;
				if (d) return generateTableAdj(d, infos[1], infos[2]);
			} else if (category === 'verb') {
				const v = wordData?.verb?.[word];
				if (v) return generateTableVerb(v, wordData);
			}
		} catch (_) {}
		return '';
	});

	function generateTableNoun(casData, cas, gender) {
		if (!casData) return '<table></table>';
		let html = '<table>';
		for (const [caseName, forms] of Object.entries(casData)) {
			html += `<tr><th colspan="2"><em>${caseName}.</em></th></tr>`;
			for (const [formKey, entry] of Object.entries(forms)) {
				const cell = renderCell(entry);
				const numLbl = labelNumber(formKey) + '.';
				html += `<tr><td><em>${numLbl}</em></td><td>${caseName === cas && formKey === gender ? '<strong>' + cell + '</strong>' : cell}</td></tr>`;
			}
		}
		html += '</table>';
		return html;
	}

	function generateTableProper(casData, currentCase) {
		if (!casData) return '<table></table>';
		let html = '<table>';
		for (const [caseName, entry] of Object.entries(casData)) {
			const cell = renderCell(entry);
			html += `<tr><th><em>${caseName}.</em></th></tr>`;
			html += `<tr><td>${caseName === currentCase ? '<strong>' + cell + '</strong>' : cell}</td></tr>`;
		}
		html += '</table>';
		return html;
	}

	function generateTableAdj(casData, cas, gender) {
		if (!casData) return '<table></table>';
		const gendersOrder = ['m', 'f', 'n', 'pl'];
		let html = '<table>';
		for (const [caseName, formsByGender] of Object.entries(casData)) {
			if (caseName === 'voc') continue;
			html += `<tr><th colspan="2"><em>${caseName}.</em></th></tr>`;
			for (const g of gendersOrder) {
				const entry = formsByGender[g];
				if (!entry) continue;
				const cell = renderCell(entry);
				const content = (caseName === cas && g === gender) ? '<strong>' + cell + '</strong>' : cell;
				html += `<tr><td><em>${g}.</em></td><td>${content}</td></tr>`;
			}
		}
		html += '</table>';
		return html;
	}

	function generateTableVerb(verbDetails, wd) {
		if (!verbDetails) return '<table></table>';
		let html = '<table>';

		html += `<tr><th colspan="3"><em>${labelTense('inf')}</em></th></tr>`;
		html += `<tr><td colspan="3">${renderCell(verbDetails.inf)}</td></tr>`;

		const persons = ['1p', '2p', '3p'];
		const hasPres = !!(verbDetails.conj?.pres);

		if (hasPres) {
			html += `<tr><th colspan="3"><em>${labelTense('pres')}</em></th></tr>`;
			for (const p of persons) {
				const pd = verbDetails.conj.pres?.[p];
				if (!pd) continue;
				html += `<tr><td><em>${p}.</em></td><td>${renderCell(pd.s)}</td><td>${renderCell(pd.pl)}</td></tr>`;
			}
		}

		if (verbDetails.conj?.fut) {
			html += `<tr><th colspan="3"><em>${labelTense('fut')}</em></th></tr>`;
			for (const p of persons) {
				const pd = verbDetails.conj.fut?.[p];
				if (!pd) continue;
				html += `<tr><td><em>${p}.</em></td><td>${renderCell(pd.s)}</td><td>${renderCell(pd.pl)}</td></tr>`;
			}
		}

		if (verbDetails.conj?.pass) {
			html += `<tr><th colspan="3"><em>${labelTense('pass')}</em></th></tr>`;
			for (const g of ['m', 'f', 'n']) {
				const gd = verbDetails.conj.pass?.[g];
				if (!gd) continue;
				html += `<tr><td><em>${g}.</em></td><td>${renderCell(gd.s)}</td><td>${renderCell(gd.pl)}</td></tr>`;
			}
		}

		if (verbDetails.conj?.imp) {
			html += `<tr><th colspan="3"><em>${labelTense('imp')}</em></th></tr>`;
			for (const p of ['1p', '2p']) {
				const pd = verbDetails.conj.imp?.[p];
				if (!pd) continue;
				html += `<tr><td><em>${p}.</em></td><td>${renderCell(pd.s)}</td><td>${renderCell(pd.pl)}</td></tr>`;
			}
		}

		if (verbDetails.conj?.impers) {
			html += `<tr><th colspan="3"><em>impers.</em></th></tr>`;
			html += `<tr><td colspan="3">${renderCell(verbDetails.conj.impers)}</td></tr>`;
		}

		html += '</table>';

		const coupl = (verbDetails.coupl || '').trim();
		if (coupl) {
			const couplInf = wd?.verb?.[coupl]?.inf;
			const couplDisplay = couplInf ? renderCell(couplInf) : coupl;
			html += `<div class="gram-note">Couple aspectuel : ${couplDisplay}</div>`;
		}

		return html;
	}
</script>

{#if tableHTML}
	{@html tableHTML}
{/if}
