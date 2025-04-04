<button id="cookMode" type="button">Activate Cook Mode</button>
<script>
	const cookMode = document.getElementById('cookMode');
	let wakeLock = null;

	async function toggleCookMode() {
		if (!wakeLock)
		{
			try
			{
				// Request Wake Lock
				wakeLock = await navigator.wakeLock.request('screen');
				cookMode.textContent = 'Deactivate Cook Mode';
			}
			catch (err)
			{
				console.error(`Wake Lock failed: ${err.name}, ${err.message}`);
			}
		}
		else
		{
			// Release Wake Lock
			wakeLock.release();
			wakeLock = null;
			cookMode.textContent = 'Activate Cook Mode';
		}
	}

	if (window.location.href.includes("recipes"))
	{
		cookMode.addEventListener('click', toggleCookMode);
	} 
	else
	{
		cookMode.style.display = "none";
	}
</script>