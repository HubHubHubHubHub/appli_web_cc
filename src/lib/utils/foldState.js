/**
 * Returns true if at least one category is open or one letter group is expanded.
 *
 * @param {Record<string, Map<string, string[]>>} groupedData
 * @param {Record<string, boolean>} categoryOpen
 * @param {Record<string, boolean>} letterOpen
 */
export function hasAnyExpanded(groupedData, categoryOpen, letterOpen) {
	return Object.keys(groupedData).some(
		(catKey) =>
			categoryOpen[catKey] ||
			[...groupedData[catKey].keys()].some((l) => letterOpen[`${catKey}:${l}`])
	);
}
