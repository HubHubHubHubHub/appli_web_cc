import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/svelte";
import GrammarTable from "$lib/components/GrammarTable.svelte";
import { dataStore } from "$lib/stores/dataStore.svelte.js";

const mockWordData = {
  noun: {
    дім: {
      meta: { pos: "noun", gender: "m" },
      cas: {
        nom: { sg: [["дім", 1]], pl: [["доми", 2]] },
        gen: { sg: [["дому", 2]], pl: [["домів", 3]] },
      },
    },
  },
  verb: {
    читати: {
      meta: { pos: "verb", aspect: "impf" },
      inf: [["читати", 3]],
      conj: {
        pres: {
          1: { sg: [["читаю", 3]], pl: [["читаємо", 4]] },
          2: { sg: [["читаєш", 3]], pl: [["читаєте", 4]] },
          3: { sg: [["читає", 3]], pl: [["читають", 3]] },
        },
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
      },
    },
  },
  pron: {
    Київ: {
      meta: { pos: "pron" },
      cas: {
        nom: [["Київ", 2]],
        gen: [["Києва", 3]],
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
      props: { data: { word: "дім", category: "noun", infos: ["case=nom", "number=sg"] } },
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
      props: { data: { word: "великий", category: "adj", infos: ["case=nom", "gender=m"] } },
    });
    const table = container.querySelector("table");
    expect(table).toBeTruthy();
  });

  it("rend un tableau de pronom", () => {
    const { container } = render(GrammarTable, {
      props: { data: { word: "Київ", category: "pron", infos: ["case=gen"] } },
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
      props: { data: { word: "inconnu", category: "noun", infos: ["case=nom", "number=sg"] } },
    });
    expect(container.querySelector("table")).toBeNull();
  });
});
