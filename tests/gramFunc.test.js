import { describe, it, expect, beforeEach } from "vitest";
import { gramFunc } from "../scripts/gramFunc.js";
import { dataManager } from "../scripts/dataManager.js";

beforeEach(() => {
  dataManager.wordData = {
    verb: {
      "читати": {
        inf: ["читати", 3],
        conj: {
          pres: {
            "1p": { s: ["читаю", 4], pl: ["читаємо", 4] },
            "2p": { s: ["читаєш", 4], pl: ["читаєте", 4] },
            "3p": { s: ["читає", 4], pl: ["читають", 4] },
          },
          pass: {
            m: { s: ["читав", 3], pl: ["читали", 3] },
            f: { s: ["читала", 3] },
            n: { s: ["читало", 3] },
          },
        },
      },
    },
  };
});

describe("gramFunc.generateVerbForms", () => {
  it("generates present tense forms with pronouns", () => {
    const html = gramFunc.generateVerbForms("читати", "pres", "Вчора", "книгу");
    expect(html).toContain("Вчора");
    expect(html).toContain("книгу");
    expect(html).toContain("я"); // 1st person pronoun
    expect(html).toContain("ти"); // 2nd person pronoun
    expect(html).toContain("<li>");
  });

  it("generates past tense forms with gendered pronouns", () => {
    const html = gramFunc.generateVerbForms("читати", "pass", "", "");
    expect(html).toContain("він"); // masculine
    expect(html).toContain("вона"); // feminine
    expect(html).toContain("воно"); // neuter
  });

  it("returns empty string for non-existent verb", () => {
    expect(gramFunc.generateVerbForms("inexistant", "pres", "", "")).toBe("");
  });

  it("returns empty string for non-existent tense", () => {
    expect(gramFunc.generateVerbForms("читати", "fut", "", "")).toBe("");
  });

  it("includes data-info attributes for hover functionality", () => {
    const html = gramFunc.generateVerbForms("читати", "pres", "", "");
    expect(html).toContain('data-info="читати;verb;conj;pres;');
  });
});
