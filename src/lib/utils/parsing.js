export function parseInfo(info) {
  return info.split(";");
}

export function toPairs(entry) {
  if (!entry) return [];
  if (Array.isArray(entry) && Array.isArray(entry[0])) return entry;

  if (
    Array.isArray(entry) &&
    entry.length === 2 &&
    typeof entry[0] === "string" &&
    Number.isInteger(entry[1])
  ) {
    return [entry];
  }

  if (
    Array.isArray(entry) &&
    entry.length >= 2 &&
    typeof entry[0] === "string" &&
    Number.isInteger(entry[1])
  ) {
    const out = [];
    for (let i = 0; i + 1 < entry.length; i += 2) {
      const f = entry[i], p = entry[i + 1];
      if (typeof f === "string" && Number.isInteger(p)) out.push([f, p]);
    }
    if (out.length) return out;
  }

  // ancien format verbe (ex: ["читаєм","читаємо",4]) → partager même accent
  if (Array.isArray(entry)) {
    const lastNum = [...entry].reverse().find(v => Number.isInteger(v));
    const forms = entry.filter(v => typeof v === "string");
    if (Number.isInteger(lastNum) && forms.length) {
      return forms.map(f => [f, lastNum]);
    }
  }

  return [];
}

export function firstPair(entry, variantIndex = 0) {
  const pairs = toPairs(entry);
  if (!pairs.length) return null;
  for (let i = variantIndex; i < pairs.length; i++) {
    const [t, p] = pairs[i] || [];
    if (typeof t === "string" && t) return [t, p];
  }
  return pairs[variantIndex] || null;
}

export function firstText(entry, variantIndex = 0) {
  const p = firstPair(entry, variantIndex);
  return p && p[0] ? p[0] : "";
}

export function firstAccent(entry, variantIndex = 0) {
  const p = firstPair(entry, variantIndex);
  return p && Number.isInteger(p[1]) ? p[1] : -1;
}

export function getVariantIndex(dataInfoTokens) {
  const t = dataInfoTokens.find(s => /^var=\d+$/.test(s));
  return t ? parseInt(t.split("=")[1], 10) : 0;
}
