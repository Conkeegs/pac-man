"use strict";

import DebugWindow from "../debugwindow/DebugWindow";

declare global {
	interface HTMLElement {
		css(style: string | CSSStyleDeclaration | object): HTMLElement | string;
	}

	interface HTMLCollectionBase {
		css(style: CSSStyleDeclaration | object): boolean;
	}
}

HTMLElement.prototype.css = function (style: string | CSSStyleDeclaration | object): HTMLElement | string {
	if (isObject(style)) {
		for (let [key, value] of Object.entries(style)) {
			if (value !== null) {
				(this.style as any)[key] = value;
			}
		}

		return this;
	} else {
		return (this.style as any)[style as string];
	}
};

HTMLCollection.prototype.css = function (style: CSSStyleDeclaration | object): boolean {
	if (isObject(style)) {
		const length = this.length;

		for (let i = 0; i < length; i++) {
			const item = this[i];

			if (item instanceof HTMLElement) {
				item.css(style);
			} else {
				DebugWindow.error("Helpers.js", "css()", "Item in HTMLCollection not an instance of HTMLElement");
			}
		}

		return true;
	} else {
		return false;
	}
};

/**
 *
 *
 * @export
 * @param {string} filename
 * @return {any}
 */
export function fetchJSON(filename: string): Promise<any> {
	return fetch(filename)
		.then((response: Response): Promise<any> => {
			return response.json();
		})
		.then((body) => {
			if (!body) {
				throw new Error("JSON response body is empty.");
			} else {
				return body;
			}
		})
		.catch((error) => {
			DebugWindow.error("Helpers.js", "fetchJSON", `'${error.message}' while fetching data in ${filename}.`);
		});
}

/**
 *
 *
 * @export
 * @param {string} name
 * @param {(string | null)} [id=null]
 * @param {(string | null)} [classes=null]
 * @param {(string | null)} [html=null]
 * @return {HTMLElement}
 */
export function create(
	name: string,
	id: string | null = null,
	classes: string[] | null = null,
	html: string | null = null
) {
	let element = document.createElement(name);

	if (id) {
		element.id = id;
	}

	if (classes) {
		element.classList.add(...classes);
	}

	if (html) {
		element.innerHTML = html;
	}

	return element;
}

/**
 *
 *
 * @export
 * @param {string} selector
 * @return {(HTMLElement)}
 */
export function get(selector: string): HTMLElement | null {
	return document.getElementById(selector);
}

/**
 *
 *
 * @export
 * @param {string} selector
 * @return {HTMLCollection}
 */
export function getMany(selector: string): HTMLCollection {
	return document.getElementsByClassName(selector);
}

/**
 *
 *
 * @export
 * @param {(string | number | null)} pixels
 * @return {(string | number | null)}
 */
export function px(pixels: string | number | null): string | number | null {
	if (pixels !== null) {
		if (!(typeof pixels === "string")) {
			return pixels + "px";
		} else {
			const pixelsSliced: string = pixels.toString().slice(-2);

			if (pixelsSliced == "px") {
				return Number(pixels.substring(0, pixels.indexOf(pixelsSliced)));
			}
		}
	}

	return null;
}

/**
 *
 *
 * @export
 * @param {unknown} value
 * @return {boolean}
 */
export function isObject(value: unknown) {
	if (value instanceof Object && value !== null && !Array.isArray(value) && typeof value !== "function") {
		return true;
	} else {
		return false;
	}
}

/**
 *
 *
 * @export
 * @param {unknown} value
 * @param {unknown} def
 * @return {unknown}
 */
export function maybe(value: unknown, otherwise: unknown): unknown {
	if (typeof value !== "undefined" && value !== null) {
		return value;
	} else {
		return otherwise;
	}
}

/**
 *
 *
 * @export
 * @param {unknown} value
 * @return {boolean}
 */
export function exists(value: unknown): boolean {
	return value !== null && typeof value !== "undefined";
}

/**
 *
 *
 * @export
 * @param {unknown} any
 * @param {unknown} def
 * @return {unknown}
 */
export function truthy(any: unknown, def: unknown): unknown {
	if (any) {
		return any;
	} else {
		return def;
	}
}

/**
 *
 *
 * @export
 * @param {...any[]} any
 */
export function die(...any: any[]): void {
	console.log(...any);
	stop();
	throw new Error("Stopping...");
}
