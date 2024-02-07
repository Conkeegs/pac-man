"use strict";

import DebugWindow from "../../debugwindow/DebugWindow.js";
import { BOARDOBJECTS } from "../../utils/Globals.js";
import { create } from "../../utils/Utils.js";

/**
 * Represents a board object's horizontal and vertical offsets on the board.
 */
export type Position = {
	left: number;
	top: number;
};

/**
 * Represents characters/small, generally tile-sized objects on the board.
 */
export class BoardObject {
	/**
	 * The HTML elements that contains this board object.
	 */
	private element: HTMLElement;

	/**
	 * The board objects's unique name and HTML id.
	 */
	protected name: string | undefined;
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
	protected position: Position | undefined;

	/**
	 * Creates a board object.
	 *
	 * @param name the name/HTML id of the board object
	 */
	constructor(name: string) {
		if (!name) {
			DebugWindow.error("BoardObject.js", "constructor", "BoardObject must have a name.");
		} else if (BOARDOBJECTS.includes(name)) {
			DebugWindow.error("BoardObject.js", "constructor", `A BoardObject with the name '${name}' already exists.`);
		}

		this.name = name;

		// keep track of this board object so we can clean it up later, if needed
		BOARDOBJECTS.push(name);

		this.element = create({ name: "div", id: name, classes: ["game-object", "board-object"] });
	}

	/**
	 * Saves this board object's position in memory.
	 *
	 * @param position the new position of the board object
	 */
	public setPosition(position: Position): void {
		this.position = position;
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
}
