export const dataStore = createDataStore();

function createDataStore() {
	let wordData = $state({});
	let phraseData = $state({});

	return {
		get wordData() { return wordData; },
		set wordData(v) { wordData = v; },

		get phraseData() { return phraseData; },
		set phraseData(v) { phraseData = v; },
	};
}
