"use strict";

import DebugWindow from "../debugwindow/DebugWindow.js";

declare global {
	interface HTMLElement {
		css(style: string | CSSStyleDeclaration | object): HTMLElement | string | undefined;
	}

	interface HTMLCollectionBase {
		css(style: CSSStyleDeclaration | object): boolean;
	}
}

HTMLElement.prototype.css = function (style: string | CSSStyleDeclaration | object): HTMLElement | string | undefined {
	if (isObject(style)) {
		for (let [key, value] of Object.entries(style)) {
			if (exists(value)) {
				(this.style as any)[key] = value;
			}
		}

		return this;
	}

	const typeOfStyle = typeof style;

	if (typeOfStyle == "string") {
		return (this.style as any)[style as string];
	}

	DebugWindow.error(
		"Utils.js",
		"css()",
		`HTMLElement.css() function not given an object or a string. Given '${typeOfStyle}'`
	);

	return;
};

HTMLCollection.prototype.css = function (style: CSSStyleDeclaration | object): boolean {
	if (isObject(style)) {
		const length = this.length;

		for (let i = 0; i < length; i++) {
			const item = this[i];

			if (item instanceof HTMLElement) {
				item.css(style);
			} else {
				DebugWindow.error("Utils.js", "css()", "Item in HTMLCollection not an instance of HTMLElement");
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
export async function fetchJSON(filename: string): Promise<any> {
	try {
		const body = await (await fetch(filename)).json();

		if (!body) {
			throw new Error("JSON response body is empty.");
		}

		return body;
	} catch (error: any) {
		DebugWindow.error("Utils.js", "fetchJSON", `'${error.message}' while fetching data in ${filename}.`);
	}
}

/**
 *
 *
 * @export
 * @param {{
 * name: string;
 * id?: string;
 * classes?: string[];
 * html?: string;
 * }} data
 * @return {HTMLElement}
 */
export function create(data: { name: string; id?: string; classes?: string[]; html?: string }) {
	let element = document.createElement(data.name);

	if (data.id) {
		element.id = data.id;
	}

	if (data.classes) {
		element.classList.add(...data.classes);
	}

	if (data.html) {
		element.innerHTML = data.html;
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
 * @param {(string | number | undefined)} pixels
 * @return {(string | number | undefined)}
 */
export function px(pixels?: string | number): string | number | undefined {
	if (typeof pixels !== "undefined") {
		if (!(typeof pixels === "string")) {
			return pixels + "px";
		} else {
			const pixelsSliced: string = pixels.toString().slice(-2);

			if (pixelsSliced == "px") {
				return Number(pixels.substring(0, pixels.indexOf(pixelsSliced)));
			}
		}
	}

	return undefined;
}

/**
 *
 *
 * @export
 * @param {unknown} value
 * @return {boolean}
 */
export function isObject(value: unknown) {
	if (value instanceof Object && exists(value) && !Array.isArray(value) && typeof value !== "function") {
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
	if (exists(value)) {
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
export function truthyOrDefault(any: unknown, def: unknown): unknown {
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

export function millisToSeconds(milliseconds: number) {
	return milliseconds / 1000;
}

export function add(first: number, second: number) {
	return first + second;
}

export function subtract(first: number, second: number) {
	return first - second;
}
