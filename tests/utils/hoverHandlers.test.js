import { describe, it, expect, beforeEach, vi } from "vitest";
import { applyHoverHandlers } from "$lib/utils/hoverHandlers.js";

const mockWordData = {
  noun: {
    дім: {
      meta: { pos: "noun", gender: "m" },
      cas: {
        nom: { sg: [["дім", 1]], pl: [] },
        gen: { sg: [["дому", 2]], pl: [] },
      },
    },
  },
};

function makeContainer(html) {
  const el = document.createElement("div");
  el.innerHTML = html;
  document.body.appendChild(el);
  return el;
}

function makeDeps(overrides = {}) {
  return {
    getWordData: () => mockWordData,
    getPinnedElement: () => null,
    setPinnedElement: vi.fn(),
    setGrammarTableData: vi.fn(),
    ...overrides,
  };
}

describe("applyHoverHandlers", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("attache role et tabindex sur les éléments .ukr avec data-info", () => {
    const el = makeContainer(
      '<span class="ukr" data-info="дім;pos=noun;case=nom;number=sg">дім</span>',
    );
    applyHoverHandlers(el, makeDeps());
    const span = el.querySelector(".ukr");
    expect(span.getAttribute("role")).toBe("button");
    expect(span.getAttribute("tabindex")).toBe("0");
  });

  it("ignore les éléments .ukr sans data-info", () => {
    const el = makeContainer('<span class="ukr">дім</span>');
    applyHoverHandlers(el, makeDeps());
    const span = el.querySelector(".ukr");
    expect(span.getAttribute("role")).toBeNull();
  });

  it("retourne des fonctions de cleanup", () => {
    const el = makeContainer(
      '<span class="ukr" data-info="дім;pos=noun;case=nom;number=sg">дім</span>',
    );
    const cleanups = applyHoverHandlers(el, makeDeps());
    expect(cleanups.length).toBe(1);
    expect(typeof cleanups[0]).toBe("function");
  });

  it("le cleanup retire role et tabindex", () => {
    const el = makeContainer(
      '<span class="ukr" data-info="дім;pos=noun;case=nom;number=sg">дім</span>',
    );
    const cleanups = applyHoverHandlers(el, makeDeps());
    cleanups[0]();
    const span = el.querySelector(".ukr");
    expect(span.getAttribute("role")).toBeNull();
    expect(span.getAttribute("tabindex")).toBeNull();
  });

  it("click toggle le pin", () => {
    const deps = makeDeps();
    const el = makeContainer(
      '<span class="ukr" data-info="дім;pos=noun;case=nom;number=sg">дім</span>',
    );
    applyHoverHandlers(el, deps);
    const span = el.querySelector(".ukr");

    span.click();
    expect(deps.setPinnedElement).toHaveBeenCalledOnce();
    expect(deps.setGrammarTableData).toHaveBeenCalledWith({
      lemma: "дім",
      pos: "noun",
      case: "nom",
      number: "sg",
    });
  });

  it("click sur élément déjà pinné dépinne", () => {
    let currentPinId = null;
    const deps = makeDeps({
      getPinnedElement: () => currentPinId,
      setPinnedElement: vi.fn((val) => {
        currentPinId = val;
      }),
    });
    const el = makeContainer(
      '<span class="ukr" data-info="дім;pos=noun;case=nom;number=sg">дім</span>',
    );
    applyHoverHandlers(el, deps);
    const span = el.querySelector(".ukr");

    // Premier click → pin
    span.click();
    expect(deps.setPinnedElement).toHaveBeenCalledTimes(1);
    const pinnedId = deps.setPinnedElement.mock.calls[0][0];
    expect(typeof pinnedId).toBe("string");

    // Deuxième click → dépin
    span.click();
    expect(deps.setPinnedElement).toHaveBeenCalledTimes(2);
    expect(deps.setPinnedElement).toHaveBeenLastCalledWith(null);
  });

  it("hover ne déclenche pas si un élément est pinné", () => {
    const deps = makeDeps({ getPinnedElement: () => "pin-99" });
    const el = makeContainer(
      '<span class="ukr" data-info="дім;pos=noun;case=nom;number=sg">дім</span>',
    );
    applyHoverHandlers(el, deps);
    const span = el.querySelector(".ukr");

    span.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    expect(deps.setGrammarTableData).not.toHaveBeenCalled();
  });

  it("keydown Enter déclenche le click", () => {
    const deps = makeDeps();
    const el = makeContainer(
      '<span class="ukr" data-info="дім;pos=noun;case=nom;number=sg">дім</span>',
    );
    applyHoverHandlers(el, deps);
    const span = el.querySelector(".ukr");

    span.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(deps.setPinnedElement).toHaveBeenCalledOnce();
  });
});
