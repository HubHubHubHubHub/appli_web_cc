import { describe, it, expect, beforeEach } from 'vitest';
import { applyAccents } from '$lib/utils/accentDom.js';

const mockWordData = {
	nom: {
		дім: {
			cas: {
				nomi: { s: ['дім', 1] },
				gen: { s: ['дому', 2] },
			},
		},
	},
};

function makeContainer(html) {
	const el = document.createElement('div');
	el.innerHTML = html;
	return el;
}

describe('applyAccents', () => {
	it('applique l\'accent sur un élément .ukr avec data-info valide', () => {
		const el = makeContainer('<span class="ukr" data-info="дім;nom;cas;nomi;s">дім</span>');
		applyAccents(el, mockWordData, true);
		const span = el.querySelector('.ukr');
		expect(span.innerHTML).toContain('accent');
		expect(span.dataset.original).toBe('дім');
	});

	it('restaure le texte original quand accent désactivé', () => {
		const el = makeContainer('<span class="ukr" data-info="дім;nom;cas;nomi;s">дім</span>');
		applyAccents(el, mockWordData, true);
		applyAccents(el, mockWordData, false);
		const span = el.querySelector('.ukr');
		expect(span.innerHTML).toBe('дім');
	});

	it('ne modifie pas un élément sans data-info', () => {
		const el = makeContainer('<span class="ukr">дім</span>');
		applyAccents(el, mockWordData, true);
		const span = el.querySelector('.ukr');
		expect(span.innerHTML).toBe('дім');
	});

	it('ne crash pas si le mot est absent de wordData', () => {
		const el = makeContainer('<span class="ukr" data-info="inconnu;nom;cas;nomi;s">inconnu</span>');
		applyAccents(el, mockWordData, true);
		const span = el.querySelector('.ukr');
		expect(span.innerHTML).toBe('inconnu');
	});

	it('préserve le texte original sur plusieurs appels', () => {
		const el = makeContainer('<span class="ukr" data-info="дім;nom;cas;nomi;s">дім</span>');
		applyAccents(el, mockWordData, true);
		applyAccents(el, mockWordData, true);
		const span = el.querySelector('.ukr');
		expect(span.dataset.original).toBe('дім');
	});

	it('gère plusieurs éléments .ukr', () => {
		const el = makeContainer(
			'<span class="ukr" data-info="дім;nom;cas;nomi;s">дім</span>' +
			'<span class="ukr" data-info="дім;nom;cas;gen;s">дому</span>'
		);
		applyAccents(el, mockWordData, true);
		const spans = el.querySelectorAll('.ukr');
		expect(spans[0].innerHTML).toContain('accent');
		expect(spans[1].innerHTML).toContain('accent');
	});
});
