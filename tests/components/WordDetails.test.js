import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/svelte";
import WordDetails from "$lib/components/WordDetails.svelte";
import { dataStore } from "$lib/stores/dataStore.svelte.js";
import { uiStore } from "$lib/stores/uiStore.svelte.js";

const mockWordData = {
  nom: {
    дім: {
      genre: "m",
      cas: {
        nomi: { s: ["дім", 1], pl: ["доми", 2] },
        gen: { s: ["дому", 2], pl: ["домів", 3] },
      },
    },
  },
  verb: {
    читати: {
      asp: "imperfectif",
      inf: ["читати", 3],
      conj: {
        pres: {
          "1p": { s: ["читаю", 3], pl: ["читаємо", 4] },
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
};

beforeEach(() => {
  dataStore.wordData = mockWordData;
  uiStore.selectedWord = null;
  uiStore.selectedCategory = null;
  uiStore.accentEnabled = false;
  uiStore.pinnedElement = null;
});

describe("WordDetails", () => {
  it("affiche le message par défaut sans sélection", () => {
    const { container } = render(WordDetails);
    expect(container.textContent).toContain("Sélectionnez un mot");
  });

  it("affiche un nom avec son genre", () => {
    uiStore.selectedWord = "дім";
    uiStore.selectedCategory = "nom";
    const { container } = render(WordDetails);
    expect(container.textContent).toContain("дім");
    expect(container.textContent).toContain("n.m.");
  });

  it("affiche un verbe avec son aspect", () => {
    uiStore.selectedWord = "читати";
    uiStore.selectedCategory = "verb";
    const { container } = render(WordDetails);
    expect(container.textContent).toContain("читати");
    expect(container.textContent).toContain("v. imp.");
  });

  it("affiche un adjectif", () => {
    uiStore.selectedWord = "великий";
    uiStore.selectedCategory = "adj";
    const { container } = render(WordDetails);
    expect(container.textContent).toContain("великий");
    expect(container.textContent).toContain("adj.");
  });

  it("affiche un message si le mot n'existe pas dans les données", () => {
    uiStore.selectedWord = "inconnu";
    uiStore.selectedCategory = "nom";
    const { container } = render(WordDetails);
    expect(container.textContent).toContain("Aucun détail disponible");
  });
});
