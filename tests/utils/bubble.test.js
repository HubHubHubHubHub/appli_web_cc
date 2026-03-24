import { describe, it, expect } from "vitest";
import { buildBubbleHTML, getHoverColor } from "../../src/lib/utils/bubble.js";

describe("getHoverColor", () => {
  it("returns color for matching case token", () => {
    const color = getHoverColor(["балкон", "nom", "cas", "gen", "s"]);
    expect(color).not.toBe("inherit");
    expect(typeof color).toBe("string");
  });

  it("returns 'inherit' when no match", () => {
    expect(getHoverColor(["балкон", "nom"])).toBe("inherit");
  });
});

describe("buildBubbleHTML", () => {
  const wd = {
    nom: {
      балкон: {
        genre: "m",
        cas: {
          nomi: { s: ["балкон", 5] },
        },
      },
    },
  };

  it("returns accented lemma with i18n labels", () => {
    const tokens = ["балкон", "nom", "cas", "gen", "s"];
    const html = buildBubbleHTML(wd, "балкон", "nom", tokens);
    expect(html).toContain("<strong>");
    expect(html).toContain("<em>");
  });

  it("returns empty string when wordData has no entry", () => {
    const tokens = ["xyz", "nom"];
    const html = buildBubbleHTML({}, "xyz", "nom", tokens);
    expect(html).toBe("<em>nom</em>");
  });

  it("inserts gender for nouns", () => {
    const tokens = ["балкон", "nom", "cas", "gen", "s"];
    const html = buildBubbleHTML(wd, "балкон", "nom", tokens);
    expect(html).toContain("m");
  });
});
