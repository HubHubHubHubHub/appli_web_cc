import { describe, it, expect, beforeEach } from "vitest";
import { Utils } from "../scripts/utils.js";
import { dataManager } from "../scripts/dataManager.js";

const mockNounCas = {
  nomi: { s: ["слово", 3], pl: ["слова", 3] },
  gen: { s: ["слова", 3], pl: ["слів", 2] },
};

const mockAdjCas = {
  nomi: {
    m: ["великий", 5],
    f: ["велика", 5],
    n: ["велике", 5],
    pl: ["великі", 5],
  },
  gen: {
    m: ["великого", 5],
    f: ["великої", 5],
    n: ["великого", 5],
    pl: ["великих", 5],
  },
};

const mockProperCas = {
  nomi: ["я", -1],
  gen: ["мене", 3],
};

const mockVerbDetails = {
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
  coupl: "",
};

beforeEach(() => {
  dataManager.wordData = { verb: {} };
});

// ─── generateTableNoun ───────────────────────────────────────────────────────
describe("Utils.generateTableNoun", () => {
  it("returns a <table> containing case names", () => {
    const html = Utils.generateTableNoun(mockNounCas, "gen", "s");
    expect(html).toContain("<table>");
    expect(html).toContain("nomi.");
    expect(html).toContain("gen.");
  });

  it("bolds the matching case/number", () => {
    const html = Utils.generateTableNoun(mockNounCas, "gen", "s");
    expect(html).toContain("<strong>");
  });

  it("returns empty table for null data", () => {
    expect(Utils.generateTableNoun(null, "nomi", "s")).toBe("<table></table>");
  });
});

// ─── generateTableProper ─────────────────────────────────────────────────────
describe("Utils.generateTableProper", () => {
  it("returns table with all cases", () => {
    const html = Utils.generateTableProper(mockProperCas, "gen");
    expect(html).toContain("<table>");
    expect(html).toContain("nomi.");
    expect(html).toContain("gen.");
  });

  it("bolds the current case", () => {
    const html = Utils.generateTableProper(mockProperCas, "gen");
    expect(html).toContain("<strong>");
  });

  it("returns empty table for null", () => {
    expect(Utils.generateTableProper(null, "nomi")).toBe("<table></table>");
  });
});

// ─── generateTableAdj ────────────────────────────────────────────────────────
describe("Utils.generateTableAdj", () => {
  it("returns table with genders", () => {
    const html = Utils.generateTableAdj(mockAdjCas, "nomi", "m");
    expect(html).toContain("<table>");
    expect(html).toContain("m.");
    expect(html).toContain("f.");
  });

  it("bolds the matching case/gender", () => {
    const html = Utils.generateTableAdj(mockAdjCas, "nomi", "m");
    expect(html).toContain("<strong>");
  });

  it("returns empty table for null", () => {
    expect(Utils.generateTableAdj(null, "nomi", "m")).toBe("<table></table>");
  });
});

// ─── generateTableVerb ───────────────────────────────────────────────────────
describe("Utils.generateTableVerb", () => {
  it("returns table with infinitive and tenses", () => {
    const html = Utils.generateTableVerb(mockVerbDetails);
    expect(html).toContain("<table>");
    expect(html).toContain("inf.");
    expect(html).toContain("prés.");
    expect(html).toContain("pass.");
  });

  it("renders person rows for present tense", () => {
    const html = Utils.generateTableVerb(mockVerbDetails);
    expect(html).toContain("1p.");
    expect(html).toContain("2p.");
    expect(html).toContain("3p.");
  });

  it("renders gender rows for past tense", () => {
    const html = Utils.generateTableVerb(mockVerbDetails);
    expect(html).toContain("m.");
    expect(html).toContain("f.");
    expect(html).toContain("n.");
  });

  it("returns empty table for null", () => {
    expect(Utils.generateTableVerb(null)).toBe("<table></table>");
  });

  it("renders couple aspectuel when present", () => {
    dataManager.wordData = {
      verb: {
        "прочитати": { inf: ["прочитати", 4] },
      },
    };
    const details = { ...mockVerbDetails, coupl: "прочитати" };
    const html = Utils.generateTableVerb(details);
    expect(html).toContain("Couple aspectuel");
  });
});
