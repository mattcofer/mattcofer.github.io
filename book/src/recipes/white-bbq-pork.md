# White BBQ Pork

This is more a recipe for sauce and seasoning.  It doesn't really matter if you use a pork loin or chops.  The original recipe is for making sandwiches.
<https://www.foodnetwork.com/recipes/giada-de-laurentiis/pork-sandwiches-with-white-barbecue-sauce-recipe-2053064>

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

## Ingredients
* Pork loin, chops, it doesn't matter

## Seasoning
* 2 Teaspoons chili powder
* 2 Teaspoons dried oregano
* 1 Teaspoon celery seed
* 1 Teaspoon paprika
* 1 Teaspoon thyme

## Sauce
* \\( \frac{1}{2} \\) cup Duke's Mayo
* 2 Tablespoons fresh lemon juice
* 2 Tablespoons Apple Cider Vinegar
* \\( \frac{1}{2} \\) Teaspoon kosher salt
* \\( \frac{1}{4} \\) Teaspoon ground black pepper

## Instructions
* Season meat ahead of time, apply sauce while grilling pork