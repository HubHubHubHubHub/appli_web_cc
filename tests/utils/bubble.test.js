import { describe, it, expect } from "vitest";
import { buildBubbleHTML, getHoverColor } from "../../src/lib/utils/bubble.js";

describe("getHoverColor", () => {
  it("returns color for matching case value in V2 format", () => {
    const color = getHoverColor(["балкон", "pos=noun", "case=gen", "number=sg"]);
    expect(color).not.toBe("inherit");
    expect(typeof color).toBe("string");
  });

  it("returns 'inherit' when no match", () => {
    expect(getHoverColor(["балкон", "pos=noun"])).toBe("inherit");
  });

  it("returns 'inherit' for nominative", () => {
    expect(getHoverColor(["x", "pos=noun", "case=nom"])).toBe("inherit");
  });
});

describe("buildBubbleHTML", () => {
  const wd = {
    noun: {
      балкон: {
        meta: { pos: "noun", gender: "m" },
        cas: {
          nom: { sg: [["балкон", 5]] },
        },
      },
    },
  };

  it("returns accented lemma with i18n labels", () => {
    const tokens = ["балкон", "pos=noun", "case=gen", "number=sg"];
    const html = buildBubbleHTML(wd, "балкон", "noun", tokens);
    expect(html).toContain("<strong>");
    expect(html).toContain("<em>");
  });

  it("returns labels only when wordData has no entry", () => {
    const tokens = ["xyz", "pos=noun"];
    const html = buildBubbleHTML({}, "xyz", "noun", tokens);
    expect(html).toContain("<em>");
  });

  it("inserts gender for nouns", () => {
    const tokens = ["балкон", "pos=noun", "case=gen", "number=sg"];
    const html = buildBubbleHTML(wd, "балкон", "noun", tokens);
    expect(html).toContain("m");
  });
});
