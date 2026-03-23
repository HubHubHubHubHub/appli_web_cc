import { describe, it, expect, beforeEach } from "vitest";
import { displayManager } from "../scripts/displayManager.js";
import { Utils } from "../scripts/utils.js";
import { dataManager } from "../scripts/dataManager.js";

const accent = "\u0301";

beforeEach(() => {
  dataManager.wordData = {};
  dataManager.phraseData = {};
});

// ─── generateNounDetails ─────────────────────────────────────────────────────
describe("displayManager.generateNounDetails", () => {
  const nounDetails = {
    cas: {
      nomi: { s: ["слово", 3], pl: ["слова", 3] },
      gen: { s: ["слова", 3], pl: ["слів", 2] },
    },
  };

  it("returns HTML with <ul> and <li> for each case", () => {
    const html = displayManager.generateNounDetails(nounDetails);
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>");
    expect(html).toContain("nomi");
    expect(html).toContain("gen");
  });

  it("contains accented forms", () => {
    const html = displayManager.generateNounDetails(nounDetails);
    expect(html).toContain(accent);
  });

  it("returns empty string when no cas property", () => {
    expect(displayManager.generateNounDetails({})).toBe("");
  });
});

// ─── generateAdjectiveDetails ────────────────────────────────────────────────
describe("displayManager.generateAdjectiveDetails", () => {
  const adjDetails = {
    cas: {
      nomi: {
        m: ["великий", 5],
        f: ["велика", 5],
        n: ["велике", 5],
        pl: ["великі", 5],
      },
    },
  };

  it("returns a <table> with case rows", () => {
    const html = displayManager.generateAdjectiveDetails(adjDetails);
    expect(html).toContain("<table");
    expect(html).toContain("називний");
  });

  it("contains gender columns (m/f/n/pl)", () => {
    const html = displayManager.generateAdjectiveDetails(adjDetails);
    expect(html).toContain("чол. р.");
    expect(html).toContain("жін. р.");
    expect(html).toContain("сер. р.");
    expect(html).toContain("множина");
  });

  it("returns empty string when no cas property", () => {
    expect(displayManager.generateAdjectiveDetails({})).toBe("");
  });
});

// ─── generateBaseDetails ─────────────────────────────────────────────────────
describe("displayManager.generateBaseDetails", () => {
  it("returns HTML with the accented base form", () => {
    const details = { base: ["але", -1] };
    const html = displayManager.generateBaseDetails(details);
    expect(html).toContain("Forme de base");
    expect(html).toContain("але");
  });
});

// ─── generateVerbTable ───────────────────────────────────────────────────────
describe("displayManager.generateVerbTable", () => {
  const verbDetails = {
    inf: ["читати", 3],
    conj: {
      pres: {
        "1p": { s: ["читаю", 4], pl: ["читаємо", 4] },
      },
      pass: {
        m: { s: ["читав", 3], pl: ["читали", 3] },
      },
    },
  };

  it("renders infinitive section", () => {
    const html = displayManager.generateVerbTable(verbDetails);
    expect(html).toContain("Інфінітив");
  });

  it("renders present tense header", () => {
    const html = displayManager.generateVerbTable(verbDetails);
    expect(html).toContain("Теперішній час");
  });

  it("renders past tense header", () => {
    const html = displayManager.generateVerbTable(verbDetails);
    expect(html).toContain("Минулий час");
  });

  it("returns a complete <table>", () => {
    const html = displayManager.generateVerbTable(verbDetails);
    expect(html).toContain("<table");
    expect(html).toContain("</table>");
  });
});

// ─── generateExamplePhrases ──────────────────────────────────────────────────
describe("displayManager.generateExamplePhrases", () => {
  it("renders phrases from phraseData", () => {
    dataManager.phraseData = {
      "Він читає книгу.": {
        phrase_html: '<span class="ukr">Він читає книгу.</span>',
        traduction: "Il lit un livre.",
      },
    };
    const phrases = { "Він читає книгу.": true };
    const html = displayManager.generateExamplePhrases(phrases);
    expect(html).toContain("Phrases d'exemple");
    expect(html).toContain("Il lit un livre.");
  });
});
