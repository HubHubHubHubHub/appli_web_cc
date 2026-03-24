import { describe, it, expect } from "vitest";
import { getDataFromJson, getPrincipalForm, getLemmaEntry } from "../../src/lib/utils/dataAccess.js";

const mockWordData = {
  nom: {
    "слово": {
      genre: "n",
      cas: {
        nomi: { s: ["слово", 3], pl: ["слова", 3] },
        gen: { s: ["слова", 3], pl: ["слів", 3] },
      },
    },
  },
  adj: {
    "великий": {
      cas: {
        nomi: {
          m: ["великий", 4],
          f: ["велика", 4],
          n: ["велике", 4],
          pl: ["великі", 4],
        },
        gen: {
          m: ["великого", 4],
          f: ["великої", 4],
          n: ["великого", 4],
          pl: ["великих", 4],
        },
      },
    },
  },
  proper: {
    "я": {
      cas: {
        nomi: ["я", -1],
        gen: ["мене", 4],
      },
    },
  },
  verb: {
    "читати": {
      asp: "imperfectif",
      inf: ["читати", 4],
      conj: {
        pres: {
          "1p": { s: ["читаю", 4], pl: ["читаємо", 4] },
          "2p": { s: ["читаєш", 4], pl: ["читаєте", 4] },
          "3p": { s: ["читає", 4], pl: ["читають", 4] },
        },
        pass: {
          m: { s: ["читав", 4], pl: ["читали", 4] },
          f: { s: ["читала", 4] },
          n: { s: ["читало", 4] },
        },
      },
      coupl: "",
    },
  },
  adv: { "багато": { base: ["багато", 4] } },
  conj: { "але": { base: ["але", -1] } },
  part: { "не": { base: ["не", -1] } },
  prep: { "в": { base: ["в", -1] } },
  card: { "один": { cas: { nomi: { m: ["один", 3], f: ["одна", 4] } } } },
  proposs: { "мій": { cas: { nomi: { m: ["мій", 2], f: ["моя", 3] } } } },
  pron: {
    "цей": {
      cas: {
        nomi: { m: ["цей", 2] },
        gen: { m: ["цього", 3] },
      },
    },
  },
};

// ─── getDataFromJson ─────────────────────────────────────────────────────────
describe("getDataFromJson", () => {
  it("retrieves noun case form", () => {
    expect(getDataFromJson(mockWordData, "nom", ["слово", "cas", "gen", "s"])).toEqual(["слова", 3]);
  });

  it("retrieves adjective case/gender form", () => {
    expect(getDataFromJson(mockWordData, "adj", ["великий", "cas", "nomi", "m"])).toEqual(["великий", 4]);
  });

  it("retrieves proper pronoun case form", () => {
    expect(getDataFromJson(mockWordData, "proper", ["я", "cas", "gen"])).toEqual(["мене", 4]);
  });

  it("retrieves verb infinitive", () => {
    expect(getDataFromJson(mockWordData, "verb", ["читати", "inf"])).toEqual(["читати", 4]);
  });

  it("retrieves verb conjugation", () => {
    expect(getDataFromJson(mockWordData, "verb", ["читати", "conj", "pres", "1p", "s"])).toEqual(["читаю", 4]);
  });

  it("retrieves adverb base", () => {
    expect(getDataFromJson(mockWordData, "adv", ["багато", "base"])).toEqual(["багато", 4]);
  });

  it("retrieves conjunction base", () => {
    expect(getDataFromJson(mockWordData, "conj", ["але", "base"])).toEqual(["але", -1]);
  });

  it("retrieves particle base", () => {
    expect(getDataFromJson(mockWordData, "part", ["не", "base"])).toEqual(["не", -1]);
  });

  it("retrieves prep base", () => {
    expect(getDataFromJson(mockWordData, "prep", ["в", "base"])).toEqual(["в", -1]);
  });

  it("retrieves pron case/gender", () => {
    expect(getDataFromJson(mockWordData, "pron", ["цей", "cas", "gen", "m"])).toEqual(["цього", 3]);
  });

  it("retrieves card case/gender", () => {
    expect(getDataFromJson(mockWordData, "card", ["один", "cas", "nomi", "m"])).toEqual(["один", 3]);
  });

  it("retrieves proposs case/gender", () => {
    expect(getDataFromJson(mockWordData, "proposs", ["мій", "cas", "nomi", "f"])).toEqual(["моя", 3]);
  });

  it("returns null for unknown category", () => {
    expect(getDataFromJson(mockWordData, "unknown", ["x"])).toBeNull();
  });

  it("returns null for non-existent word", () => {
    expect(getDataFromJson(mockWordData, "nom", ["inexistant", "cas", "nomi", "s"])).toBeNull();
  });
});

// ─── getPrincipalForm ────────────────────────────────────────────────────────
describe("getPrincipalForm", () => {
  const accent = "\u0301";

  it("returns accented nominative singular for nouns", () => {
    const result = getPrincipalForm(mockWordData, "слово", "nom");
    expect(result).toBe("сло" + accent + "во");
  });

  it("returns accented nominative masculine for adjectives", () => {
    const result = getPrincipalForm(mockWordData, "великий", "adj");
    expect(result).toContain(accent);
  });

  it("returns accented infinitive for verbs", () => {
    const result = getPrincipalForm(mockWordData, "читати", "verb");
    expect(result).toBe("чита" + accent + "ти");
  });

  it("returns accented nominative for proper pronouns", () => {
    const result = getPrincipalForm(mockWordData, "я", "proper");
    expect(result).toBe("я");
  });

  it("falls back to raw word for unknown category", () => {
    expect(getPrincipalForm(mockWordData, "xyz", "unknown")).toBe("xyz");
  });
});

// ─── getLemmaEntry ──────────────────────────────────────────────────────────
describe("getLemmaEntry", () => {
  it("returns nominative singular for nouns", () => {
    expect(getLemmaEntry(mockWordData, "nom", "слово")).toEqual(["слово", 3]);
  });

  it("returns nominative masculine for adjectives", () => {
    expect(getLemmaEntry(mockWordData, "adj", "великий")).toEqual(["великий", 4]);
  });

  it("returns nominative for proper pronouns", () => {
    expect(getLemmaEntry(mockWordData, "proper", "я")).toEqual(["я", -1]);
  });

  it("returns infinitive for verbs", () => {
    expect(getLemmaEntry(mockWordData, "verb", "читати")).toEqual(["читати", 4]);
  });

  it("returns base for adverbs", () => {
    expect(getLemmaEntry(mockWordData, "adv", "багато")).toEqual(["багато", 4]);
  });

  it("returns base for conjunctions", () => {
    expect(getLemmaEntry(mockWordData, "conj", "але")).toEqual(["але", -1]);
  });

  it("returns base for particles", () => {
    expect(getLemmaEntry(mockWordData, "part", "не")).toEqual(["не", -1]);
  });

  it("returns base for prepositions", () => {
    expect(getLemmaEntry(mockWordData, "prep", "в")).toEqual(["в", -1]);
  });

  it("returns nominative masculine for card", () => {
    expect(getLemmaEntry(mockWordData, "card", "один")).toEqual(["один", 3]);
  });

  it("returns nominative masculine for proposs", () => {
    expect(getLemmaEntry(mockWordData, "proposs", "мій")).toEqual(["мій", 2]);
  });

  it("returns nominative masculine for pron", () => {
    expect(getLemmaEntry(mockWordData, "pron", "цей")).toEqual(["цей", 2]);
  });

  it("returns null for unknown category", () => {
    expect(getLemmaEntry(mockWordData, "unknown", "x")).toBeNull();
  });

  it("returns undefined/null for non-existent word without crashing", () => {
    expect(getLemmaEntry(mockWordData, "nom", "inexistant")).toBeUndefined();
  });

  it("does not crash for null wordData", () => {
    expect(getLemmaEntry(null, "nom", "x")).toBeUndefined();
  });
});
