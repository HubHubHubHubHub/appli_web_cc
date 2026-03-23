import { describe, it, expect, beforeEach } from "vitest";
import { Utils } from "../scripts/utils.js";
import { dataManager } from "../scripts/dataManager.js";

// Mock data that mirrors the real data.json structure
const mockWordData = {
  nom: {
    "слово": {
      genre: "n",
      cas: {
        nomi: { s: ["слово", 3], pl: ["слова", 3] },
        gen:  { s: ["слова", 3], pl: ["слів", 2] },
      },
      base_html: '<span class="ukr" data-info="слово;nom;cas;nomi;s">слово</span>',
    },
  },
  adj: {
    "великий": {
      cas: {
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
      },
    },
  },
  proper: {
    "я": {
      cas: {
        nomi: ["я", -1],
        gen: ["мене", 3],
      },
    },
  },
  verb: {
    "читати": {
      asp: "imperfectif",
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
    },
  },
  adv: {
    "багато": {
      base: ["багато", 3],
    },
  },
  conj: {
    "але": {
      base: ["але", -1],
    },
  },
  part: {
    "не": {
      base: ["не", -1],
    },
  },
  prep: {
    "в": {
      base: ["в", -1],
    },
  },
  card: {
    "один": {
      cas: {
        nomi: { m: ["один", 3], f: ["одна", 4] },
      },
    },
  },
  proposs: {
    "мій": {
      cas: {
        nomi: { m: ["мій", 2], f: ["моя", 3] },
      },
    },
  },
  pron: {
    "цей": {
      cas: {
        nomi: { m: ["цей", 2] },
        gen: { m: ["цього", 4] },
      },
    },
  },
};

beforeEach(() => {
  dataManager.wordData = mockWordData;
});

// ─── getDataFromJson ─────────────────────────────────────────────────────────
describe("Utils.getDataFromJson", () => {
  it("retrieves noun case form", () => {
    const result = Utils.getDataFromJson("nom", ["слово", "cas", "gen", "s"]);
    expect(result).toEqual(["слова", 3]);
  });

  it("retrieves adjective case/gender form", () => {
    const result = Utils.getDataFromJson("adj", ["великий", "cas", "nomi", "m"]);
    expect(result).toEqual(["великий", 5]);
  });

  it("retrieves proper pronoun case form", () => {
    const result = Utils.getDataFromJson("proper", ["я", "cas", "gen"]);
    expect(result).toEqual(["мене", 3]);
  });

  it("retrieves verb infinitive", () => {
    const result = Utils.getDataFromJson("verb", ["читати", "inf"]);
    expect(result).toEqual(["читати", 3]);
  });

  it("retrieves verb conjugation", () => {
    const result = Utils.getDataFromJson("verb", ["читати", "conj", "pres", "1p", "s"]);
    expect(result).toEqual(["читаю", 4]);
  });

  it("retrieves adverb base", () => {
    const result = Utils.getDataFromJson("adv", ["багато", "base"]);
    expect(result).toEqual(["багато", 3]);
  });

  it("retrieves conjunction base", () => {
    const result = Utils.getDataFromJson("conj", ["але", "base"]);
    expect(result).toEqual(["але", -1]);
  });

  it("retrieves particle base", () => {
    const result = Utils.getDataFromJson("part", ["не", "base"]);
    expect(result).toEqual(["не", -1]);
  });

  it("retrieves prep base", () => {
    const result = Utils.getDataFromJson("prep", ["в", "base"]);
    expect(result).toEqual(["в", -1]);
  });

  it("retrieves pron case/gender", () => {
    const result = Utils.getDataFromJson("pron", ["цей", "cas", "gen", "m"]);
    expect(result).toEqual(["цього", 4]);
  });

  it("retrieves card case/gender", () => {
    const result = Utils.getDataFromJson("card", ["один", "cas", "nomi", "m"]);
    expect(result).toEqual(["один", 3]);
  });

  it("retrieves proposs case/gender", () => {
    const result = Utils.getDataFromJson("proposs", ["мій", "cas", "nomi", "f"]);
    expect(result).toEqual(["моя", 3]);
  });

  it("returns null for unknown category", () => {
    expect(Utils.getDataFromJson("unknown", ["x"])).toBeNull();
  });

  it("returns null for non-existent word", () => {
    expect(Utils.getDataFromJson("nom", ["inexistant", "cas", "nomi", "s"])).toBeNull();
  });
});

// ─── getPrincipalForm ────────────────────────────────────────────────────────
describe("Utils.getPrincipalForm", () => {
  const accent = "\u0301";

  it("returns accented nominative singular for nouns", () => {
    const result = Utils.getPrincipalForm("слово", "nom");
    expect(result).toBe("сло" + accent + "во");
  });

  it("returns accented nominative masculine for adjectives", () => {
    const result = Utils.getPrincipalForm("великий", "adj");
    expect(result).toContain(accent);
  });

  it("returns accented infinitive for verbs", () => {
    const result = Utils.getPrincipalForm("читати", "verb");
    // position 3 → accent on 3rd char "т"
    expect(result).toBe("чит" + accent + "ати");
  });

  it("returns accented nominative for proper pronouns", () => {
    const result = Utils.getPrincipalForm("я", "proper");
    // position is -1, so no accent inserted
    expect(result).toBe("я");
  });

  it("falls back to raw word for unknown category", () => {
    expect(Utils.getPrincipalForm("xyz", "unknown")).toBe("xyz");
  });
});

// ─── buildHeaderLine ─────────────────────────────────────────────────────────
describe("Utils.buildHeaderLine", () => {
  it("returns HTML with lemma and category label for a noun", () => {
    const html = Utils.buildHeaderLine("слово", "nom");
    expect(html).toContain("nom");
    expect(html).toContain("n"); // genre
    expect(html).toContain("lemma-head");
  });

  it("returns HTML with aspect info for a verb", () => {
    const html = Utils.buildHeaderLine("читати", "verb");
    expect(html).toContain("imperf.");
    expect(html).toContain("verbe");
  });
});
