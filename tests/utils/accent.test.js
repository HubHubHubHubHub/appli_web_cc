import { describe, it, expect } from "vitest";
import { addAccent, highlightLetter } from "../../src/lib/utils/accent.js";

// ─── addAccent ───────────────────────────────────────────────────────────────
describe("addAccent", () => {
  const accent = "\u0301";

  it("inserts combining acute after the given 1-based position", () => {
    const result = addAccent("один", 3);
    expect(result).toBe("оди" + accent + "н");
  });

  it("handles position 1 (first letter)", () => {
    const result = addAccent("я", 1);
    expect(result).toBe("я" + accent);
  });

  it("returns empty string for null input", () => {
    expect(addAccent(null, 1)).toBe("");
  });

  it("returns empty string for undefined input", () => {
    expect(addAccent(undefined, 2)).toBe("");
  });

  it("returns unmodified word when position is 0 or negative", () => {
    expect(addAccent("слово", 0)).toBe("слово");
    expect(addAccent("слово", -1)).toBe("слово");
  });

  it("returns unmodified word when position exceeds length", () => {
    expect(addAccent("аб", 5)).toBe("аб");
  });
});

// ─── highlightLetter ─────────────────────────────────────────────────────────
describe("highlightLetter", () => {
  const accent = "\u0301";

  it("wraps the letter at position in a <span> with accent", () => {
    const result = highlightLetter("слово", 2, "accent");
    expect(result).toContain('<span class="accent">');
    expect(result).toContain(accent);
  });

  it("returns original word when position is out of bounds", () => {
    expect(highlightLetter("аб", -1, "x")).toBe("аб");
    expect(highlightLetter("аб", 5, "x")).toBe("аб");
  });

  it("correctly handles position 0 (first character)", () => {
    const result = highlightLetter("abc", 0, "hl");
    expect(result).toBe('<span class="hl">a' + accent + "</span>bc");
  });
});
