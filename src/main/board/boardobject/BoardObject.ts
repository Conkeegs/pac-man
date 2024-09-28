"use strict";

import DebugWindow from "../../debugwindow/DebugWindow.js";
import { BOARDOBJECTS, BOARD_OBJECT_Z_INDEX } from "../../utils/Globals.js";
import { create, px } from "../../utils/Utils.js";

/**
 * Represents a board object's horizontal and vertical offsets on the board.
 */
export type Position = {
	/**
	 * The x position of this board object (offset from left side of board).
	 */
	x: number;
	/**
	 * The y position of this board object (offset from top of board)
	 */
	y: number;
};

/**
 * Represents this board object's CSS `transform` `x` and `y` values.
 */
type Transform = {
	/**
	 * The board object's `translateX` value in pixels.
	 */
	x: number;
	/**
	 * The board object's `translateY` value in pixels.
	 */
	y: number;
};

/**
 * Represents characters/small, generally tile-sized objects on the board.
 */
export abstract class BoardObject {
	/**
	 * The HTML element that contains this board object.
	 */
	protected element: HTMLElement;

	/**
	 * The board objects's unique name and HTML id.
	 */
	protected readonly name: string;
	/**
	 * The board object's width in pixels.
	 */
	protected abstract readonly width: number | undefined;
	/**
	 * The board object's height in pixels.
	 */
	protected abstract readonly height: number | undefined;
	/**
	 * This board objet's CSS `transform` value, holding both its `translateX` and `translateY` values.
	 */
	protected transform: Transform = {
		x: 0,
		y: 0,
	};

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
			DebugWindow.error("BoardObject.js", "constructor", "BoardObject must have a name");
		}

		if (BOARDOBJECTS.findIndex((gameObject) => gameObject.getName() === name) !== -1) {
			DebugWindow.error("BoardObject.js", "constructor", `A BoardObject with the name '${name}' already exists`);
		}

		this.name = name;

		// keep track of this board object so we can clean it up later, if needed
		BOARDOBJECTS.push(this);

		this.element = create({ name: "div", id: name, classes: ["board-object"] }).css({
			zIndex: BOARD_OBJECT_Z_INDEX,
		}) as HTMLElement;
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
	 * Gets this board object's css `transform`.
	 *
	 * @returns the board objects css  or `undefined`
	 */
	public getTransform(): Transform {
		return this.transform;
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
	 * @param options whether or not to physically modify the board objects CSS `left` and `top` values
	 */
	public setPosition(
		position: Position,
		options = {
			modifyCss: true,
			modifyTransform: true,
		}
	): void {
		if (options.modifyCss) {
			this.element.css({
				left: px(position.x),
				top: px(position.y),
			});
		}

		const oldPosition = this.position!;

		this.position = position;

		if (options.modifyTransform) {
			// get the board object's new position in order to compare it to its old one
			const newPosition = position;
			const transform = this.transform;

			// add to board object's transform
			this.setTransform({
				x: transform.x + (newPosition.x - oldPosition.x),
				y: transform.y + (newPosition.y - oldPosition.y),
			});
		}
	}

	/**
	 * Sets this board object's `x` position on the board and in memory.
	 *
	 * @param x the new `x` position of the board object
	 * @param modifyCss whether or not to physically modify the board objects CSS `left` value
	 */
	public setPositionX(
		x: number,
		options = {
			modifyCss: true,
			modifyTransform: true,
		}
	): void {
		if (options.modifyCss) {
			this.element.css({
				left: px(x),
			});
		}

		const oldPositionX = this.position!.x;

		this.position!.x = x;

		if (options.modifyTransform) {
			// get the board object's new position in order to compare it to its old one
			const newPositionX = x;

			// add to board object's transform
			this.setTransformX(this.transform.x + (newPositionX - oldPositionX));
		}
	}

	/**
	 * Sets this board object's `y` position on the board and in memory.
	 *
	 * @param y the new `y` position of the board object
	 * @param modifyCss whether or not to physically modify the board objects CSS `top` value
	 */
	public setPositionY(
		y: number,
		options = {
			modifyCss: true,
			modifyTransform: true,
		}
	): void {
		if (options.modifyCss) {
			this.element.css({
				top: px(y),
			});
		}

		const oldPositionY = this.position!.y;

		this.position!.y = y;

		if (options.modifyTransform) {
			// get the board object's new position in order to compare it to its old one
			const newPositionY = y;

			// add to board object's transform
			this.setTransformY(this.transform.y + (newPositionY - oldPositionY));
		}
	}

	/**
	 * Deletes this boardobject off of the game's board.
	 */
	public delete(): void {
		this.element.remove();
		BOARDOBJECTS.splice(BOARDOBJECTS.indexOf(this), 1);
	}

	/**
	 * Sets this board object's `transformX` and `translateY` CSS values and in-memory.
	 *
	 * @param transform the amounts to change the `translateX` and `translateY` values by
	 */
	private setTransform(transform: Transform): void {
		this.element.css({
			transform: `translate(${px(transform.x)}, ${px(transform.y)})`,
		});

		this.transform = transform;
	}

	/**
	 * Sets this board object's `translateX` CSS value and in-memory.
	 *
	 * @param x the amount to change the `translateX` by
	 */
	private setTransformX(x: number): void {
		this.element.css({
			transform: `translate(${px(x)}, ${px(this.transform.y)})`,
		});

		this.transform.x = x;
	}

	/**
	 * Sets this board object's `translateY` CSS value and in-memory.
	 *
	 * @param y the amount to change the `translateY` by
	 */
	private setTransformY(y: number): void {
		this.element.css({
			transform: `translate(${px(this.transform.x)}, ${px(y)})`,
		});

		this.transform.y = y;
	}
}
