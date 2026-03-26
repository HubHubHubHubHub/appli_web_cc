import { describe, it, expect } from "vitest";
import {
  renderCell,
  generateTableNoun,
  generateTablePron,
  generateTableAdj,
  generateTableVerb,
} from "$lib/utils/tableGeneration.js";

describe("renderCell", () => {
  it("rend une paire V2 avec accent", () => {
    expect(renderCell([["балкон", 5]])).toContain('<span class="with-accent">о</span>');
  });

  it("retourne vide pour null", () => {
    expect(renderCell(null)).toBe("");
  });

  it("rend plusieurs variantes séparées par /", () => {
    const entry = [
      ["дім", 1],
      ["дому", 2],
    ];
    const result = renderCell(entry);
    expect(result).toContain("/");
  });
});

describe("generateTableNoun", () => {
  it("retourne table vide pour null", () => {
    expect(generateTableNoun(null, "nom", "sg")).toBe("<table></table>");
  });

  it("génère un tableau HTML avec les cas", () => {
    const casData = {
      nom: { sg: [["дім", 1]], pl: [["доми", 2]] },
      gen: { sg: [["дому", 2]], pl: [["домів", 3]] },
    };
    const html = generateTableNoun(casData, "nom", "sg");
    expect(html).toContain("<table>");
    expect(html).toContain("</table>");
    expect(html).toContain("nom.");
    expect(html).toContain("gen.");
    expect(html).toContain("<strong>");
  });

  it("met en gras uniquement le cas et nombre actifs", () => {
    const casData = {
      nom: { sg: [["дім", 1]], pl: [["доми", 2]] },
    };
    const html = generateTableNoun(casData, "nom", "sg");
    expect(html).toMatch(/<strong>.*<\/strong>/);
  });
});

describe("generateTablePron", () => {
  it("retourne table vide pour null", () => {
    expect(generateTablePron(null, "nom")).toBe("<table></table>");
  });

  it("met en gras le cas actif", () => {
    const casData = {
      nom: [["Київ", 2]],
      gen: [["Києва", 3]],
    };
    const html = generateTablePron(casData, "gen");
    expect(html).toContain("<strong>");
    expect(html).toContain("gen.");
  });
});

describe("generateTableAdj", () => {
  it("retourne table vide pour null", () => {
    expect(generateTableAdj(null, "nom", "m")).toBe("<table></table>");
  });

  it("omet le vocatif", () => {
    const casData = {
      nom: { m: [["великий", 4]] },
      voc: { m: [["великий", 4]] },
    };
    const html = generateTableAdj(casData, "nom", "m");
    expect(html).not.toContain("voc.");
  });
});

describe("generateTableVerb", () => {
  it("retourne table vide pour null", () => {
    expect(generateTableVerb(null, {})).toBe("<table></table>");
  });

  it("génère la section infinitif", () => {
    const verb = { meta: { pos: "verb" }, inf: [["читати", 3]], conj: {} };
    const html = generateTableVerb(verb, {});
    expect(html).toContain("inf.");
  });

  it("affiche le couple aspectuel", () => {
    const wd = {
      verb: {
        прочитати: { meta: { pos: "verb" }, inf: [["прочитати", 5]] },
      },
    };
    const verb = {
      meta: { pos: "verb", couple: "прочитати" },
      inf: [["читати", 3]],
      conj: {},
    };
    const html = generateTableVerb(verb, wd);
    expect(html).toContain("Couple aspectuel");
  });
});
