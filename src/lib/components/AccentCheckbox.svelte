<script>
	import { accentEnabled } from '$lib/stores/uiStore.js';

	function toggle(e) {
		accentEnabled.set(e.target.checked);
	}
</script>

<div class="floating-checkbox">
	<input type="checkbox" id="accent-check" checked={$accentEnabled} onchange={toggle} />
	<label for="accent-check">Accents</label>
</div>
