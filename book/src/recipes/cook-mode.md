<div class="cook-mode-container">
<button type="button" class="cook-mode-btn" aria-live="polite">Activate Cook Mode</button>
<button type="button" class="share-ingredients-btn" aria-live="polite">Share Ingredients</button>
<span class="cook-mode-status" style="font-size: 0.9em; opacity: 0.85;"></span>
</div>

<script>
(function() {
	const scriptEl = document.currentScript;
	const prev = scriptEl ? scriptEl.previousElementSibling : null;
	const cookMode = (prev && prev.querySelector('.cook-mode-btn')) || document.getElementById('cookMode');
	const shareBtn = (prev && prev.querySelector('.share-ingredients-btn')) || document.getElementById('shareIngredients');
	const statusEl = (prev && prev.querySelector('.cook-mode-status')) || document.getElementById('cookModeStatus');

	if (!document.getElementById('cookMode') && cookMode) {
		cookMode.id = 'cookMode';
	}
	if (!document.getElementById('shareIngredients') && shareBtn) {
		shareBtn.id = 'shareIngredients';
	}
	if (!document.getElementById('cookModeStatus') && statusEl) {
		statusEl.id = 'cookModeStatus';
	}

	if (!document.getElementById('cookModePrintStyle')) {
		const style = document.createElement('style');
		style.id = 'cookModePrintStyle';
		style.textContent = `
			.cook-mode-container {
				display: flex;
				flex-wrap: wrap;
				align-items: center;
				gap: 8px;
				margin: 0.5em 0;
			}
			.cook-mode-btn,
			.share-ingredients-btn {
				padding: 6px 12px;
				border-radius: 4px;
				border: 1px solid var(--icons, #737480);
				background-color: var(--theme-popup-bg, var(--bg, #f7f7f7));
				color: var(--fg, inherit);
				font-size: 0.9em;
				font-weight: 600;
				cursor: pointer;
				transition: background-color 0.15s ease, border-color 0.15s ease;
			}
			.cook-mode-btn:hover:not(:disabled),
			.share-ingredients-btn:hover:not(:disabled) {
				background-color: var(--theme-hover, rgba(127, 127, 127, 0.15));
			}
			.cook-mode-btn.active,
			.share-ingredients-btn.active {
				border-color: var(--links, #2b79a2);
				background-color: var(--links, #2b79a2);
				color: var(--bg, #ffffff);
			}
			.cook-mode-btn:disabled,
			.share-ingredients-btn:disabled {
				opacity: 0.6;
				cursor: not-allowed;
			}
			@media print {
				.cook-mode-container, .cook-mode-btn, .share-ingredients-btn, .cook-mode-status {
					display: none !important;
				}
			}
		`;
		document.head.appendChild(style);
	}

	if (!window.location.href.includes("recipes")) {
		if (prev && prev.classList.contains('cook-mode-container')) prev.style.display = "none";
		if (cookMode) cookMode.style.display = "none";
		if (shareBtn) shareBtn.style.display = "none";
		if (statusEl) statusEl.style.display = "none";
		return;
	}

	const FRACTION_MAP = {
		'1/2': '½',
		'1/3': '⅓',
		'2/3': '⅔',
		'1/4': '¼',
		'3/4': '¾',
		'1/5': '⅕',
		'2/5': '⅖',
		'3/5': '⅗',
		'4/5': '⅘',
		'1/6': '⅙',
		'5/6': '⅚',
		'1/8': '⅛',
		'3/8': '⅜',
		'5/8': '⅝',
		'7/8': '⅞'
	};

	function formatFraction(num, den) {
		const key = `${num}/${den}`;
		return FRACTION_MAP[key] || key;
	}

	function convertTexToText(tex) {
		if (!tex) return '';
		let s = tex.trim();
		s = s.replace(/(\d+)\s*\\(?:d|t)?frac\s*\{\s*(\d+)\s*\}\s*\{\s*(\d+)\s*\}/g, (_, whole, num, den) => {
			const frac = formatFraction(num, den);
			return FRACTION_MAP[`${num}/${den}`] ? `${whole}${frac}` : `${whole} ${frac}`;
		});
		s = s.replace(/\\(?:d|t)?frac\s*\{\s*(\d+)\s*\}\s*\{\s*(\d+)\s*\}/g, (_, num, den) => {
			return formatFraction(num, den);
		});
		s = s.replace(/\\[,;:! ]/g, ' ').replace(/\\text\{([^}]*)\}/g, '$1');
		return s.trim();
	}

	function extractNodeText(node) {
		if (!node) return '';
		if (node.nodeType === Node.TEXT_NODE) {
			return node.nodeValue || '';
		}
		if (node.nodeType !== Node.ELEMENT_NODE) {
			return '';
		}
		const tag = node.tagName.toLowerCase();
		if (tag === 'ul' || tag === 'ol') {
			return '';
		}
		if (tag === 'br') {
			return ' ';
		}
		if (tag === 'script') {
			const type = (node.getAttribute('type') || '').toLowerCase();
			if (type.startsWith('math/tex')) {
				return convertTexToText(node.textContent);
			}
			return '';
		}
		if (
			node.classList.contains('MathJax') ||
			node.classList.contains('MathJax_Preview') ||
			node.classList.contains('MathJax_SVG') ||
			node.classList.contains('MathJax_CHTML') ||
			node.classList.contains('MathJax_Display') ||
			node.classList.contains('MJX_Assistive_MathML')
		) {
			return '';
		}
		if (tag === 'mjx-container') {
			const mml = node.querySelector('mjx-assistive-mml');
			if (mml) {
				const clone = mml.cloneNode(true);
				clone.querySelectorAll('mfrac').forEach((mfrac) => {
					const parts = mfrac.children;
					if (parts.length === 2) {
						const num = (parts[0].textContent || '').trim();
						const den = (parts[1].textContent || '').trim();
						mfrac.replaceWith(document.createTextNode(formatFraction(num, den)));
					}
				});
				return (clone.textContent || '').trim();
			}
			return '';
		}
		let out = '';
		for (const child of node.childNodes) {
			out += extractNodeText(child);
		}
		return out;
	}

	function cleanIngredientText(raw) {
		let s = raw.replace(/\\\(([\s\S]*?)\\\)/g, (_, tex) => convertTexToText(tex));
		s = s.replace(/\s+/g, ' ').trim();
		s = s.replace(/(\d+)\s+([¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])/g, '$1$2');
		return s;
	}

	function collectListItems(listEl, items) {
		for (const child of listEl.children) {
			if (child.tagName.toLowerCase() !== 'li') continue;
			const text = cleanIngredientText(extractNodeText(child));
			if (text) items.push(text);
			for (const sub of child.children) {
				const subTag = sub.tagName.toLowerCase();
				if (subTag === 'ul' || subTag === 'ol') {
					collectListItems(sub, items);
				}
			}
		}
	}

	function collectIngredientsFrom(startEl) {
		const items = [];
		let inIngredients = false;
		let el = startEl;
		while (el) {
			const tag = el.tagName.toLowerCase();
			if (tag === 'h1') break;
			if (tag === 'h2' || tag === 'h3') {
				const headingText = (el.textContent || '').trim();
				if (!inIngredients) {
					if (/ingredient/i.test(headingText)) {
						inIngredients = true;
					}
				} else if (tag === 'h2' && /\b(instructions?|directions?|method|steps?|preparation)\b/i.test(headingText)) {
					break;
				}
			} else if (inIngredients && (tag === 'ul' || tag === 'ol')) {
				collectListItems(el, items);
			}
			el = el.nextElementSibling;
		}
		return items;
	}

	function getRecipeTitle() {
		let el = prev ? prev.previousElementSibling : null;
		while (el) {
			if (el.tagName.toLowerCase() === 'h1') {
				const title = (el.textContent || '').trim();
				if (title) return title;
			}
			el = el.previousElementSibling;
		}
		const mainH1 = document.querySelector('main h1');
		if (mainH1 && mainH1.textContent.trim()) {
			return mainH1.textContent.trim();
		}
		return document.title.replace(/\s*-\s*Matt Cofer\s*$/, '').trim() || 'Ingredients';
	}

	function getIngredientsList() {
		let items = prev ? collectIngredientsFrom(prev.nextElementSibling) : [];
		if (items.length === 0) {
			const root = (prev && prev.closest('main')) || document.querySelector('main') || document.body;
			if (root) {
				items = collectIngredientsFrom(root.firstElementChild);
			}
		}
		return items;
	}

	async function copyTextFallback(text) {
		if (navigator.clipboard && navigator.clipboard.writeText) {
			await navigator.clipboard.writeText(text);
			return;
		}
		const textarea = document.createElement('textarea');
		textarea.value = text;
		textarea.setAttribute('readonly', '');
		textarea.style.position = 'fixed';
		textarea.style.opacity = '0';
		document.body.appendChild(textarea);
		textarea.select();
		document.execCommand('copy');
		document.body.removeChild(textarea);
	}

	let shareFeedbackTimer = null;
	function flashShareButton(label, highlight) {
		if (!shareBtn) return;
		if (shareFeedbackTimer) clearTimeout(shareFeedbackTimer);
		shareBtn.textContent = label;
		shareBtn.classList.toggle('active', Boolean(highlight));
		shareFeedbackTimer = setTimeout(() => {
			shareBtn.textContent = 'Share Ingredients';
			shareBtn.classList.remove('active');
			shareFeedbackTimer = null;
		}, 2000);
	}

	async function shareIngredients() {
		const items = getIngredientsList();
		if (items.length === 0) {
			flashShareButton('No Ingredients Found', false);
			return;
		}
		const title = getRecipeTitle();
		const text = items.join('\n');

		if (navigator.share) {
			try {
				await navigator.share({ title, text });
				return;
			} catch (err) {
				if (err && err.name === 'AbortError') {
					return;
				}
				console.error(`Web Share failed: ${err.name}, ${err.message}`);
			}
		}

		try {
			await copyTextFallback(text);
			flashShareButton('Copied Ingredients!', true);
		} catch (err) {
			console.error(`Clipboard copy failed: ${err.name}, ${err.message}`);
			flashShareButton('Share Failed', false);
		}
	}

	if (shareBtn) {
		shareBtn.addEventListener('click', shareIngredients);
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
