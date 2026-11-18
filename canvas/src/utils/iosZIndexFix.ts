// iOS Safari Z-Index Fix - Runtime JavaScript solution
// This script detects iOS Safari and applies fixes dynamically

function isIOSSafari() {
	const userAgent = navigator.userAgent;
	const isIOS = /iPad|iPhone|iPod/.test(userAgent);
	const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
	return isIOS && isSafari;
}

function fixIOSZIndexIssues() {
	if (!isIOSSafari()) return;

	// Function to apply fixes with retries
	function applyFixes() {
		// Fix toolbar z-index
		const toolbar = document.querySelector(".app-toolbar") as HTMLElement;
		if (toolbar) {
			toolbar.style.position = "relative";
			toolbar.style.zIndex = "99999";
			toolbar.style.isolation = "isolate";
			toolbar.style.transform = "translateZ(0)";
			toolbar.style.setProperty("-webkit-transform", "translateZ(0)");
			toolbar.style.backgroundColor = "white";
		}

		// Fix canvas SVG
		const canvasSvg = document.querySelector(".canvas-svg") as HTMLElement;
		if (canvasSvg) {
			canvasSvg.style.position = "relative";
			canvasSvg.style.zIndex = "100";
			canvasSvg.style.transform = "translateZ(0)";
			canvasSvg.style.setProperty("-webkit-transform", "translateZ(0)");
			canvasSvg.style.pointerEvents = "auto";
			canvasSvg.style.touchAction = "none";
		}

		// Fix items layer
		const itemsLayer = document.querySelector(".items-html-layer") as HTMLElement;
		if (itemsLayer) {
			itemsLayer.style.position = "relative";
			itemsLayer.style.zIndex = "50";
			itemsLayer.style.transform = "translateZ(0)";
			itemsLayer.style.setProperty("-webkit-transform", "translateZ(0)");
		}

		// Fix canvas container
		const canvasContainer = document.querySelector(".canvas-container") as HTMLElement;
		if (canvasContainer) {
			canvasContainer.style.position = "relative";
			canvasContainer.style.zIndex = "1";
			canvasContainer.style.isolation = "isolate";
		}

		// Fix SVG overlay groups specifically
		const overlayGroups = document.querySelectorAll(
			'[data-layer="selection-overlays"], [data-layer="presence-overlays"], [data-layer="comment-overlays"]'
		);
		overlayGroups.forEach((group) => {
			const htmlGroup = group as HTMLElement;
			htmlGroup.style.pointerEvents = "auto";
			htmlGroup.style.touchAction = "none";
			htmlGroup.style.setProperty("-webkit-touch-callout", "none");
			htmlGroup.style.setProperty("-webkit-user-select", "none");
		});

		// Force foreignObject to be below overlays
		const foreignObjects = document.querySelectorAll("foreignObject");
		foreignObjects.forEach((obj) => {
			const svgObj = obj as SVGForeignObjectElement;
			svgObj.style.zIndex = "-10";
			svgObj.style.position = "relative";
		});
	}

	// Apply fixes immediately
	applyFixes();

	// Apply fixes after DOM changes (for dynamic content)
	const observer = new MutationObserver(() => {
		applyFixes();
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ["class", "style"],
	});

	// Apply fixes on load and resize
	window.addEventListener("load", applyFixes);
	window.addEventListener("resize", applyFixes);

	// Apply fixes periodically as a fallback
	setInterval(applyFixes, 2000);
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", fixIOSZIndexIssues);
} else {
	fixIOSZIndexIssues();
}

export { fixIOSZIndexIssues };
