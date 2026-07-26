<button id="cookMode" type="button" aria-live="polite">Activate Cook Mode</button>
<span id="cookModeStatus" style="margin-left: 8px; font-size: 0.9em; opacity: 0.85;"></span>

<script>
(function() {
	const cookMode = document.getElementById('cookMode');
	const statusEl = document.getElementById('cookModeStatus');
	let wakeLock = null;
	let isCookModeActive = false;

	if (!window.location.href.includes("recipes")) {
		if (cookMode) cookMode.style.display = "none";
		if (statusEl) statusEl.style.display = "none";
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