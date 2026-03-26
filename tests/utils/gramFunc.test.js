import { describe, it, expect } from "vitest";
import { generateVerbForms } from "../../src/lib/utils/gramFunc.js";

const mockWordData = {
  verb: {
    читати: {
      meta: { pos: "verb", aspect: "impf" },
      inf: [["читати", 3]],
      conj: {
        pres: {
          1: { sg: [["читаю", 4]], pl: [["читаємо", 4]] },
          2: { sg: [["читаєш", 4]], pl: [["читаєте", 4]] },
          3: { sg: [["читає", 4]], pl: [["читають", 4]] },
        },
        past: {
          m: { sg: [["читав", 3]], pl: [["читали", 3]] },
          f: { sg: [["читала", 3]] },
          n: { sg: [["читало", 3]] },
        },
      },
    },
  },
};

describe("generateVerbForms", () => {
  it("generates present tense forms with pronouns", () => {
    const html = generateVerbForms(mockWordData, "читати", "pres", "Вчора", "книгу");
    expect(html).toContain("Вчора");
    expect(html).toContain("книгу");
    expect(html).toContain("я");
    expect(html).toContain("ти");
    expect(html).toContain("<li>");
  });

  it("generates past tense forms with gendered pronouns", () => {
    const html = generateVerbForms(mockWordData, "читати", "past", "", "");
    expect(html).toContain("він");
    expect(html).toContain("вона");
    expect(html).toContain("воно");
  });

  it("returns empty string for non-existent verb", () => {
    expect(generateVerbForms(mockWordData, "inexistant", "pres", "", "")).toBe("");
  });

  it("returns empty string for non-existent tense", () => {
    expect(generateVerbForms(mockWordData, "читати", "fut", "", "")).toBe("");
  });

  it("includes V2 data-info attributes for hover functionality", () => {
    const html = generateVerbForms(mockWordData, "читати", "pres", "", "");
    expect(html).toContain('data-info="читати;pos=verb;verbForm=fin;tense=pres;');
  });
});
