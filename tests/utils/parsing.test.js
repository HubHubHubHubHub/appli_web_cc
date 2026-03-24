import { describe, it, expect } from "vitest";
import { parseInfo, toPairs, firstPair, firstText, firstAccent, getVariantIndex, renderCellSimple } from "../../src/lib/utils/parsing.js";

// ─── parseInfo ───────────────────────────────────────────────────────────────
describe("parseInfo", () => {
  it("splits a semicolon-separated string", () => {
    expect(parseInfo("я;proper;cas;nomi")).toEqual(["я", "proper", "cas", "nomi"]);
  });

  it("returns a single-element array for a lone token", () => {
    expect(parseInfo("mot")).toEqual(["mot"]);
  });
});

// ─── toPairs ─────────────────────────────────────────────────────────────────
describe("toPairs", () => {
  it("returns [] for null", () => {
    expect(toPairs(null)).toEqual([]);
  });

  it("returns [] for undefined", () => {
    expect(toPairs(undefined)).toEqual([]);
  });

  it("wraps a simple [form, pos] into [[form, pos]]", () => {
    expect(toPairs(["mot", 3])).toEqual([["mot", 3]]);
  });

  it("passes through already-nested pairs", () => {
    const input = [["a", 1], ["b", 2]];
    expect(toPairs(input)).toEqual(input);
  });

  it("converts flat format [f1,p1,f2,p2] into pairs", () => {
    expect(toPairs(["a", 1, "b", 2])).toEqual([["a", 1], ["b", 2]]);
  });

  it("handles old verb format [form1, form2, accentPos]", () => {
    const result = toPairs(["читаєм", "читаємо", 4]);
    expect(result).toEqual([["читаєм", 4], ["читаємо", 4]]);
  });
});

// ─── firstPair ───────────────────────────────────────────────────────────────
describe("firstPair", () => {
  it("returns first pair from a simple entry", () => {
    expect(firstPair(["mot", 3])).toEqual(["mot", 3]);
  });

  it("returns null for null input", () => {
    expect(firstPair(null)).toBeNull();
  });

  it("respects variantIndex", () => {
    const input = [["a", 1], ["b", 2]];
    expect(firstPair(input, 1)).toEqual(["b", 2]);
  });

  it("skips empty first variant to find non-empty one", () => {
    const input = [[null, -1], ["b", 2]];
    expect(firstPair(input, 0)).toEqual(["b", 2]);
  });
});

// ─── firstText ───────────────────────────────────────────────────────────────
describe("firstText", () => {
  it("returns the text of the first pair", () => {
    expect(firstText(["mot", 3])).toBe("mot");
  });

  it("returns empty string for null", () => {
    expect(firstText(null)).toBe("");
  });
});

// ─── firstAccent ─────────────────────────────────────────────────────────────
describe("firstAccent", () => {
  it("returns the accent position of the first pair", () => {
    expect(firstAccent(["mot", 3])).toBe(3);
  });

  it("returns -1 for null", () => {
    expect(firstAccent(null)).toBe(-1);
  });
});

// ─── getVariantIndex ─────────────────────────────────────────────────────────
describe("getVariantIndex", () => {
  it("extracts variant index from tokens", () => {
    expect(getVariantIndex(["a", "var=2", "b"])).toBe(2);
  });

  it("returns 0 when no var= token present", () => {
    expect(getVariantIndex(["a", "b"])).toBe(0);
  });
});

// ─── renderCellSimple ────────────────────────────────────────────────────────
describe("renderCellSimple", () => {
  const accent = "\u0301";

  it("returns empty string for null", () => {
    expect(renderCellSimple(null)).toBe("");
  });

  it("returns empty string for empty array", () => {
    expect(renderCellSimple([])).toBe("");
  });

  it("returns accented form for a simple pair", () => {
    expect(renderCellSimple(["слово", 3])).toBe("сло" + accent + "во");
  });

  it("returns unaccented form when position is -1", () => {
    expect(renderCellSimple(["я", -1])).toBe("я");
  });

  it("returns empty string for undefined", () => {
    expect(renderCellSimple(undefined)).toBe("");
  });
});
