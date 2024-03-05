"use strict";

import DebugWindow from "../../debugwindow/DebugWindow.js";
import { BOARDOBJECTS } from "../../utils/Globals.js";
import { create, px } from "../../utils/Utils.js";

/**
 * Represents a board object's horizontal and vertical offsets on the board.
 */
export type Position = {
	x: number;
	y: number;
};

/**
 * Represents characters/small, generally tile-sized objects on the board.
 */
export class BoardObject {
	/**
	 * The HTML element that contains this board object.
	 */
	protected element: HTMLElement;

	/**
	 * The board objects's unique name and HTML id.
	 */
	protected readonly name: string | undefined;
	/**
	 * The board object's width in pixels.
	 */
	protected width: number | undefined;
	/**
	 * The board object's height in pixels.
	 */
	protected height: number | undefined;
	/**
	 * The board object's position on the board.
	 */
	private position: Position | undefined;

	/**
	 * Creates a board object.
	 *
	 * @param name the name/HTML id of the board object
	 */
	constructor(name: string) {
		if (!name) {
			DebugWindow.error("BoardObject.js", "constructor", "BoardObject must have a name.");
		} else if (BOARDOBJECTS.findIndex((gameObject) => gameObject.getName() === "name")) {
			DebugWindow.error("BoardObject.js", "constructor", `A BoardObject with the name '${name}' already exists.`);
		}

		this.name = name;

		// keep track of this board object so we can clean it up later, if needed
		BOARDOBJECTS.push(this);

		this.element = create({ name: "div", id: name, classes: ["board-object"] });
	}

	/**
	 * Gets this board object's position on the board.
	 *
	 * @returns the board objects `Position` or `undefined`
	 */
	public getPosition(): Position | undefined {
		return this.position;
	}

	/**
	 * Gets the HTML element that contains this board object.
	 *
	 * @returns the HTML element that contains this board object
	 */
	public getElement(): HTMLElement {
		return this.element;
	}

	/**
	 * Gets the board objects's unique name and HTML id.
	 *
	 * @returns the board objects's unique name and HTML id
	 */
	public getName() {
		return this.name;
	}

	/**
	 * Gets this board object's width in pixels.
	 *
	 * @returns board object's width in pixels
	 */
	public getWidth(): number | undefined {
		return this.width;
	}

	/**
	 * Gets this board object's width in pixels.
	 *
	 * @returns this board object's width in pixels
	 */
	public getHeight(): number | undefined {
		return this.height;
	}

	/**
	 * Sets this board object's position on the board and in memory.
	 *
	 * @param position the new position of the board object
	 * @param modifyCss whether or not to physically modify the board objects CSS `left` and `top` values
	 */
	public setPosition(position: Position, modifyCss = true): void {
		if (modifyCss) {
			this.element.css({
				left: px(position.x),
				top: px(position.y),
			});
		}

		this.position = position;
	}

	/**
	 * Sets this board object's `x` position on the board and in memory.
	 *
	 * @param x the new `x` position of the board object
	 * @param modifyCss whether or not to physically modify the board objects CSS `left` value
	 */
	public setPositionX(x: number, modifyCss = true): void {
		if (modifyCss) {
			this.element.css({
				left: px(x),
			});
		}

		this.position!.x = x;
	}

	/**
	 * Sets this board object's `y` position on the board and in memory.
	 *
	 * @param y the new `y` position of the board object
	 * @param modifyCss whether or not to physically modify the board objects CSS `top` value
	 */
	public setPositionY(y: number, modifyCss = true): void {
		if (modifyCss) {
			this.element.css({
				top: px(y),
			});
		}

		this.position!.y = y;
	}
}
