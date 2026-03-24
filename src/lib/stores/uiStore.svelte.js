export const uiStore = createUIStore();

function createUIStore() {
	let pinnedElement = $state(null);
	let accentEnabled = $state(true);
	let selectedWord = $state(null);
	let selectedCategory = $state(null);
	let grammarTableData = $state(null);

	return {
		get pinnedElement() { return pinnedElement; },
		set pinnedElement(v) { pinnedElement = v; },

		get accentEnabled() { return accentEnabled; },
		set accentEnabled(v) { accentEnabled = v; },

		get selectedWord() { return selectedWord; },
		set selectedWord(v) { selectedWord = v; },

		get selectedCategory() { return selectedCategory; },
		set selectedCategory(v) { selectedCategory = v; },

		get grammarTableData() { return grammarTableData; },
		set grammarTableData(v) { grammarTableData = v; },
	};
}
