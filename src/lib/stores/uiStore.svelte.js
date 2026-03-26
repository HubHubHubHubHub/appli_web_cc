let pinIdCounter = 0;
/** Génère un identifiant unique pour le pin d'un élément .ukr */
export function nextPinId() {
  return `pin-${++pinIdCounter}`;
}

const SCALE_STEPS = [0.85, 1, 1.15, 1.3];
const DEFAULT_SCALE_INDEX = 1; // scale = 1 (no change)

export const uiStore = createUIStore();

function createUIStore() {
  let pinnedElement = $state(null);
  let accentEnabled = $state(true);
  let selectedWord = $state(null);
  let selectedCategory = $state(null);
  let grammarTableData = $state(null);
  let fontSizeIndex = $state(DEFAULT_SCALE_INDEX);

  return {
    get pinnedElement() {
      return pinnedElement;
    },
    set pinnedElement(v) {
      pinnedElement = v;
    },

    get accentEnabled() {
      return accentEnabled;
    },
    set accentEnabled(v) {
      accentEnabled = v;
    },

    get selectedWord() {
      return selectedWord;
    },
    set selectedWord(v) {
      selectedWord = v;
    },

    get selectedCategory() {
      return selectedCategory;
    },
    set selectedCategory(v) {
      selectedCategory = v;
    },

    get grammarTableData() {
      return grammarTableData;
    },
    set grammarTableData(v) {
      grammarTableData = v;
    },

    get fontSizeIndex() {
      return fontSizeIndex;
    },
    get contentScale() {
      return SCALE_STEPS[fontSizeIndex];
    },
    get canIncrease() {
      return fontSizeIndex < SCALE_STEPS.length - 1;
    },
    get canDecrease() {
      return fontSizeIndex > 0;
    },
    increase() {
      if (this.canIncrease) fontSizeIndex++;
    },
    decrease() {
      if (this.canDecrease) fontSizeIndex--;
    },
  };
}
