const COMBINING_ACUTE = "\u0301";

export function addAccent(word, accentPosition) {
  if (!word) return "";
  const chars = Array.from(word);
  if (accentPosition > 0 && accentPosition <= chars.length) {
    chars[accentPosition - 1] += COMBINING_ACUTE;
  }
  return chars.join("");
}

export function highlightLetter(word, position, classe) {
  if (position < 0 || position >= word.length) return word;
  return (
    word.slice(0, position) +
    `<span class="${classe}">` +
    word[position] +
    COMBINING_ACUTE +
    "</span>" +
    word.slice(position + 1)
  );
}
