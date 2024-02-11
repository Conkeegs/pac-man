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
	private position: Position | undefined;

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
	 * Sets this board object's position on the board and in memory.
	 *
	 * @param position the new position of the board object
	 * @param modifyCss whether or not to physically animate the board object using CSS `translate()` function
	 */
	public setPosition(position: Position, modifyCss = true): void {
		if (modifyCss) {
			this.element.css({
				transform: `translate(${px(position.x)}, ${px(position.y)})`,
			});
		}

		this.position = position;
	}

	/**
	 * Sets this board object's `x` position on the board and in memory.
	 *
	 * @param position the new position of the board object
	 */
	public setPositionX(x: number): void {
		this.element.css({
			transform: `translate(${px(x)}, ${px(this.position!.y)})`,
		});

		this.position!.x = x;
	}

	/**
	 * Sets this board object's `y` position on the board and in memory.
	 *
	 * @param position the new position of the board object
	 */
	public setPositionY(y: number): void {
		this.element.css({
			transform: `translate(${px(this.position!.x)}, ${px(y)})`,
		});

		this.position!.y = y;
	}

	/**
	 * Gets this board object's position on the board.
	 *
	 * @param position the new position of the board object
	 * @param modifyCss
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
}
