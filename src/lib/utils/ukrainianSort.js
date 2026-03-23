/**
 * Ukrainian alphabet sorting and grouping utilities.
 */

export const UK_ALPHABET = [
	'А', 'Б', 'В', 'Г', 'Ґ', 'Д', 'Е', 'Є', 'Ж', 'З',
	'И', 'І', 'Ї', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П',
	'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ',
	'Ь', 'Ю', 'Я',
];

const letterRank = new Map();
for (let i = 0; i < UK_ALPHABET.length; i++) {
	letterRank.set(UK_ALPHABET[i], i);
}

function charRank(ch) {
	const upper = ch.toUpperCase();
	const rank = letterRank.get(upper);
	return rank !== undefined ? rank : 1000 + upper.codePointAt(0);
}

/**
 * Compare two Ukrainian strings in Ukrainian alphabetical order.
 * Case-insensitive.
 */
export function compareUkrainian(a, b) {
	const len = Math.min(a.length, b.length);
	for (let i = 0; i < len; i++) {
		const ra = charRank(a[i]);
		const rb = charRank(b[i]);
		if (ra !== rb) return ra - rb;
	}
	return a.length - b.length;
}

/**
 * Group word keys by their first Ukrainian letter.
 * Returns a Map<string, string[]> where keys are uppercase letters
 * in Ukrainian alphabet order, and values are sorted word arrays.
 * Letters with no entries are omitted.
 */
export function groupByFirstLetter(wordKeys) {
	const groups = new Map();

	for (const word of wordKeys) {
		const letter = word[0].toUpperCase();
		if (!groups.has(letter)) {
			groups.set(letter, []);
		}
		groups.get(letter).push(word);
	}

	// Sort words within each group
	for (const words of groups.values()) {
		words.sort(compareUkrainian);
	}

	// Rebuild Map in Ukrainian alphabet order
	const ordered = new Map();
	for (const letter of UK_ALPHABET) {
		if (groups.has(letter)) {
			ordered.set(letter, groups.get(letter));
		}
	}
	// Add any letters not in UK_ALPHABET at the end
	for (const [letter, words] of groups) {
		if (!ordered.has(letter)) {
			ordered.set(letter, words);
		}
	}

	return ordered;
}
