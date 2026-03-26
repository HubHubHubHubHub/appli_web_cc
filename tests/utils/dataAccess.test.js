import { describe, it, expect } from "vitest";
import {
  getDataFromJson,
  getPrincipalForm,
  getLemmaEntry,
  parseDataInfo,
} from "../../src/lib/utils/dataAccess.js";

// Mock V2 data
const mockWordData = {
  noun: {
    слово: {
      meta: { pos: "noun", gender: "n" },
      cas: {
        nom: { sg: [["слово", 3]], pl: [["слова", 3]] },
        gen: { sg: [["слова", 3]], pl: [["слів", 3]] },
      },
    },
  },
  adj: {
    великий: {
      meta: { pos: "adj" },
      cas: {
        nom: {
          m: [["великий", 4]],
          f: [["велика", 4]],
          n: [["велике", 4]],
          pl: [["великі", 4]],
        },
        gen: {
          m: [["великого", 4]],
          f: [["великої", 4]],
          n: [["великого", 4]],
          pl: [["великих", 4]],
        },
      },
    },
    мій: {
      meta: { pos: "adj", adjType: "poss", syntax: "pron_poss" },
      cas: { nom: { m: [["мій", 2]], f: [["моя", 3]] } },
    },
    цей: {
      meta: { pos: "adj", adjType: "dem", syntax: "pron_dem" },
      cas: {
        nom: { m: [["цей", 2]] },
        gen: { m: [["цього", 3]] },
      },
    },
  },
  pron: {
    я: {
      meta: { pos: "pron", pronType: "pers", syntax: "pron_pers" },
      cas: {
        nom: [["я", -1]],
        gen: [["мене", 4]],
      },
    },
  },
  verb: {
    читати: {
      meta: { pos: "verb", aspect: "impf" },
      inf: [["читати", 4]],
      conj: {
        pres: {
          1: { sg: [["читаю", 4]], pl: [["читаємо", 4]] },
          2: { sg: [["читаєш", 4]], pl: [["читаєте", 4]] },
          3: { sg: [["читає", 4]], pl: [["читають", 4]] },
        },
        past: {
          m: { sg: [["читав", 4]], pl: [["читали", 4]] },
          f: { sg: [["читала", 4]] },
          n: { sg: [["читало", 4]] },
        },
      },
    },
  },
  adv: { багато: { meta: { pos: "adv" }, base: [["багато", 4]] } },
  conj: { але: { meta: { pos: "conj" }, base: [["але", -1]] } },
  part: { не: { meta: { pos: "part" }, base: [["не", -1]] } },
  prep: { в: { meta: { pos: "prep" }, base: [["в", -1]] } },
  num: {
    один: {
      meta: { pos: "num", numType: "card" },
      cas: { nom: { m: [["один", 3]], f: [["одна", 4]] } },
    },
  },
};

// ─── parseDataInfo ──────────────────────────────────────────────────────────
describe("parseDataInfo", () => {
  it("parses a noun data-info", () => {
    expect(parseDataInfo("машина;pos=noun;case=acc;number=sg")).toEqual({
      lemma: "машина",
      pos: "noun",
      case: "acc",
      number: "sg",
    });
  });

  it("parses a verb infinitive", () => {
    expect(parseDataInfo("читати;pos=verb;verbForm=inf")).toEqual({
      lemma: "читати",
      pos: "verb",
      verbForm: "inf",
    });
  });

  it("parses a single-token string", () => {
    expect(parseDataInfo("mot")).toEqual({ lemma: "mot" });
  });
});

// ─── getDataFromJson ─────────────────────────────────────────────────────────
describe("getDataFromJson", () => {
  it("retrieves noun case form", () => {
    expect(getDataFromJson(mockWordData, "noun", ["слово", "case=gen", "number=sg"])).toEqual([
      ["слова", 3],
    ]);
  });

  it("retrieves adjective case/gender form", () => {
    expect(getDataFromJson(mockWordData, "adj", ["великий", "case=nom", "gender=m"])).toEqual([
      ["великий", 4],
    ]);
  });

  it("retrieves pron case form (no gender sublevel)", () => {
    expect(getDataFromJson(mockWordData, "pron", ["я", "case=gen"])).toEqual([["мене", 4]]);
  });

  it("retrieves verb infinitive", () => {
    expect(getDataFromJson(mockWordData, "verb", ["читати", "verbForm=inf"])).toEqual([
      ["читати", 4],
    ]);
  });

  it("retrieves verb conjugation present", () => {
    expect(
      getDataFromJson(mockWordData, "verb", ["читати", "tense=pres", "person=1", "number=sg"]),
    ).toEqual([["читаю", 4]]);
  });

  it("retrieves verb conjugation past", () => {
    expect(
      getDataFromJson(mockWordData, "verb", ["читати", "tense=past", "gender=m", "number=sg"]),
    ).toEqual([["читав", 4]]);
  });

  it("retrieves adverb base", () => {
    expect(getDataFromJson(mockWordData, "adv", ["багато"])).toEqual([["багато", 4]]);
  });

  it("retrieves conjunction base", () => {
    expect(getDataFromJson(mockWordData, "conj", ["але"])).toEqual([["але", -1]]);
  });

  it("retrieves particle base", () => {
    expect(getDataFromJson(mockWordData, "part", ["не"])).toEqual([["не", -1]]);
  });

  it("retrieves prep base", () => {
    expect(getDataFromJson(mockWordData, "prep", ["в"])).toEqual([["в", -1]]);
  });

  it("retrieves adj (dem) case/gender", () => {
    expect(getDataFromJson(mockWordData, "adj", ["цей", "case=gen", "gender=m"])).toEqual([
      ["цього", 3],
    ]);
  });

  it("retrieves num case/gender", () => {
    expect(getDataFromJson(mockWordData, "num", ["один", "case=nom", "gender=m"])).toEqual([
      ["один", 3],
    ]);
  });

  it("returns null for unknown pos", () => {
    expect(getDataFromJson(mockWordData, "unknown", ["x"])).toBeNull();
  });

  it("returns null for non-existent word", () => {
    expect(
      getDataFromJson(mockWordData, "noun", ["inexistant", "case=nom", "number=sg"]),
    ).toBeNull();
  });
});

// ─── getPrincipalForm ────────────────────────────────────────────────────────
describe("getPrincipalForm", () => {
  it("returns accented nominative singular for nouns", () => {
    const result = getPrincipalForm(mockWordData, "слово", "noun");
    expect(result).toContain('<span class="with-accent">о</span>');
  });

  it("returns accented nominative masculine for adjectives", () => {
    const result = getPrincipalForm(mockWordData, "великий", "adj");
    expect(result).toContain('<span class="with-accent">');
  });

  it("returns accented infinitive for verbs", () => {
    const result = getPrincipalForm(mockWordData, "читати", "verb");
    expect(result).toContain('<span class="with-accent">а</span>');
  });

  it("returns accented nominative for personal pronouns", () => {
    const result = getPrincipalForm(mockWordData, "я", "pron");
    expect(result).toBe("я");
  });

  it("falls back to raw word for unknown pos", () => {
    expect(getPrincipalForm(mockWordData, "xyz", "unknown")).toBe("xyz");
  });
});

// ─── getLemmaEntry ──────────────────────────────────────────────────────────
describe("getLemmaEntry", () => {
  it("returns nominative singular for nouns", () => {
    expect(getLemmaEntry(mockWordData, "noun", "слово")).toEqual([["слово", 3]]);
  });

  it("returns nominative masculine for adjectives", () => {
    expect(getLemmaEntry(mockWordData, "adj", "великий")).toEqual([["великий", 4]]);
  });

  it("returns nominative for personal pronouns", () => {
    expect(getLemmaEntry(mockWordData, "pron", "я")).toEqual([["я", -1]]);
  });

  it("returns infinitive for verbs", () => {
    expect(getLemmaEntry(mockWordData, "verb", "читати")).toEqual([["читати", 4]]);
  });

  it("returns base for adverbs", () => {
    expect(getLemmaEntry(mockWordData, "adv", "багато")).toEqual([["багато", 4]]);
  });

  it("returns base for conjunctions", () => {
    expect(getLemmaEntry(mockWordData, "conj", "але")).toEqual([["але", -1]]);
  });

  it("returns base for particles", () => {
    expect(getLemmaEntry(mockWordData, "part", "не")).toEqual([["не", -1]]);
  });

  it("returns base for prepositions", () => {
    expect(getLemmaEntry(mockWordData, "prep", "в")).toEqual([["в", -1]]);
  });

  it("returns nominative masculine for num", () => {
    expect(getLemmaEntry(mockWordData, "num", "один")).toEqual([["один", 3]]);
  });

  it("returns nominative masculine for adj (poss)", () => {
    expect(getLemmaEntry(mockWordData, "adj", "мій")).toEqual([["мій", 2]]);
  });

  it("returns nominative masculine for adj (dem)", () => {
    expect(getLemmaEntry(mockWordData, "adj", "цей")).toEqual([["цей", 2]]);
  });

  it("returns null for unknown pos", () => {
    expect(getLemmaEntry(mockWordData, "unknown", "x")).toBeNull();
  });

  it("returns null for non-existent word", () => {
    expect(getLemmaEntry(mockWordData, "noun", "inexistant")).toBeNull();
  });

  it("does not crash for null wordData", () => {
    expect(getLemmaEntry(null, "noun", "x")).toBeNull();
  });
});
