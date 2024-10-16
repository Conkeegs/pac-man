"use strict";

import { App } from "../../App.js";
// #!DEBUG
import DebugWindow from "../../debugwindow/DebugWindow.js";
// #!END_DEBUG
import { create, px } from "../../utils/Utils.js";
import type { Position } from "../Board.js";

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
 * Options for setting character's position.
 */
export type PositionSetOptions = {
	/**
	 * Whether or not to modify this character's physical CSS position.
	 */
	modifyCss?: boolean;
	/**
	 * Whether or not to modify this character's CSS transform offset.
	 */
	modifyTransform?: boolean;
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
	protected abstract readonly width: number;
	/**
	 * The board object's height in pixels.
	 */
	protected abstract readonly height: number;
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
	private position: Position = {
		x: 0,
		y: 0,
	};
	/**
	 * CSS render updates for this board object that are queued for the future.
	 */
	private queuedRenderUpdates: (() => void)[] = [];

	/**
	 * `z-index` CSS property of all `BoardObject` instances on the board.
	 */
	public static BOARD_OBJECT_Z_INDEX: 0 = 0;

	/**
	 * Creates a board object.
	 *
	 * @param name the name/HTML id of the board object
	 */
	constructor(name: string) {
		// #!DEBUG
		if (!name) {
			DebugWindow.error("BoardObject.js", "constructor", "BoardObject must have a name");
		}

		if (App.BOARDOBJECTS.findIndex((gameObject) => gameObject.getName() === name) !== -1) {
			DebugWindow.error("BoardObject.js", "constructor", `A BoardObject with the name '${name}' already exists`);
		}
		// #!END_DEBUG

		this.name = name;

		// keep track of this board object so we can clean it up later, if needed
		App.BOARDOBJECTS.push(this);

		this.element = create({ name: "div", id: name, classes: ["board-object"] }).css({
			zIndex: BoardObject.BOARD_OBJECT_Z_INDEX,
		}) as HTMLElement;
	}

	/**
	 * Gets this board object's position on the board.
	 *
	 * @returns the board objects `Position`
	 */
	public getPosition(): Position {
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
	public getWidth(): number {
		return this.width;
	}

	/**
	 * Gets this board object's width in pixels.
	 *
	 * @returns this board object's width in pixels
	 */
	public getHeight(): number {
		return this.height;
	}

	/**
	 * Returns the center position of this board object by calculating its center with half
	 * of its width and height.
	 *
	 * @returns the center position of this board object
	 */
	public getCenterPosition(): Position {
		const position = this.position;

		return {
			x: position.x + this.getWidth() / 2,
			y: position.y + this.getHeight() / 2,
		};
	}

	/**
	 * Sets this board object's position on the board and in memory.
	 *
	 * @param position the new position of the board object
	 * @param options options for customizing how character's position is set
	 */
	public setPosition(
		position: Position,
		options: PositionSetOptions | undefined = {
			modifyCss: true,
			modifyTransform: true,
		}
	): void {
		if (options.modifyCss) {
			this.queueRenderUpdate(() => {
				this.element.css({
					left: px(position.x),
					top: px(position.y),
				});
			});
		}

		const oldPosition = this.position;

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
	 * @param options  options for customizing how character's position is set
	 */
	public setPositionX(
		x: number,
		options: PositionSetOptions | undefined = {
			modifyCss: true,
			modifyTransform: true,
		}
	): void {
		if (options.modifyCss) {
			this.queueRenderUpdate(() => {
				this.element.css({
					left: px(x),
				});
			});
		}

		const oldPositionX = this.position.x;

		this.position.x = x;

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
	 * @param options  options for customizing how character's position is set
	 */
	public setPositionY(
		y: number,
		options: PositionSetOptions | undefined = {
			modifyCss: true,
			modifyTransform: true,
		}
	): void {
		if (options.modifyCss) {
			this.queueRenderUpdate(() => {
				this.element.css({
					top: px(y),
				});
			});
		}

		const oldPositionY = this.position.y;

		this.position.y = y;

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
		this.queueRenderUpdate(() => {
			this.element.remove();
		});

		App.BOARDOBJECTS.splice(App.BOARDOBJECTS.indexOf(this), 1);
	}

	/**
	 * Renders CSS changes of this board object to the screen.
	 */
	public render(): void {
		const renderUpdates = this.queuedRenderUpdates;

		for (let i = 0; i < renderUpdates.length; i++) {
			// render visual update
			renderUpdates[i]!();

			renderUpdates.splice(i, 1);
		}

		App.BOARDOBJECTS_TO_RENDER.splice(App.BOARDOBJECTS_TO_RENDER.indexOf(this), 1);
	}

	/**
	 * Queues a render update for this board object that updates its CSS.
	 *
	 * @param updateCallback callback that will update this board object's CSS
	 */
	private queueRenderUpdate(updateCallback: () => void): void {
		App.BOARDOBJECTS_TO_RENDER.push(this);

		this.queuedRenderUpdates.push(updateCallback);
	}

	/**
	 * Sets this board object's `transformX` and `translateY` CSS values and in-memory.
	 *
	 * @param transform the amounts to change the `translateX` and `translateY` values by
	 */
	private setTransform(transform: Transform): void {
		this.queueRenderUpdate(() => {
			this.element.css({
				transform: `translate(${px(transform.x)}, ${px(transform.y)})`,
			});
		});

		this.transform = transform;
	}

	/**
	 * Sets this board object's `translateX` CSS value and in-memory.
	 *
	 * @param x the amount to change the `translateX` by
	 */
	private setTransformX(x: number): void {
		this.queueRenderUpdate(() => {
			this.element.css({
				transform: `translate(${px(x)}, ${px(this.transform.y)})`,
			});
		});

		this.transform.x = x;
	}

	/**
	 * Sets this board object's `translateY` CSS value and in-memory.
	 *
	 * @param y the amount to change the `translateY` by
	 */
	private setTransformY(y: number): void {
		this.queueRenderUpdate(() => {
			this.element.css({
				transform: `translate(${px(this.transform.x)}, ${px(y)})`,
			});
		});

		this.transform.y = y;
	}
}
