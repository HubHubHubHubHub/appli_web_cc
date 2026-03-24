import { parseInfo } from "./parsing.js";
import {
  buildBubbleHTML,
  getHoverColor,
  getOrCreateBubble,
  positionBubble,
  hideBubble,
} from "./bubble.js";
import { nextPinId } from "$lib/stores/uiStore.svelte.js";

/**
 * Attache les gestionnaires hover/click/keyboard sur les éléments `.ukr` d'un conteneur.
 * Gère le tooltip (bubble), la coloration au survol, et le pinning dans le sidebar grammaire.
 * @param {HTMLElement} el - Conteneur DOM
 * @param {object} deps - Dépendances réactives
 * @param {() => object} deps.getWordData - Getter pour wordData
 * @param {() => string|null} deps.getPinnedElement - Getter pour l'ID de l'élément pinné
 * @param {(val: string|null) => void} deps.setPinnedElement - Setter pour l'ID de l'élément pinné
 * @param {(val: object|null) => void} deps.setGrammarTableData - Setter pour les données de la table
 * @returns {Array<() => void>} Fonctions de nettoyage pour retirer les listeners
 */
export function applyHoverHandlers(el, deps) {
  const cleanups = [];
  const words = el.querySelectorAll(".ukr");

  words.forEach((word) => {
    const raw = word.getAttribute("data-info");
    if (!raw) return;

    word.setAttribute("role", "button");
    word.setAttribute("tabindex", "0");

    const pinId = nextPinId();
    const dataInfo = parseInfo(raw);
    const [w, category, ...infos] = dataInfo;
    const hoverColor = getHoverColor(dataInfo);

    function onMouseEnter() {
      if (deps.getPinnedElement()) return;
      word.style.color = hoverColor;

      const wd = deps.getWordData();
      deps.setGrammarTableData({ word: w, category, infos });

      const bubble = getOrCreateBubble();
      const bHTML = buildBubbleHTML(wd, w, category, dataInfo);
      if (bHTML && bHTML.trim()) {
        bubble.innerHTML = bHTML;
        bubble.style.display = "block";
        positionBubble(bubble, word);
      }
    }

    function onMouseLeave() {
      word.style.color = "";
      hideBubble();
      if (!deps.getPinnedElement()) {
        deps.setGrammarTableData(null);
      }
    }

    function onClick(ev) {
      ev.preventDefault();
      if (deps.getPinnedElement() === pinId) {
        deps.setPinnedElement(null);
        deps.setGrammarTableData(null);
        return;
      }
      deps.setGrammarTableData({ word: w, category, infos });
      deps.setPinnedElement(pinId);
    }

    function onKeydown(ev) {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        onClick(ev);
      }
    }

    word.addEventListener("mouseenter", onMouseEnter);
    word.addEventListener("mouseleave", onMouseLeave);
    word.addEventListener("click", onClick);
    word.addEventListener("keydown", onKeydown);

    cleanups.push(() => {
      word.removeEventListener("mouseenter", onMouseEnter);
      word.removeEventListener("mouseleave", onMouseLeave);
      word.removeEventListener("click", onClick);
      word.removeEventListener("keydown", onKeydown);
      word.removeAttribute("role");
      word.removeAttribute("tabindex");
    });
  });

  return cleanups;
}
