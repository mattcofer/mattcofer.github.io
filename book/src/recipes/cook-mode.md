<div class="cook-mode-container" style="margin: 0.5em 0;">
	<button type="button" class="cook-mode-btn" aria-live="polite">Activate Cook Mode</button>
	<span class="cook-mode-status" style="margin-left: 8px; font-size: 0.9em; opacity: 0.85;"></span>
</div>
<script>
(function() {
	const scriptEl = document.currentScript;
	const container = scriptEl ? scriptEl.previousElementSibling : null;
	if (!container) return;

	const cookMode = container.querySelector('.cook-mode-btn');
	const statusEl = container.querySelector('.cook-mode-status');

	if (!document.getElementById('cookMode') && cookMode) {
		cookMode.id = 'cookMode';
	}
	if (!document.getElementById('cookModeStatus') && statusEl) {
		statusEl.id = 'cookModeStatus';
	}

	if (!document.getElementById('cookModePrintStyle')) {
		const style = document.createElement('style');
		style.id = 'cookModePrintStyle';
		style.textContent = '@media print { .cook-mode-container { display: none !important; } }';
		document.head.appendChild(style);
	}

	if (!window.location.href.includes("recipes")) {
		container.style.display = "none";
		return;
	}

	if (!('wakeLock' in navigator)) {
		if (cookMode) {
			cookMode.disabled = true;
			cookMode.textContent = 'Cook Mode Not Supported';
		}
		if (statusEl) statusEl.textContent = '(Screen Wake Lock API not supported in this browser)';
		return;
	}

	let wakeLock = null;
	let isCookModeActive = false;

	async function requestWakeLock() {
		try {
			wakeLock = await navigator.wakeLock.request('screen');
			isCookModeActive = true;
			updateUI(true);

			wakeLock.addEventListener('release', () => {
				wakeLock = null;
				if (document.visibilityState !== 'visible' && isCookModeActive) {
					updateStatus('Paused (tab in background)');
				} else if (!isCookModeActive) {
					updateUI(false);
				}
			});
		} catch (err) {
			console.error(`Wake Lock failed: ${err.name}, ${err.message}`);
			isCookModeActive = false;
			wakeLock = null;
			updateUI(false, `Failed: ${err.message}`);
		}
	}

	async function releaseWakeLock() {
		isCookModeActive = false;
		if (wakeLock) {
			try {
				await wakeLock.release();
			} catch (err) {
				console.error(`Wake Lock release failed: ${err.name}, ${err.message}`);
			}
			wakeLock = null;
		}
		updateUI(false);
	}

	async function toggleCookMode() {
		if (isCookModeActive) {
			await releaseWakeLock();
		} else {
			await requestWakeLock();
		}
	}

	function updateUI(active, errorMsg) {
		if (!cookMode) return;
		if (active) {
			cookMode.textContent = 'Deactivate Cook Mode';
			cookMode.classList.add('active');
			updateStatus('☀️ Screen will stay awake');
		} else {
			cookMode.textContent = 'Activate Cook Mode';
			cookMode.classList.remove('active');
			if (errorMsg) {
				updateStatus(`⚠️ ${errorMsg}`);
			} else {
				updateStatus('');
			}
		}
	}

	function updateStatus(msg) {
		if (statusEl) statusEl.textContent = msg;
	}

	document.addEventListener('visibilitychange', async () => {
		if (isCookModeActive && document.visibilityState === 'visible') {
			if (!wakeLock) {
				await requestWakeLock();
			}
		}
	});

	if (cookMode) {
		cookMode.addEventListener('click', toggleCookMode);
	}
})();
</script>
