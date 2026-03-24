import { describe, it, expect } from 'vitest';
import {
	renderCell,
	generateTableNoun,
	generateTableProper,
	generateTableAdj,
	generateTableVerb,
} from '$lib/utils/tableGeneration.js';

describe('renderCell', () => {
	it('rend une paire simple avec accent', () => {
		expect(renderCell(['балкон', 5])).toContain('балко');
	});

	it('retourne vide pour null', () => {
		expect(renderCell(null)).toBe('');
	});

	it('rend plusieurs variantes séparées par /', () => {
		const entry = [['дім', 1], ['дому', 2]];
		const result = renderCell(entry);
		expect(result).toContain('/');
	});
});

describe('generateTableNoun', () => {
	it('retourne table vide pour null', () => {
		expect(generateTableNoun(null, 'nomi', 's')).toBe('<table></table>');
	});

	it('génère un tableau HTML avec les cas', () => {
		const casData = {
			nomi: { s: ['дім', 1], pl: ['доми', 2] },
			gen: { s: ['дому', 2], pl: ['домів', 3] },
		};
		const html = generateTableNoun(casData, 'nomi', 's');
		expect(html).toContain('<table>');
		expect(html).toContain('</table>');
		expect(html).toContain('nomi.');
		expect(html).toContain('gen.');
		expect(html).toContain('<strong>');
	});

	it('met en gras uniquement le cas et nombre actifs', () => {
		const casData = {
			nomi: { s: ['дім', 1], pl: ['доми', 2] },
		};
		const html = generateTableNoun(casData, 'nomi', 's');
		// s du nomi doit être en gras
		expect(html).toMatch(/<strong>.*<\/strong>/);
	});
});

describe('generateTableProper', () => {
	it('retourne table vide pour null', () => {
		expect(generateTableProper(null, 'nomi')).toBe('<table></table>');
	});

	it('met en gras le cas actif', () => {
		const casData = {
			nomi: ['Київ', 2],
			gen: ['Києва', 3],
		};
		const html = generateTableProper(casData, 'gen');
		expect(html).toContain('<strong>');
		expect(html).toContain('gen.');
	});
});

describe('generateTableAdj', () => {
	it('retourne table vide pour null', () => {
		expect(generateTableAdj(null, 'nomi', 'm')).toBe('<table></table>');
	});

	it('omet le vocatif', () => {
		const casData = {
			nomi: { m: ['великий', 4] },
			voc: { m: ['великий', 4] },
		};
		const html = generateTableAdj(casData, 'nomi', 'm');
		expect(html).not.toContain('voc.');
	});
});

describe('generateTableVerb', () => {
	it('retourne table vide pour null', () => {
		expect(generateTableVerb(null, {})).toBe('<table></table>');
	});

	it('génère la section infinitif', () => {
		const verb = { inf: ['читати', 3], conj: {} };
		const html = generateTableVerb(verb, {});
		expect(html).toContain('inf.');
	});

	it('affiche le couple aspectuel', () => {
		const wd = {
			verb: {
				прочитати: { inf: ['прочитати', 5] },
			},
		};
		const verb = { inf: ['читати', 3], conj: {}, coupl: 'прочитати' };
		const html = generateTableVerb(verb, wd);
		expect(html).toContain('Couple aspectuel');
	});
});
