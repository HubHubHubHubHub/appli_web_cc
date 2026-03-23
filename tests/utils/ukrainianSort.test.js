import { describe, it, expect } from "vitest";
import {
  UK_ALPHABET,
  compareUkrainian,
  groupByFirstLetter,
} from "../../src/lib/utils/ukrainianSort.js";

// ─── UK_ALPHABET ────────────────────────────────────────────────────────────

describe("UK_ALPHABET", () => {
  it("has exactly 33 letters", () => {
    expect(UK_ALPHABET).toHaveLength(33);
  });

  it("starts with А and ends with Я", () => {
    expect(UK_ALPHABET[0]).toBe("А");
    expect(UK_ALPHABET[32]).toBe("Я");
  });

  it("contains Ґ after Г", () => {
    const iГ = UK_ALPHABET.indexOf("Г");
    const iҐ = UK_ALPHABET.indexOf("Ґ");
    expect(iҐ).toBe(iГ + 1);
  });

  it("contains Є after Е", () => {
    const iЕ = UK_ALPHABET.indexOf("Е");
    const iЄ = UK_ALPHABET.indexOf("Є");
    expect(iЄ).toBe(iЕ + 1);
  });

  it("contains Ї after І", () => {
    const iІ = UK_ALPHABET.indexOf("І");
    const iЇ = UK_ALPHABET.indexOf("Ї");
    expect(iЇ).toBe(iІ + 1);
  });
});

// ─── compareUkrainian ───────────────────────────────────────────────────────

describe("compareUkrainian", () => {
  it("sorts А before Б", () => {
    expect(compareUkrainian("а", "б")).toBeLessThan(0);
  });

  it("sorts Ґ between Г and Д", () => {
    expect(compareUkrainian("ґ", "г")).toBeGreaterThan(0);
    expect(compareUkrainian("ґ", "д")).toBeLessThan(0);
  });

  it("sorts Є between Е and Ж", () => {
    expect(compareUkrainian("є", "е")).toBeGreaterThan(0);
    expect(compareUkrainian("є", "ж")).toBeLessThan(0);
  });

  it("sorts Ї between І and Й", () => {
    expect(compareUkrainian("ї", "і")).toBeGreaterThan(0);
    expect(compareUkrainian("ї", "й")).toBeLessThan(0);
  });

  it("sorts Ь between Щ and Ю", () => {
    expect(compareUkrainian("ь", "щ")).toBeGreaterThan(0);
    expect(compareUkrainian("ь", "ю")).toBeLessThan(0);
  });

  it("is case-insensitive", () => {
    expect(compareUkrainian("А", "а")).toBe(0);
    expect(compareUkrainian("Ґ", "ґ")).toBe(0);
  });

  it("sorts multi-character words by subsequent characters", () => {
    expect(compareUkrainian("банан", "банка")).toBeLessThan(0);
    expect(compareUkrainian("вода", "водій")).toBeLessThan(0);
  });

  it("returns 0 for equal words", () => {
    expect(compareUkrainian("слово", "слово")).toBe(0);
  });

  it("shorter word comes first when it is a prefix", () => {
    expect(compareUkrainian("дім", "дімка")).toBeLessThan(0);
  });
});

// ─── groupByFirstLetter ────────────────────────────────────────────────────

describe("groupByFirstLetter", () => {
  it("returns an empty Map for empty input", () => {
    const result = groupByFirstLetter([]);
    expect(result.size).toBe(0);
  });

  it("groups words by their first letter (uppercase)", () => {
    const result = groupByFirstLetter(["авто", "банан", "ананас"]);
    expect(result.get("А")).toEqual(["авто", "ананас"]);
    expect(result.get("Б")).toEqual(["банан"]);
  });

  it("omits letters with no entries", () => {
    const result = groupByFirstLetter(["авто", "банан"]);
    expect(result.has("В")).toBe(false);
    expect(result.has("Г")).toBe(false);
  });

  it("returns Map keys in Ukrainian alphabet order", () => {
    const result = groupByFirstLetter(["яблуко", "авто", "ґанок", "банан"]);
    const keys = [...result.keys()];
    expect(keys).toEqual(["А", "Б", "Ґ", "Я"]);
  });

  it("sorts words within each group in Ukrainian order", () => {
    const result = groupByFirstLetter(["вода", "вікно", "вітер"]);
    // і comes after и in Ukrainian: в, и (rank 10), і (rank 11)
    // вікно, вітер, вода
    expect(result.get("В")).toEqual(["вікно", "вітер", "вода"]);
  });

  it("handles words starting with Ґ correctly", () => {
    const result = groupByFirstLetter(["ґанок", "ґречка"]);
    expect(result.has("Ґ")).toBe(true);
    expect(result.get("Ґ")).toEqual(["ґанок", "ґречка"]);
  });
});
