"use strict";

import { App } from "../../App.js";
import { GameElement, type Position, type PositionSetOptions, type Transform } from "../../GameElement.js";
import { px } from "../../utils/Utils.js";

/**
 * Represents characters/small, generally tile-sized objects on the board.
 */
export abstract class BoardObject extends GameElement {
	/**
	 * The board object's width in pixels.
	 */
	protected abstract override readonly _width: number;
	/**
	 * The board object's height in pixels.
	 */
	protected abstract override readonly _height: number;

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
		super(name);

		// keep track of this board object so we can clean it up later, if needed
		App.BOARDOBJECTS.push(this);

		const element = this.getElement();

		element.classList.add("board-object", this.constructor.name.toLowerCase() || "base-boardobject");
		element.css({
			zIndex: BoardObject.BOARD_OBJECT_Z_INDEX,
		});
	}

	/**
	 * Sets this board object's position on the board and in memory.
	 *
	 * @param position the new position of the board object
	 * @param options options for customizing how character's position is set
	 */
	public override setPosition(
		position: Position,
		options: PositionSetOptions | undefined = {
			modifyCss: true,
			modifyTransform: true,
		}
	): void {
		if (options.modifyCss) {
			this.queueRenderUpdate(() => {
				this.getElement().css({
					left: px(position.x),
					top: px(position.y),
				});
			});
		}

		const oldPosition = this.getPosition();

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
	public override setPositionX(
		x: number,
		options: PositionSetOptions | undefined = {
			modifyCss: true,
			modifyTransform: true,
		}
	): void {
		if (options.modifyCss) {
			this.queueRenderUpdate(() => {
				this.getElement().css({
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
	public override setPositionY(
		y: number,
		options: PositionSetOptions | undefined = {
			modifyCss: true,
			modifyTransform: true,
		}
	): void {
		if (options.modifyCss) {
			this.queueRenderUpdate(() => {
				this.getElement().css({
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
	public override delete(): void {
		this.queueRenderUpdate(() => {
			this.getElement().remove();
		});

		App.GAME_ELEMENTS.splice(App.GAME_ELEMENTS.indexOf(this), 1);
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
	 * Sets this board object's `transformX` and `translateY` CSS values and in-memory.
	 *
	 * @param transform the amounts to change the `translateX` and `translateY` values by
	 */
	protected override setTransform(transform: Transform): void {
		this.queueRenderUpdate(() => {
			this.getElement().css({
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
	protected override setTransformX(x: number): void {
		this.queueRenderUpdate(() => {
			this.getElement().css({
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
	protected override setTransformY(y: number): void {
		this.queueRenderUpdate(() => {
			this.getElement().css({
				transform: `translate(${px(this.transform.x)}, ${px(y)})`,
			});
		});

		this.transform.y = y;
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
}
