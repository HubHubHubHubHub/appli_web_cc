import { describe, it, expect } from "vitest";
import { filterPhrases } from "../../src/lib/utils/phrases.js";

const mockPhrases = {
  "Він читає книгу.": {
    phrase_html: "...",
    traduction: "Il lit un livre.",
    ref: { lecon: "1", theme: "lecture" },
  },
  "Вона п'є воду.": {
    phrase_html: "...",
    traduction: "Elle boit de l'eau.",
    ref: { lecon: "2", theme: "nourriture" },
  },
  "Ми йдемо додому.": {
    phrase_html: "...",
    traduction: "Nous allons à la maison.",
    ref: { lecon: "1", theme: "déplacement" },
  },
};

describe("filterPhrases", () => {
  it("returns all phrases when search query is empty", () => {
    expect(filterPhrases(mockPhrases, "")).toEqual(mockPhrases);
  });

  it("returns all phrases when search query is null-ish (empty string)", () => {
    expect(filterPhrases(mockPhrases, "")).toEqual(mockPhrases);
  });

  it("filters by ref value", () => {
    const result = filterPhrases(mockPhrases, "lecture");
    expect(Object.keys(result)).toEqual(["Він читає книгу."]);
  });

  it("filters by ref key", () => {
    const result = filterPhrases(mockPhrases, "lecon");
    expect(Object.keys(result).length).toBe(3);
  });

  it("filters by multiple terms (AND logic)", () => {
    const result = filterPhrases(mockPhrases, "lecon 2");
    expect(Object.keys(result)).toEqual(["Вона п'є воду."]);
  });

  it("returns empty object when no match", () => {
    const result = filterPhrases(mockPhrases, "inexistant");
    expect(Object.keys(result).length).toBe(0);
  });

  it("is case-insensitive", () => {
    const result = filterPhrases(mockPhrases, "LECTURE");
    expect(Object.keys(result)).toEqual(["Він читає книгу."]);
  });
});
