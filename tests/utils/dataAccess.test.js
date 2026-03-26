import { describe, it, expect } from "vitest";
import {
  resolveEntry,
  getPrincipalForm,
  getLemmaEntry,
  parseDataInfo,
} from "../../src/lib/utils/dataAccess.js";
import { toPairs } from "../../src/lib/utils/parsing.js";
import { addAccent } from "../../src/lib/utils/accent.js";

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
        gen: [
          ["мене", 4],
          ["мене", 2],
        ],
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

// ─── parseDataInfo (10 tests) ───────────────────────────────────────────────
describe("parseDataInfo", () => {
  it("parses a noun", () => {
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

  it("parses a verb conjugated present", () => {
    expect(parseDataInfo("читати;pos=verb;verbForm=fin;tense=pres;person=3;number=pl")).toEqual({
      lemma: "читати",
      pos: "verb",
      verbForm: "fin",
      tense: "pres",
      person: "3",
      number: "pl",
    });
  });

  it("parses a verb past tense", () => {
    expect(parseDataInfo("купити;pos=verb;verbForm=fin;tense=past;gender=f;number=sg")).toEqual({
      lemma: "купити",
      pos: "verb",
      verbForm: "fin",
      tense: "past",
      gender: "f",
      number: "sg",
    });
  });

  it("parses a personal pronoun", () => {
    expect(parseDataInfo("я;pos=pron;pronType=pers;case=dat")).toEqual({
      lemma: "я",
      pos: "pron",
      pronType: "pers",
      case: "dat",
    });
  });

  it("parses a possessive adjective", () => {
    expect(parseDataInfo("мій;pos=adj;adjType=poss;case=nom;gender=m;number=sg")).toEqual({
      lemma: "мій",
      pos: "adj",
      adjType: "poss",
      case: "nom",
      gender: "m",
      number: "sg",
    });
  });

  it("parses an invariable (preposition)", () => {
    expect(parseDataInfo("у;pos=prep")).toEqual({ lemma: "у", pos: "prep" });
  });

  it("parses a numeral", () => {
    expect(parseDataInfo("два;pos=num;numType=card;case=nom;gender=m")).toEqual({
      lemma: "два",
      pos: "num",
      numType: "card",
      case: "nom",
      gender: "m",
    });
  });

  it("parses a variant", () => {
    expect(parseDataInfo("мене;pos=pron;pronType=pers;case=dat;var=1")).toEqual({
      lemma: "мене",
      pos: "pron",
      pronType: "pers",
      case: "dat",
      var: "1",
    });
  });

  it("handles a single token (lemma only)", () => {
    expect(parseDataInfo("mot")).toEqual({ lemma: "mot" });
  });
});

// ─── resolveEntry (5 tests) ─────────────────────────────────────────────────
describe("resolveEntry", () => {
  it("noun: cas > case > number", () => {
    expect(
      resolveEntry(mockWordData, { pos: "noun", lemma: "слово", case: "gen", number: "sg" }),
    ).toEqual([["слова", 3]]);
  });

  it("adj (poss): cas > case > gender", () => {
    expect(
      resolveEntry(mockWordData, { pos: "adj", lemma: "мій", case: "nom", gender: "m" }),
    ).toEqual([["мій", 2]]);
  });

  it("pron: cas > case (no gender sublevel)", () => {
    expect(resolveEntry(mockWordData, { pos: "pron", lemma: "я", case: "gen" })).toEqual([
      ["мене", 4],
      ["мене", 2],
    ]);
  });

  it("verb present: conj > tense > person > number", () => {
    expect(
      resolveEntry(mockWordData, {
        pos: "verb",
        lemma: "читати",
        verbForm: "fin",
        tense: "pres",
        person: "3",
        number: "pl",
      }),
    ).toEqual([["читають", 4]]);
  });

  it("verb past: conj > past > gender > number", () => {
    expect(
      resolveEntry(mockWordData, {
        pos: "verb",
        lemma: "читати",
        verbForm: "fin",
        tense: "past",
        gender: "f",
        number: "sg",
      }),
    ).toEqual([["читала", 4]]);
  });

  it("verb infinitive", () => {
    expect(resolveEntry(mockWordData, { pos: "verb", lemma: "читати", verbForm: "inf" })).toEqual([
      ["читати", 4],
    ]);
  });

  it("adverb base", () => {
    expect(resolveEntry(mockWordData, { pos: "adv", lemma: "багато" })).toEqual([["багато", 4]]);
  });

  it("returns null for unknown word", () => {
    expect(
      resolveEntry(mockWordData, { pos: "noun", lemma: "xyz", case: "nom", number: "sg" }),
    ).toBeNull();
  });

  it("returns null for unknown pos", () => {
    expect(resolveEntry(mockWordData, { pos: "unknown", lemma: "x" })).toBeNull();
  });

  it("adj pluriel: number=pl sans gender → fallback pl", () => {
    expect(
      resolveEntry(mockWordData, { pos: "adj", lemma: "великий", case: "nom", number: "pl" }),
    ).toEqual([["великі", 4]]);
  });

  it("adj sans gender ni number → fallback m", () => {
    expect(resolveEntry(mockWordData, { pos: "adj", lemma: "великий", case: "nom" })).toEqual([
      ["великий", 4],
    ]);
  });
});

// ─── Integration: data-info → MorphoTag → resolveEntry → accent ────────────
describe("V2 pipeline integration", () => {
  it("parses data-info, resolves entry, applies accent", () => {
    const raw = "слово;pos=noun;case=gen;number=sg";
    const tag = parseDataInfo(raw);
    const entry = resolveEntry(mockWordData, tag);
    const [text, pos] = toPairs(entry)[0];
    const accented = addAccent(text, pos);
    expect(accented).toBe("сло\u0301ва");
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

  it("returns nominative for personal pronouns", () => {
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

  it("returns base for prepositions", () => {
    expect(getLemmaEntry(mockWordData, "prep", "в")).toEqual([["в", -1]]);
  });

  it("returns nominative masculine for num", () => {
    expect(getLemmaEntry(mockWordData, "num", "один")).toEqual([["один", 3]]);
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
