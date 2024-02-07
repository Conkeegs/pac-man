"use strict";

import DebugWindow from "../debugwindow/DebugWindow.js";

declare global {
	interface HTMLElement {
		/**
		 * Takes a css style string or object who's keys are camel-cased css styles. If just a css style
		 * string is supplied, it will return the value of that style. If an object/CSSStyleDeclaration is
		 * supplied, it sets each style on the HTMLElement.
		 *
		 * @param style a css style camel-cased or an object who's keys are camel-cased css styles
		 * @returns `HTMLElement` if an object or CSSStyleDeclaration is supplied to allow for style-chaining.
		 * `string` (the css style's value) if a `string` is supplied. `undefined` if neither `object`, `CSSStyleDeclaration`,
		 * or `string` is supplied.
		 */
		css(style: string | CSSStyleDeclaration | object): HTMLElement | string | undefined;
	}

	interface HTMLCollectionBase {
		/**
		 * Takes an object who's keys are camel-cased css styles and sets each style on the given
		 * collection of HTMLElements.
		 *
		 * @param style an object who's keys are camel-cased css styles
		 * @returns `true` if an `object` or `CSSStyleDeclaration` if given. `false` otherwise.
		 */
		css(style: CSSStyleDeclaration | object): boolean;
	}
}

HTMLElement.prototype.css = function (style: string | CSSStyleDeclaration | object): HTMLElement | string | undefined {
	if (isObject(style) || style instanceof CSSStyleDeclaration) {
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
	if (isObject(style) || style instanceof CSSStyleDeclaration) {
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
 * Use JavaScrip's `fetch()` function API to read a `json` file and return an `object` or `Array` from it.
 *
 * @export
 * @param filename the `json` file
 * @returns a `Promise` of an `object` or `Array`, or `undefined` if there was an error reading the file.
 */
export async function fetchJSON(filename: string): Promise<any> {
	try {
		const body: Promise<any> = await (await fetch(filename)).json();

		if (!body) {
			DebugWindow.error("Utils.js", "fetchJSON", "JSON response body is empty");
		}

		return body;
	} catch (error: any) {
		DebugWindow.error("Utils.js", "fetchJSON", `'${error.message}' while fetching data in ${filename}.`);

		return;
	}
}

/**
 * Creates an `HTMLElement`.
 *
 * @export
 * @param data information about the `HTMLElement`
 * @returns the created `HTMLElement`
 */
export function create(data: { name: string; id?: string; classes?: string[]; html?: string }): HTMLElement {
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
 * Gets an `HTMLElement` from the DOM by id.
 *
 * @export
 * @param id the id of the `HTMLElement`
 * @returns the matching `HTMLElement`
 */
export function get(id: string): HTMLElement | null {
	return document.getElementById(id);
}

/**
 * Gets a collection of `HTMLElement`s by their class name.
 *
 * @export
 * @param selector the class name of the `HTMLElement`s
 * @returns `HTMLCollection` of matching `HTMLElement`s.
 */
export function getMany(className: string): HTMLCollection {
	return document.getElementsByClassName(className);
}

/**
 * If given a `string` formatted like `192px`, this will return the `number` value of it (`192`).
 * If given a `number` (like `200`), it will return a `string` formatted with `px` at the end of
 * it (like `200px`).
 *
 * @export
 * @param pixels the `string` or `number` value of an amount of pixels
 * @returns `string` formatted with `px` at the end of it if given a `number`. `number` if given a
 * `string` with `px` at the end of it. `undefined` if given a neither a `number` or `string`.
 */
export function px(pixels?: string | number): string | number | undefined {
	if (exists(pixels)) {
		if (typeof pixels === "number") {
			return pixels + "px";
		}

		if (typeof pixels === "string") {
			const pixelsSliced: string = pixels.toString().slice(-2);

			if (pixelsSliced == "px") {
				return Number(pixels.substring(0, pixels.indexOf(pixelsSliced)));
			}
		}
	}

	return undefined;
}

/**
 * Determines if a given value is a plain `object` type (like `{ key: 'value' }`)
 *
 * @export
 * @param value any valid JavaScript value
 * @returns `true` if the value is a plain `object`, `false` otherwise
 */
export function isObject(value: unknown) {
	if (value instanceof Object && exists(value) && !Array.isArray(value) && typeof value !== "function") {
		return true;
	} else {
		return false;
	}
}

/**
 * Shorthand ternary function.
 *
 * @export
 * @param value any valid JavaScript value
 * @param def any valid JavaScript value, and is returned if `value` doesn't exist
 * @returns `value` if it passes the `exists()` util function's check or `def` (default) otherwise.
 */
export function maybe(value: unknown, otherwise: unknown): unknown {
	if (exists(value)) {
		return value;
	} else {
		return otherwise;
	}
}

/**
 * Similar to `maybe()` util function except that instead of checking if the variable
 * is `null` or `undefined`, it will return `def` (default) only if `value` isn't truthy.
 *
 * @export
 * @param value any valid JavaScript value
 * @param def any valid JavaScript value, and is returned if `value` isn't truthy
 * @returns `value` if it's truthy, `def` otherwise.
 */
export function truthyOrDefault(value: unknown, def: unknown): unknown {
	if (value) {
		return value;
	} else {
		return def;
	}
}

/**
 * Determines if `value` is `null` or `undefined`.
 *
 * @export
 * @param value any valid JavaScript value
 * @returns `true` if `value` is not `null` or `undefined`, `false` otherwise
 */
export function exists(value: unknown): boolean {
	return value !== null && typeof value !== "undefined";
}

/**
 * Logs message(s) to the console, kills JavaScript load in the browser, and throws an error.
 * Mostly for testing purposes.
 *
 * @export
 * @param any any valid JavaScript value(s) to log to the console.
 */
export function die(...any: any[]): void {
	console.log(...any);

	stop();

	throw new Error("Stopping...");
}

/**
 * Turns milliseconds into seconds.
 *
 * @param milliseconds number of milliseconds to convert
 * @returns the `number` of seconds equivalent to `milliseconds`
 */
export function millisToSeconds(milliseconds: number): number {
	return milliseconds / 1000;
}

/**
 * Adds two numbers together.
 *
 * @param first any `number`
 * @param second any `number`
 * @returns `first` + `second`
 */
export function add(first: number, second: number) {
	return first + second;
}

/**
 * Subtracts `second` from `first`.
 *
 * @param first the `number` to be subtracted from
 * @param second the amount to subtract
 * @returns `first` - `second`
 */
export function subtract(first: number, second: number) {
	return first - second;
}
