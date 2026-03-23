/**
 * Returns true if at least one letter group is expanded in any category.
 * Categories themselves are ignored — only letter-level open state counts.
 *
 * @param {Record<string, Map<string, string[]>>} groupedData
 * @param {Record<string, boolean>} letterOpen
 */
export function hasAnyLetterExpanded(groupedData, letterOpen) {
	return Object.keys(groupedData).some((catKey) =>
		[...groupedData[catKey].keys()].some((l) => letterOpen[`${catKey}:${l}`])
	);
}
