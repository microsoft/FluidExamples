/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Additional iOS Safari polyfills for better compatibility
 */

// Polyfill for ResizeObserver if not available (older iOS)
if (typeof ResizeObserver === "undefined") {
	// Simple fallback that uses window resize events
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(window as any).ResizeObserver = class {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		constructor(callback: (entries: any[]) => void) {
			this.callback = callback;
			this.elements = new Set();
		}

		observe(element: Element) {
			this.elements.add(element);
			if (this.elements.size === 1) {
				window.addEventListener("resize", this.handleResize);
			}
		}

		unobserve(element: Element) {
			this.elements.delete(element);
			if (this.elements.size === 0) {
				window.removeEventListener("resize", this.handleResize);
			}
		}

		disconnect() {
			this.elements.clear();
			window.removeEventListener("resize", this.handleResize);
		}

		private handleResize = () => {
			const entries = Array.from(this.elements).map((element) => ({
				target: element,
				contentRect: element.getBoundingClientRect(),
			}));
			this.callback(entries);
		};

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		private callback: (entries: any[]) => void;
		private elements: Set<Element>;
	};
}

// Improve touch events on iOS Safari
if (typeof window !== "undefined" && "ontouchstart" in window) {
	// Prevent iOS Safari from pausing JavaScript execution during scroll
	document.addEventListener("touchstart", () => {}, { passive: true });
	document.addEventListener("touchmove", () => {}, { passive: true });
}

export {};
