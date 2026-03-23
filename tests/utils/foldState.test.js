import { describe, it, expect } from 'vitest';
import { hasAnyLetterExpanded } from '../../src/lib/utils/foldState.js';

/** Helper: build a Map from an array of letters */
function lettersMap(...letters) {
	return new Map(letters.map((l) => [l, [`word_${l}`]]));
}

describe('hasAnyLetterExpanded', () => {
	it('returns false when groupedData is empty', () => {
		expect(hasAnyLetterExpanded({}, {})).toBe(false);
	});

	it('returns false when all letters are closed', () => {
		const groupedData = {
			nom: lettersMap('А', 'Б'),
			adj: lettersMap('В'),
		};
		const letterOpen = {
			'nom:А': false,
			'nom:Б': false,
			'adj:В': false,
		};
		expect(hasAnyLetterExpanded(groupedData, letterOpen)).toBe(false);
	});

	it('returns true when at least one letter is open', () => {
		const groupedData = {
			nom: lettersMap('А', 'Б'),
			adj: lettersMap('В'),
		};
		const letterOpen = {
			'nom:А': false,
			'nom:Б': true,
			'adj:В': false,
		};
		expect(hasAnyLetterExpanded(groupedData, letterOpen)).toBe(true);
	});

	it('returns true when all letters are open', () => {
		const groupedData = {
			nom: lettersMap('А', 'Б'),
		};
		const letterOpen = {
			'nom:А': true,
			'nom:Б': true,
		};
		expect(hasAnyLetterExpanded(groupedData, letterOpen)).toBe(true);
	});

	it('returns false when letters are missing from letterOpen (treated as closed)', () => {
		const groupedData = {
			nom: lettersMap('А'),
		};
		// letterOpen has no entry for nom:А → undefined → falsy
		expect(hasAnyLetterExpanded(groupedData, {})).toBe(false);
	});
});
