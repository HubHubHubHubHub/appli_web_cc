import { readFileSync } from 'fs';
import { resolve } from 'path';

export const prerender = true;

export function load() {
	const wordData = JSON.parse(readFileSync(resolve('static/data.json'), 'utf-8'));
	const phraseData = JSON.parse(readFileSync(resolve('static/phrases.json'), 'utf-8'));

	return { wordData, phraseData };
}
