import { describe, it, expect } from "vitest";
import { labelCategory, labelTense, labelNumber } from "../../src/lib/utils/i18n.js";

describe("i18n labels", () => {
  it("labelCategory maps known categories", () => {
    expect(labelCategory("verb")).toBe("verbe");
    expect(labelCategory("nom")).toBe("nom");
    expect(labelCategory("adj")).toBe("adj.");
  });

  it("labelCategory falls back to raw value for unknowns", () => {
    expect(labelCategory("xyz")).toBe("xyz");
  });

  it("labelTense maps known tenses", () => {
    expect(labelTense("pres")).toBe("prés.");
    expect(labelTense("fut")).toBe("fut.");
    expect(labelTense("pass")).toBe("pass.");
    expect(labelTense("imp")).toBe("imp.");
    expect(labelTense("inf")).toBe("inf.");
  });

  it("labelNumber maps known numbers", () => {
    expect(labelNumber("s")).toBe("sg");
    expect(labelNumber("pl")).toBe("pl");
  });
});
