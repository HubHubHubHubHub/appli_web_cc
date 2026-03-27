const COMBINING_ACUTE = "\u0301";
const UKRAINIAN_VOWELS = new Set("аеєиіїоуюя");
const DOTTED_VOWELS = new Set("іїІЇ");

/**
 * Vérifie si un caractère est une voyelle ukrainienne (аеєиіїоуюя).
 * @param {string} char - Caractère à tester
 * @returns {boolean}
 */
export function isUkrainianVowel(char) {
  return UKRAINIAN_VOWELS.has(char?.toLowerCase());
}

/**
 * Insère un accent aigu combinant (U+0301) après la voyelle à la position donnée.
 * La position est 1-based. Les valeurs ≤ 0 ou hors limites sont ignorées.
 * @param {string} word - Mot ukrainien
 * @param {number} accentPosition - Position 1-based de la voyelle accentuée
 * @returns {string} Mot avec accent combinant inséré
 */
export function addAccent(word, accentPosition) {
  if (!word) return "";
  const chars = Array.from(word);
  if (accentPosition > 0 && accentPosition <= chars.length) {
    const target = chars[accentPosition - 1];
    if (!isUkrainianVowel(target)) {
      if (import.meta.env.DEV) console.warn(
        `addAccent: position ${accentPosition} dans "${word}" pointe sur "${target}", pas une voyelle ukrainienne`,
      );
    }
    chars[accentPosition - 1] += COMBINING_ACUTE;
  }
  return chars.join("");
}

/**
 * Retourne un fragment HTML où la voyelle accentuée est enveloppée dans
 * <span class="with-accent">. L'accent est dessiné en CSS (::after).
 * @param {string} word - Mot ukrainien
 * @param {number} accentPosition - Position 1-based de la voyelle accentuée
 * @returns {string} HTML avec la voyelle enveloppée
 */
export function addAccentHTML(word, accentPosition) {
  if (!word) return "";
  const chars = Array.from(word);
  if (accentPosition > 0 && accentPosition <= chars.length) {
    const target = chars[accentPosition - 1];
    if (!isUkrainianVowel(target)) {
      if (import.meta.env.DEV) console.warn(
        `addAccentHTML: position ${accentPosition} dans "${word}" pointe sur "${target}", pas une voyelle ukrainienne`,
      );
    }
    const dot = DOTTED_VOWELS.has(target) ? " data-dot" : "";
    chars[accentPosition - 1] = `<span class="with-accent"${dot}>${target}</span>`;
  }
  return chars.join("");
}

/**
 * Entoure la lettre à la position donnée d'un <span> avec accent combinant.
 * Utilisé pour le rendu HTML des accents dans le DOM (via innerHTML).
 * @param {string} word - Mot ukrainien (texte brut)
 * @param {number} position - Position 0-based de la lettre à mettre en valeur
 * @param {string} classe - Classe CSS du span (ex: 'accent')
 * @returns {string} HTML avec la lettre enveloppée
 */
export function highlightLetter(word, position, classe) {
  if (position < 0 || position >= word.length) return word;
  const ch = word[position];
  const dot = DOTTED_VOWELS.has(ch) ? " data-dot" : "";
  return (
    word.slice(0, position) +
    `<span class="${classe}"${dot}>` +
    ch +
    "</span>" +
    word.slice(position + 1)
  );
}
