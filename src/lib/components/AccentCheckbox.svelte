<script>
  import { uiStore } from "$lib/stores/uiStore.svelte.js";

  function toggle(e) {
    uiStore.accentEnabled = e.target.checked;
  }
</script>

<div class="flex items-center gap-2">
  <input
    type="checkbox"
    id="accent-check"
    class="toggle toggle-sm toggle-primary"
    checked={uiStore.accentEnabled}
    onchange={toggle}
  />
  <label for="accent-check" class="font-bold cursor-pointer">Accents</label>
</div>
