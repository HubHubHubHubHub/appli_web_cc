<script>
	import { accentEnabled } from '$lib/stores/uiStore.js';

	function toggle(e) {
		accentEnabled.set(e.target.checked);
	}
</script>

<div class="fixed bottom-5 right-5 bg-base-100/90 p-2.5 rounded-md shadow-floating z-floating flex items-center gap-2">
	<input type="checkbox" id="accent-check" class="toggle toggle-sm toggle-primary" checked={$accentEnabled} onchange={toggle} />
	<label for="accent-check" class="font-bold cursor-pointer">Accents</label>
</div>
