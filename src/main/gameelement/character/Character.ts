"use strict";

import Board from "../../Board.js";
import { TILESIZE } from "../../utils/Globals.js";
import MakeAnimateable, { type AnimationState, type AnimationStateMap } from "../mixins/Animateable.js";
import MakeCollidable from "../mixins/Collidable.js";
import Moveable from "../moveable/Moveable.js";
import MovementDirection from "../moveable/MovementDirection.js";

/**
 * A character is any of the AI or user-controlled objects on the board.
 */
export default abstract class Character extends MakeAnimateable(MakeCollidable(Moveable, 50)) {
	/**
	 * `Character`s' width and height in pixels.
	 */
	private static CHARACTER_DIMENSIONS: number;
	/**
	 * The path to the character's picture file.
	 */
	private readonly source: string;
	abstract override readonly _ANIMATION_STATE_SETS: AnimationStateMap &
		Record<Exclude<MovementDirection, MovementDirection.STOP>, ReadonlyArray<AnimationState>>;
	abstract override _ANIMATION_STATE_MILLIS: number;

	public abstract override canBeCollidedByTypes: string[];
	/**
	 * Number of pixels from the left that the character's sprite sheet starts at.
	 */
	public static readonly CHARACTER_SPRITE_SHEET_OFFSET_X: 456 = 456;
	/**
	 * Number of pixels that each character is offset from the top and left side of their
	 * sprite sheet.
	 */
	public static readonly CHARACTER_SPRITE_OFFSET: 1 = 1;
	/**
	 * Height and width of each character on their sprite sheet.
	 */
	public static readonly CHARACTER_SPRITE_DIMENSIONS: 13 = 13;

	/**
	 * Creates a character.
	 *
	 * @param name
	 * @param speed
	 * @param source the path to the character's picture file
	 */
	constructor(name: string, speed: number, source: string) {
		Character.CHARACTER_DIMENSIONS = TILESIZE + Board.calcTileOffset(0.5);

		super(name, Character.CHARACTER_DIMENSIONS, Character.CHARACTER_DIMENSIONS, speed);

		this.source = source;

		this.getElement().css({
			backgroundImage: `url(${source})`,
		});
	}

	/**
	 * Gets the path to the character's picture file.
	 *
	 * @returns the path to the character's picture file
	 */
	public getSource() {
		return this.source;
	}

	/**
	 * Sets the new direction for this character to move. Also takes care of updating
	 * the animation image for convenience.
	 *
	 * @param direction new direction for this character to move
	 */
	public override setCurrentDirection(direction: MovementDirection): void {
		super.setCurrentDirection(direction);

		this._currentAnimationSet = direction;
	}

	/**
	 * Stop moving this character and cancels this its current animation frame.
	 *
	 */
	public override stopMoving(): void {
		super.stopMoving();
		this.stopAnimation();
	}

	/**
	 * Starts moving this character and plays its animation.
	 */
	public override startMoving(direction: MovementDirection) {
		super.startMoving(direction);
		// start playing this character's animations as they move.
		this.playAnimation();
	}
}
