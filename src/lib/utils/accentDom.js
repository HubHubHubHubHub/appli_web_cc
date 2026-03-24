import { parseInfo, firstPair, getVariantIndex } from './parsing.js';
import { getDataFromJson } from './dataAccess.js';
import { highlightLetter } from './accent.js';

/**
 * Applique ou retire le marquage d'accent sur les éléments `.ukr` d'un conteneur.
 * Chaque élément `.ukr` doit porter un attribut `data-info` au format semicolon-separated.
 * Le texte original est sauvegardé dans `dataset.original` au premier passage.
 * @param {HTMLElement} el - Conteneur DOM
 * @param {object} wordData - Objet wordData complet
 * @param {boolean} enabled - Si true, affiche les accents ; sinon restaure le texte original
 */
export function applyAccents(el, wordData, enabled) {
	const words = el.querySelectorAll('.ukr');

	words.forEach((word) => {
		if (!word.dataset.original) {
			word.dataset.original = word.textContent;
		}

		if (enabled) {
			const raw = word.getAttribute('data-info');
			if (!raw) return;
			const dataInfo = parseInfo(raw);
			const [lemma, categorie, ...rest] = dataInfo;
			const infos = [lemma, ...rest];
			const variantIndex = getVariantIndex(dataInfo);
			const entry = getDataFromJson(wordData, categorie, infos);

			if (entry) {
				const pair = firstPair(entry, variantIndex);
				if (pair && Number.isInteger(pair[1]) && pair[1] > 0) {
					const pos0 = pair[1] - 1;
					word.innerHTML = highlightLetter(word.dataset.original, pos0, 'accent');
					return;
				}
			}
			word.innerHTML = word.dataset.original;
		} else {
			word.innerHTML = word.dataset.original;
		}
	});
}
