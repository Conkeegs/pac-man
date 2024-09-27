"use strict";

import DebugWindow from "../debugwindow/DebugWindow.js";
import { BOARD_OBJECT_Z_INDEX, ORIGINAL_TILE_SIZE, TILESIZE } from "./Globals.js";

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
		/**
		 * Removes all children from this element.
		 */
		removeAllChildren(): void;
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

	interface String {
		/**
		 * Mutates this string by reversing its characters and returns it.
		 */
		reverse(): string;
	}

	interface ObjectConstructor {
		/**
		 * Mutates an object by removing all of its keys.
		 */
		removeAllKeys(object: any): void;
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

HTMLElement.prototype.removeAllChildren = function (): void {
	while (this.firstChild) {
		this.firstChild.remove();
	}
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

String.prototype.reverse = function (): string {
	return this.split("").reverse().join("");
};

Object.removeAllKeys = function (object: any): void {
	Object.keys(object).forEach((key) => delete object[key as keyof Object]);
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
	return value !== null && defined(value);
}

/**
 * Determines if a variable's value is `undefined` or not.
 *
 * @param value any valid JavaScript type
 * @returns boolean indicating whether `value` is `undefined`
 */
export function defined(value: unknown): value is "undefined" {
	return typeof value !== "undefined";
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

	throw new Error(...any);
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

/**
 * Creates a path to the images directory, given an image's name.
 *
 * @param name the image's file name
 * @param extension the extension of the image (default: `.png`)
 * @returns a relative path to the image file
 */
export function getImageSrc(name: string, extension: string = "png"): string {
	return `src/assets/images/${name}.${extension}`;
}

/**
 * Creates a path to the json directory, given a json file's name.
 *
 * @param name the json file's name
 * @returns a relative path to the json file
 */
export function getJsonSrc(name: string): string {
	return `src/assets/json/${name}.json`;
}

/**
 * Creates a path to the audio directory, given an audio file's name.
 *
 * @param name the audio file's file name
 * @param extension the extension of the audio file (default: `.mp3`)
 * @returns a relative path to the audio file
 */
export function getAudioSrc(name: string, extension: string = "mp3"): string {
	return `src/assets/audio/${name}.${extension}`;
}

/**
 * Gets a random integer between 0 and `max`.
 *
 * @param max the max integer that can be returned
 * @returns a random number between 0 and `max` (inclusive)
 */
export function getRandomInt(max: number): number {
	return Math.floor(Math.random() * (max + 1));
}

/**
 * Inserts an easily-visible square onto the board at a specified position. Useful for debugging.
 *
 * @param x the horizontal position of the square
 * @param y the vertical position of the square
 */
export function insertDivAtPosition(x: number, y: number): void {
	get("board")!.appendChild(
		create({
			name: "div",
			classes: ["position-div"],
		}).css({
			position: "absolute",
			left: px(x),
			top: px(y),
			zIndex: BOARD_OBJECT_Z_INDEX + 1,
			backgroundColor: "purple",
			height: px(10),
			width: px(10),
		}) as HTMLElement
	);
}

/**
 * Converts a given speed into a speed that will visually match the original arcade game, since
 * we're running on a higher pixel count.
 *
 * @param speed a given (pixels-per-second) speed from the original arcade game
 * @returns
 */
export function originalPacManSpeedToNewSpeed(speed: number): number {
	// TILESIZE will always be a multiple of 8 (the original game's tile size)
	return speed * (TILESIZE / ORIGINAL_TILE_SIZE);
}

/**
 * Generates an _almost_ random string. Good enough for creating unique `BoardObject` names.
 *
 * @returns
 */
export function uniqueId(): string {
	const dateString = Date.now().toString(36);
	const randomness = Math.random().toString(36).substr(2);

	return dateString + randomness;
}

/**
 * Pluralizes `word` based on `count`;
 *
 * @param word the word to pluralize (or not)
 * @param count the number to base the pluralization on
 */
export function pluralize(word: string, count: number): string {
	if (count === 0 || count > 1) {
		return `${word}s`;
	}

	return word;
}

/**
 * Determines if an array or object is empty. Arrays are considered empty when they have
 * a `length` of `0`, and object when they do not have keys.
 *
 * @export
 * @param value any valid JavaScript value
 * @returns boolean if `value` is empty or not
 */
export function empty(value: object | unknown[]): boolean {
	if (isObject(value)) {
		return Object.keys(value as Object).length === 0;
	}

	return (value as unknown[]).length === 0;
}
