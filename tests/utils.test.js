import { describe, it, expect } from "vitest";
import { Utils } from "../scripts/utils.js";

// ─── parseInfo ───────────────────────────────────────────────────────────────
describe("Utils.parseInfo", () => {
  it("splits a semicolon-separated string", () => {
    expect(Utils.parseInfo("я;proper;cas;nomi")).toEqual([
      "я",
      "proper",
      "cas",
      "nomi",
    ]);
  });

  it("returns a single-element array for a lone token", () => {
    expect(Utils.parseInfo("mot")).toEqual(["mot"]);
  });
});

// ─── addAccent ───────────────────────────────────────────────────────────────
describe("Utils.addAccent", () => {
  const accent = "\u0301"; // combining acute

  it("inserts combining acute after the given 1-based position", () => {
    const result = Utils.addAccent("один", 3);
    // "оди" + accent + "н"
    expect(result).toBe("оди" + accent + "н");
  });

  it("handles position 1 (first letter)", () => {
    const result = Utils.addAccent("я", 1);
    expect(result).toBe("я" + accent);
  });

  it("returns empty string for null input", () => {
    expect(Utils.addAccent(null, 1)).toBe("");
  });

  it("returns empty string for undefined input", () => {
    expect(Utils.addAccent(undefined, 2)).toBe("");
  });

  it("returns unmodified word when position is 0 or negative", () => {
    expect(Utils.addAccent("слово", 0)).toBe("слово");
    expect(Utils.addAccent("слово", -1)).toBe("слово");
  });

  it("returns unmodified word when position exceeds length", () => {
    expect(Utils.addAccent("аб", 5)).toBe("аб");
  });
});

// ─── highlightLetter ─────────────────────────────────────────────────────────
describe("Utils.highlightLetter", () => {
  const accent = "\u0301";

  it("wraps the letter at position in a <span> with accent", () => {
    const result = Utils.highlightLetter("слово", 2, "accent");
    expect(result).toContain('<span class="accent">');
    expect(result).toContain(accent);
  });

  it("returns original word when position is out of bounds", () => {
    expect(Utils.highlightLetter("аб", -1, "x")).toBe("аб");
    expect(Utils.highlightLetter("аб", 5, "x")).toBe("аб");
  });

  it("correctly handles position 0 (first character)", () => {
    const result = Utils.highlightLetter("abc", 0, "hl");
    expect(result).toBe('<span class="hl">a' + accent + "</span>bc");
  });
});

// ─── toPairs ─────────────────────────────────────────────────────────────────
describe("Utils.toPairs", () => {
  it("returns [] for null", () => {
    expect(Utils.toPairs(null)).toEqual([]);
  });

  it("returns [] for undefined", () => {
    expect(Utils.toPairs(undefined)).toEqual([]);
  });

  it("wraps a simple [form, pos] into [[form, pos]]", () => {
    expect(Utils.toPairs(["mot", 3])).toEqual([["mot", 3]]);
  });

  it("passes through already-nested pairs", () => {
    const input = [
      ["a", 1],
      ["b", 2],
    ];
    expect(Utils.toPairs(input)).toEqual(input);
  });

  it("converts flat format [f1,p1,f2,p2] into pairs", () => {
    expect(Utils.toPairs(["a", 1, "b", 2])).toEqual([
      ["a", 1],
      ["b", 2],
    ]);
  });

  it("handles old verb format [form1, form2, accentPos]", () => {
    const result = Utils.toPairs(["читаєм", "читаємо", 4]);
    expect(result).toEqual([
      ["читаєм", 4],
      ["читаємо", 4],
    ]);
  });
});

// ─── firstPair ───────────────────────────────────────────────────────────────
describe("Utils.firstPair", () => {
  it("returns first pair from a simple entry", () => {
    expect(Utils.firstPair(["mot", 3])).toEqual(["mot", 3]);
  });

  it("returns null for null input", () => {
    expect(Utils.firstPair(null)).toBeNull();
  });

  it("respects variantIndex", () => {
    const input = [
      ["a", 1],
      ["b", 2],
    ];
    expect(Utils.firstPair(input, 1)).toEqual(["b", 2]);
  });

  it("skips empty first variant to find non-empty one", () => {
    const input = [
      [null, -1],
      ["b", 2],
    ];
    expect(Utils.firstPair(input, 0)).toEqual(["b", 2]);
  });
});

// ─── firstText ───────────────────────────────────────────────────────────────
describe("Utils.firstText", () => {
  it("returns the text of the first pair", () => {
    expect(Utils.firstText(["mot", 3])).toBe("mot");
  });

  it("returns empty string for null", () => {
    expect(Utils.firstText(null)).toBe("");
  });
});

// ─── firstAccent ─────────────────────────────────────────────────────────────
describe("Utils.firstAccent", () => {
  it("returns the accent position of the first pair", () => {
    expect(Utils.firstAccent(["mot", 3])).toBe(3);
  });

  it("returns -1 for null", () => {
    expect(Utils.firstAccent(null)).toBe(-1);
  });
});

// ─── getVariantIndex ─────────────────────────────────────────────────────────
describe("Utils.getVariantIndex", () => {
  it("extracts variant index from tokens", () => {
    expect(Utils.getVariantIndex(["a", "var=2", "b"])).toBe(2);
  });

  it("returns 0 when no var= token present", () => {
    expect(Utils.getVariantIndex(["a", "b"])).toBe(0);
  });
});

// ─── i18n labels ─────────────────────────────────────────────────────────────
describe("i18n labels", () => {
  it("labelCategory maps known categories", () => {
    expect(Utils.labelCategory("verb")).toBe("verbe");
    expect(Utils.labelCategory("nom")).toBe("nom");
    expect(Utils.labelCategory("adj")).toBe("adj.");
  });

  it("labelCategory falls back to raw value for unknowns", () => {
    expect(Utils.labelCategory("xyz")).toBe("xyz");
  });

  it("labelTense maps known tenses", () => {
    expect(Utils.labelTense("pres")).toBe("prés.");
    expect(Utils.labelTense("fut")).toBe("fut.");
    expect(Utils.labelTense("pass")).toBe("pass.");
    expect(Utils.labelTense("imp")).toBe("imp.");
    expect(Utils.labelTense("inf")).toBe("inf.");
  });

  it("labelNumber maps known numbers", () => {
    expect(Utils.labelNumber("s")).toBe("sg");
    expect(Utils.labelNumber("pl")).toBe("pl");
  });
});
