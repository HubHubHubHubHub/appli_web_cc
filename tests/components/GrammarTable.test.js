import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/svelte";
import GrammarTable from "$lib/components/GrammarTable.svelte";
import { dataStore } from "$lib/stores/dataStore.svelte.js";

const mockWordData = {
  nom: {
    дім: {
      cas: {
        nomi: { s: ["дім", 1], pl: ["доми", 2] },
        gen: { s: ["дому", 2], pl: ["домів", 3] },
      },
    },
  },
  verb: {
    читати: {
      inf: ["читати", 3],
      conj: {
        pres: {
          "1p": { s: ["читаю", 3], pl: ["читаємо", 4] },
          "2p": { s: ["читаєш", 3], pl: ["читаєте", 4] },
          "3p": { s: ["читає", 3], pl: ["читають", 3] },
        },
      },
    },
  },
  adj: {
    великий: {
      cas: {
        nomi: { m: ["великий", 4], f: ["велика", 4], n: ["велике", 4], pl: ["великі", 4] },
      },
    },
  },
  proper: {
    Київ: {
      cas: {
        nomi: ["Київ", 2],
        gen: ["Києва", 3],
      },
    },
  },
};

beforeEach(() => {
  dataStore.wordData = mockWordData;
});

describe("GrammarTable", () => {
  it("rend un tableau de nom", () => {
    const { container } = render(GrammarTable, {
      props: { data: { word: "дім", category: "nom", infos: ["cas", "nomi", "s"] } },
    });
    const table = container.querySelector("table");
    expect(table).toBeTruthy();
    expect(table.querySelectorAll("tr").length).toBeGreaterThan(0);
  });

  it("rend un tableau de verbe", () => {
    const { container } = render(GrammarTable, {
      props: { data: { word: "читати", category: "verb", infos: [] } },
    });
    const table = container.querySelector("table");
    expect(table).toBeTruthy();
  });

  it("rend un tableau d'adjectif", () => {
    const { container } = render(GrammarTable, {
      props: { data: { word: "великий", category: "adj", infos: ["cas", "nomi", "m"] } },
    });
    const table = container.querySelector("table");
    expect(table).toBeTruthy();
  });

  it("rend un tableau de nom propre", () => {
    const { container } = render(GrammarTable, {
      props: { data: { word: "Київ", category: "proper", infos: ["cas", "gen"] } },
    });
    const table = container.querySelector("table");
    expect(table).toBeTruthy();
  });

  it("ne rend rien sans données", () => {
    const { container } = render(GrammarTable, {
      props: { data: null },
    });
    expect(container.querySelector("table")).toBeNull();
  });

  it("ne rend rien pour un mot inconnu", () => {
    const { container } = render(GrammarTable, {
      props: { data: { word: "inconnu", category: "nom", infos: ["cas", "nomi", "s"] } },
    });
    expect(container.querySelector("table")).toBeNull();
  });
});
