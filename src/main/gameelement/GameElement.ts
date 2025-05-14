import { App } from "../App.js";
import Debugging from "../Debugging.js";
import DebugWindow from "../debugwindow/DebugWindow.js";
import { create, px } from "../utils/Utils.js";

/**
 * Represents a game element's horizontal and vertical offsets in the game.
 */
export type Position = {
	/**
	 * The x position of this game element (offset from left side of game).
	 */
	x: number;
	/**
	 * The y position of this game element (offset from top of game)
	 */
	y: number;
};

/**
 * Represents this game element's CSS `transform` `x` and `y` values.
 */
export type Transform = {
	/**
	 * The game element's `translateX` value in pixels.
	 */
	x: number;
	/**
	 * The game element's `translateY` value in pixels.
	 */
	y: number;
};

/**
 * Options for setting game element's position.
 */
export type PositionSetOptions = {
	/**
	 * Whether or not to modify this game element's physical CSS position.
	 */
	modifyCss?: boolean;
	/**
	 * Whether or not to modify this game element's CSS transform offset.
	 */
	modifyTransform?: boolean;
};

/**
 * Represents any object in the game that is displayed on the game as an `HTMLElement`
 * in the DOM.
 */
export abstract class GameElement {
	/**
	 * This game element's CSS `transform` value, holding both its `translateX` and `translateY` values.
	 */
	protected transform: Transform = {
		x: 0,
		y: 0,
	};
	/**
	 * The game element's position in the game.
	 */
	protected position: Position = {
		x: 0,
		y: 0,
	};

	/**
	 * The game element's width in pixels.
	 */
	private _width: number = 0;
	/**
	 * The game element's height in pixels.
	 */
	private _height: number = 0;
	/**
	 * The HTML element that contains this game element.
	 */
	private element: HTMLElement;
	/**
	 * The game element's unique name and HTML id.
	 */
	private readonly name: string;

	/**
	 * Creates a game element.
	 *
	 * @param name the name/HTML id of the game element
	 * @param width the width of this game element
	 * @param height the height of this game element
	 */
	constructor(name: string, width: number, height: number) {
		// #!DEBUG
		if (Debugging.isEnabled()) {
			if (!name) {
				DebugWindow.error("GameElement.js", "constructor", "GameElement must have a name");
			}

			if (App.GAME_ELEMENTS.findIndex((gameElement) => gameElement.getName() === name) !== -1) {
				DebugWindow.error(
					"GameElement.js",
					"constructor",
					`A GameElement with the name '${name}' already exists`
				);
			}
		}
		// #!END_DEBUG

		this.name = name;
		this._width = width;
		this._height = height;

		// keep track of this game element so we can clean it up later, if needed
		App.GAME_ELEMENTS.push(this);

		this.element = create({ name: "div", id: name, classes: ["game-element"] });
		this.element.classList.add("game-element", this.constructor.name.toLowerCase() || "base-game-element");

		this.setDimensions(width, height);
	}

	/**
	 * Gets this game element's position in the game.
	 *
	 * @returns the game element's `Position`
	 */
	public getPosition(): Position {
		return this.position;
	}

	/**
	 * Gets this game element's css `transform`.
	 *
	 * @returns the game element's css  or `undefined`
	 */
	public getTransform(): Transform {
		return this.transform;
	}

	/**
	 * Gets the HTML element that contains this game element.
	 *
	 * @returns the HTML element that contains this game element
	 */
	public getElement(): HTMLElement {
		return this.element;
	}

	/**
	 * Gets the game element's unique name and HTML id.
	 *
	 * @returns the game element's unique name and HTML id
	 */
	public getName() {
		return this.name;
	}

	/**
	 * Gets this game element's width in pixels.
	 *
	 * @returns game element's width in pixels
	 */
	public getWidth(): number {
		return this._width;
	}

	/**
	 * Gets this game element's width in pixels.
	 *
	 * @returns this game element's width in pixels
	 */
	public getHeight(): number {
		return this._height;
	}

	/**
	 * Gets this game element's width and height in pixels.
	 *
	 * @returns this game element's width and height in pixels
	 */
	public getDimensions(): { width: number; height: number } {
		return { width: this._width, height: this._height };
	}

	/**
	 * Returns the center position of this game element by calculating its center with half
	 * of its width and height.
	 *
	 * @returns the center position of this game element
	 */
	public getCenterPosition(): Position {
		const position = this.position;

		return {
			x: position.x + this.getWidth() / 2,
			y: position.y + this.getHeight() / 2,
		};
	}

	/**
	 * Sets this game element's position.
	 *
	 * @param position the new position of the game element
	 * @param options options for customizing how game element's position is set
	 */
	public setPosition(
		position: Position,
		options: PositionSetOptions | undefined = {
			modifyCss: false,
			modifyTransform: true,
		}
	): void {
		if (options.modifyCss) {
			this.element.css({
				left: px(position.x),
				top: px(position.y),
			});
		}

		this.position = position;

		if (options.modifyTransform ?? true) {
			this.setTransform({
				x: position.x,
				y: position.y,
			});
		}
	}

	/**
	 * Sets this game element's `x` position.
	 *
	 * @param x the new `x` position of the game element
	 * @param options  options for customizing how character's position is set
	 */
	public setPositionX(
		x: number,
		options: PositionSetOptions | undefined = {
			modifyCss: false,
			modifyTransform: true,
		}
	): void {
		if (options.modifyCss) {
			this.element.css({
				left: px(x),
			});
		}

		this.position.x = x;

		if (options.modifyTransform ?? true) {
			this.setTransformX(x);
		}
	}

	/**
	 * Sets this game element's `y` position.
	 *
	 * @param y the new `y` position of the game element
	 * @param options  options for customizing how character's position is set
	 */
	public setPositionY(
		y: number,
		options: PositionSetOptions | undefined = {
			modifyCss: false,
			modifyTransform: true,
		}
	): void {
		if (options.modifyCss) {
			this.element.css({
				top: px(y),
			});
		}

		this.position.y = y;

		if (options.modifyTransform ?? true) {
			this.setTransformY(y);
		}
	}

	/**
	 * Deletes this game element from the game.
	 */
	public delete(): void {
		this.element.remove();

		App.GAME_ELEMENTS.splice(App.GAME_ELEMENTS.indexOf(this), 1);
	}

	/**
	 * Checks if two positions are equal in coordinate values.
	 *
	 * @param position1 first position to check against
	 * @param position2 second position to check against
	 * @returns if both positions are equal
	 */
	public static positionsEqual(position1: Position, position2: Position): boolean {
		return position1.x === position2.x && position1.y === position2.y;
	}

	/**
	 * Sets this game element's `transformX` and `translateY` CSS values and in-memory.
	 *
	 * @param transform the amounts to change the `translateX` and `translateY` values by
	 */
	protected setTransform(transform: Transform): void {
		this.element.css({
			transform: `translate(${px(transform.x)}, ${px(transform.y)})`,
		});

		this.transform = transform;
	}

	/**
	 * Sets this game element's `translateX` CSS value and in-memory.
	 *
	 * @param x the amount to change the `translateX` by
	 */
	protected setTransformX(x: number): void {
		this.element.css({
			transform: `translate(${px(x)}, ${px(this.transform.y)})`,
		});

		this.transform.x = x;
	}

	/**
	 * Sets this game element's `translateY` CSS value and in-memory.
	 *
	 * @param y the amount to change the `translateY` by
	 */
	protected setTransformY(y: number): void {
		this.element.css({
			transform: `translate(${px(this.transform.x)}, ${px(y)})`,
		});

		this.transform.y = y;
	}

	/**
	 * Set this game element's width in pixels.
	 *
	 * @param width new width in pixels
	 */
	protected setWidth(width: number): void {
		this._width = width;

		this.element.css({
			width: px(width),
		});
	}

	/**
	 * Set this game element's height in pixels.
	 *
	 * @param height new height in pixels
	 */
	protected setHeight(height: number): void {
		this._height = height;

		this.element.css({
			height: px(height),
		});
	}

	/**
	 * Set this game element's width and height in pixels.
	 *
	 * @param width new width in pixels
	 * @param height new height in pixels
	 */
	protected setDimensions(width: number, height: number): void {
		this.setWidth(width);
		this.setHeight(height);

		this.element.css({
			width: px(width),
			height: px(height),
		});
	}
}
