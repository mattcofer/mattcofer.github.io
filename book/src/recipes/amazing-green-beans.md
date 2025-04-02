# Amazing Green Beans - Pad Kra Pao
This was orginally inspired by the dish called Amazing Green Beans at Madam Mams in Austin, Texas.  Traditionally, it is called Pad Kra Pao.  There are a few variations found on the web.  Here are some.  This recipe is mostly based on the first one.
* <https://hot-thai-kitchen.com/holy-basil-stir-fry/>
* <https://hot-thai-kitchen.com/pad-kra-pao-beef/#recipe>
* <https://thewoksoflife.com/pad-kra-pao/#recipe>

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
* 5 Thai chilies diced
* 5 cloves of garlic minced
* \\( \frac{1}{2} \\) sliced onion
* \\( \frac{1}{2} \\) cup chopped green beans
* 1 \\( \frac{1}{2} \\) cup Thai basil roughly chopped
* 1 pound ground chicken

## Sauce
* 1 Tablespoon Oyster Sauce
* 1 Tablespoon Thin or Light Soy Sauce
* 2 Teaspoons Fish Sauce
* 1 1/2 Teaspoon Black Soy Sauce
* 2 Teaspoons Sugar
* 2 Tablespoons water

## Instructions
* Sauté garlic and chili
* Add chicken, cook and break apart until almost done
* Add sliced onions and chopped green beans, cook for a minute or two
* Add sauce, cook until desired tenderness
* Add roughly chopped Thai basil