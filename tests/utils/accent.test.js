import { describe, it, expect, vi } from "vitest";
import { addAccent, highlightLetter, isUkrainianVowel } from "../../src/lib/utils/accent.js";

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

// ─── isUkrainianVowel ────────────────────────────────────────────────────────
describe("isUkrainianVowel", () => {
  it("returns true for all Ukrainian vowels", () => {
    for (const v of "аеєиіїоуюя") {
      expect(isUkrainianVowel(v)).toBe(true);
    }
  });

  it("returns true for uppercase Ukrainian vowels", () => {
    for (const v of "АЕЄИІЇОУЮЯ") {
      expect(isUkrainianVowel(v)).toBe(true);
    }
  });

  it("returns false for consonants", () => {
    for (const c of "бвгдж") {
      expect(isUkrainianVowel(c)).toBe(false);
    }
  });

  it("returns false for null/undefined", () => {
    expect(isUkrainianVowel(null)).toBe(false);
    expect(isUkrainianVowel(undefined)).toBe(false);
  });
});

// ─── addAccent vowel validation ─────────────────────────────────────────────
describe("addAccent vowel validation", () => {
  it("warns when accent position points to a consonant", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    addAccent("слово", 1); // с = consonant
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toContain("pas une voyelle");
    spy.mockRestore();
  });

  it("does not warn when accent position points to a vowel", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    addAccent("слово", 3); // о = vowel
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

// ─── highlightLetter ─────────────────────────────────────────────────────────
describe("highlightLetter", () => {
  const accent = "\u0301";

  it("wraps the letter at position in a <span> without combining accent (rendered via CSS)", () => {
    const result = highlightLetter("слово", 2, "accent");
    expect(result).toBe('сл<span class="accent">о</span>во');
  });

  it("returns original word when position is out of bounds", () => {
    expect(highlightLetter("аб", -1, "x")).toBe("аб");
    expect(highlightLetter("аб", 5, "x")).toBe("аб");
  });

  it("correctly handles position 0 (first character)", () => {
    const result = highlightLetter("abc", 0, "hl");
    expect(result).toBe('<span class="hl">a</span>bc');
  });
});
