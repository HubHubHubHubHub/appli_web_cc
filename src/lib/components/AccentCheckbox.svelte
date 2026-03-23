<script>
	import { accentEnabled } from '$lib/stores/uiStore.js';

	function toggle(e) {
		accentEnabled.set(e.target.checked);
	}
</script>

<div class="fixed bottom-5 right-5 bg-white/90 p-2.5 rounded-md shadow-floating z-floating">
	<input type="checkbox" id="accent-check" checked={$accentEnabled} onchange={toggle} />
	<label for="accent-check" class="ml-1.5 font-bold">Accents</label>
</div>
