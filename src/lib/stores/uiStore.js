import { writable } from 'svelte/store';

export const pinnedElement = writable(null);
export const accentEnabled = writable(true);
export const selectedWord = writable(null);
export const selectedCategory = writable(null);
export const grammarTableData = writable(null);
