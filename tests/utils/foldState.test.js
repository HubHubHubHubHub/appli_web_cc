import { describe, it, expect } from 'vitest';
import { hasAnyExpanded } from '../../src/lib/utils/foldState.js';

/** Helper: build a Map from an array of letters */
function lettersMap(...letters) {
	return new Map(letters.map((l) => [l, [`word_${l}`]]));
}

describe('hasAnyExpanded', () => {
	it('returns false when groupedData is empty', () => {
		expect(hasAnyExpanded({}, {}, {})).toBe(false);
	});

	it('returns false when all categories and letters are closed', () => {
		const groupedData = {
			nom: lettersMap('А', 'Б'),
			adj: lettersMap('В'),
		};
		const categoryOpen = { nom: false, adj: false };
		const letterOpen = {
			'nom:А': false,
			'nom:Б': false,
			'adj:В': false,
		};
		expect(hasAnyExpanded(groupedData, categoryOpen, letterOpen)).toBe(false);
	});

	it('returns true when a category is open even if all letters are closed', () => {
		const groupedData = {
			nom: lettersMap('А', 'Б'),
			adj: lettersMap('В'),
		};
		const categoryOpen = { nom: true, adj: false };
		const letterOpen = {
			'nom:А': false,
			'nom:Б': false,
			'adj:В': false,
		};
		expect(hasAnyExpanded(groupedData, categoryOpen, letterOpen)).toBe(true);
	});

	it('returns true when at least one letter is open', () => {
		const groupedData = {
			nom: lettersMap('А', 'Б'),
			adj: lettersMap('В'),
		};
		const categoryOpen = { nom: false, adj: false };
		const letterOpen = {
			'nom:А': false,
			'nom:Б': true,
			'adj:В': false,
		};
		expect(hasAnyExpanded(groupedData, categoryOpen, letterOpen)).toBe(true);
	});

	it('returns true when all categories and letters are open', () => {
		const groupedData = {
			nom: lettersMap('А', 'Б'),
		};
		const categoryOpen = { nom: true };
		const letterOpen = {
			'nom:А': true,
			'nom:Б': true,
		};
		expect(hasAnyExpanded(groupedData, categoryOpen, letterOpen)).toBe(true);
	});

	it('returns false when entries are missing from state (treated as closed)', () => {
		const groupedData = {
			nom: lettersMap('А'),
		};
		expect(hasAnyExpanded(groupedData, {}, {})).toBe(false);
	});
});
