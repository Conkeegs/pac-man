"use strict";

import { App } from "../../App.js";
import { GameElement, type Position, type Transform } from "../../gameelement/GameElement.js";
import { px } from "../../utils/Utils.js";

/**
 * Represents characters/small, generally tile-sized objects on the board.
 */
export abstract class BoardObject extends GameElement {
	/**
	 * CSS render updates for this board object that are queued for the future.
	 */
	private queuedRenderUpdate: (() => void) | undefined;
	/**
	 * Whether or not this `BoardObject` is ready for visual updates.
	 */
	private readyForRender: true | false = false as const;

	/**
	 * `z-index` CSS property of all `BoardObject` instances on the board.
	 */
	public static BOARD_OBJECT_Z_INDEX: 0 = 0;

	/**
	 * Creates a board object.
	 *
	 * @param name the name/HTML id of the board object
	 * @param width the width of this board object
	 * @param height the width of this board object
	 */
	constructor(name: string, width: number, height: number) {
		super(name, width, height);

		const element = this.getElement();

		element.css({
			zIndex: BoardObject.BOARD_OBJECT_Z_INDEX,
		});
		element.classList.add("board-object");
	}

	/**
	 * Sets this board object's position on the board and in memory.
	 *
	 * @param position the new position of the board object
	 * @param options options for customizing how character's position is set
	 */
	public override setPosition(position: Position): void {
		this.position = position;

		const positionX = position.x;
		const positionY = position.y;
		const children = this.children;

		for (let i = 0; i < children.length; i++) {
			const child = children[i]!;

			child.gameElement.setPosition({
				x: positionX + (child.offsetX ?? 0),
				y: positionY + (child.offsetY ?? 0),
			});
		}

		this.setTransform({
			x: positionX,
			y: positionY,
		});
	}

	/**
	 * Sets this board object's `x` position on the board and in memory.
	 *
	 * @param x the new `x` position of the board object
	 * @param options  options for customizing how character's position is set
	 */
	public override setPositionX(x: number): void {
		this.position.x = x;

		const children = this.children;

		for (let i = 0; i < children.length; i++) {
			const child = children[i]!;

			child.gameElement.setPositionX(x + (child.offsetX ?? 0));
		}

		this.setTransformX(x);
	}

	/**
	 * Sets this board object's `y` position on the board and in memory.
	 *
	 * @param y the new `y` position of the board object
	 * @param options  options for customizing how character's position is set
	 */
	public override setPositionY(y: number): void {
		this.position.y = y;

		const children = this.children;

		for (let i = 0; i < children.length; i++) {
			const child = children[i]!;

			child.gameElement.setPositionY(y + (child.offsetY ?? 0));
		}

		this.setTransformY(y);
	}

	/**
	 * Renders CSS changes of this board object to the screen.
	 */
	public render(): void {
		const queuedRenderUpdate = this.queuedRenderUpdate;

		if (!queuedRenderUpdate) {
			return;
		}

		// render visual update
		queuedRenderUpdate();

		this.queuedRenderUpdate = undefined;
		this.readyForRender = false;
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
		// check if already pushed, otherwise board object will render same updates more
		// than once for no reason
		if (!this.readyForRender) {
			App.getInstance().getToRenderGameElementIds().add(this.getUniqueId());

			this.readyForRender = true;
		}

		this.queuedRenderUpdate = updateCallback;
	}
}
