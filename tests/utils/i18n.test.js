import { describe, it, expect } from "vitest";
import { labelCategory, labelTense, labelNumber } from "../../src/lib/utils/i18n.js";

describe("i18n labels", () => {
  it("labelCategory maps known categories (V2)", () => {
    expect(labelCategory("verb")).toBe("verbe");
    expect(labelCategory("noun")).toBe("nom");
    expect(labelCategory("adj")).toBe("adj.");
    expect(labelCategory("pron")).toBe("pron.");
    expect(labelCategory("num")).toBe("num.");
  });

  it("labelCategory falls back to raw value for unknowns", () => {
    expect(labelCategory("xyz")).toBe("xyz");
  });

  it("labelTense maps known tenses (V2)", () => {
    expect(labelTense("pres")).toBe("prés.");
    expect(labelTense("fut")).toBe("fut.");
    expect(labelTense("past")).toBe("pass.");
    expect(labelTense("imp")).toBe("imp.");
    expect(labelTense("inf")).toBe("inf.");
  });

  it("labelNumber maps known numbers (V2)", () => {
    expect(labelNumber("sg")).toBe("sg");
    expect(labelNumber("pl")).toBe("pl");
  });
});
