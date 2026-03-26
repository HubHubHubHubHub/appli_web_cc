<script>
  import { uiStore, nextPinId } from "$lib/stores/uiStore.svelte.js";
  import { dataStore } from "$lib/stores/dataStore.svelte.js";
  import { firstPair } from "$lib/utils/parsing.js";
  import { parseDataInfo, resolveEntry } from "$lib/utils/dataAccess.js";
  import { highlightLetter } from "$lib/utils/accent.js";
  import {
    buildBubbleHTML,
    getHoverColor,
    getOrCreateBubble,
    positionBubble,
    hideBubble,
  } from "$lib/utils/bubble.js";

  let { dataInfo, text } = $props();

  let spanEl = $state(null);
  const pinId = nextPinId();

  const tag = $derived(parseDataInfo(dataInfo));
  const tokens = $derived(dataInfo.split(";"));
  const word = $derived(tag.lemma);
  const category = $derived(tag.pos || "");
  const hoverColor = $derived(getHoverColor(tokens));

  // Compute displayed text (with or without accent)
  const displayHTML = $derived.by(() => {
    if (!uiStore.accentEnabled) return text;

    const wd = dataStore.wordData;
    const variantIndex = tag.var ? parseInt(tag.var, 10) : 0;
    const entry = resolveEntry(wd, tag);

    if (entry) {
      const pair = firstPair(entry, variantIndex);
      if (pair && Number.isInteger(pair[1]) && pair[1] > 0) {
        const pos0 = pair[1] - 1;
        return highlightLetter(text, pos0, "accent");
      }
    }
    return text;
  });

  function buildGrammarData() {
    const infos = tokens.slice(1);
    return { word, category, infos };
  }

  function handleMouseEnter() {
    if (uiStore.pinnedElement) return;
    const wd = dataStore.wordData;
    const html = buildBubbleHTML(wd, word, category, tokens);
    if (html && html.trim()) {
      const bubble = getOrCreateBubble();
      bubble.innerHTML = html;
      bubble.style.display = "block";
      positionBubble(bubble, spanEl);
    }
    uiStore.grammarTableData = buildGrammarData();
  }

  function handleMouseLeave() {
    hideBubble();
    if (!uiStore.pinnedElement) {
      uiStore.grammarTableData = null;
    }
  }

  function handleKeydown(ev) {
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      handleClick(ev);
    }
  }

  function handleClick(ev) {
    ev.preventDefault();
    if (uiStore.pinnedElement === pinId) {
      uiStore.pinnedElement = null;
      uiStore.grammarTableData = null;
      return;
    }

    uiStore.grammarTableData = buildGrammarData();
    uiStore.pinnedElement = pinId;
  }
</script>

<span
  bind:this={spanEl}
  class="ukr"
  role="button"
  tabindex="0"
  data-info={dataInfo}
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
  onclick={handleClick}
  onkeydown={handleKeydown}
>
  {@html displayHTML}
</span>
