"use strict";

import { App } from "../../../../App.js";
import type { IMAGE_LIST } from "../../../../assets/ImageRegistry.js";
import Board from "../../../../board/Board.js";
import { TILESIZE } from "../../../../utils/Globals.js";
import { px } from "../../../../utils/Utils.js";
import MakeAnimateable from "../../mixins/Animateable.js";
import MakeCollidable from "../../mixins/Collidable.js";
import Moveable, { type StartMoveOptions } from "../moveable/Moveable.js";
import MovementDirection from "../moveable/MovementDirection.js";

/**
 * A character is any of the AI or user-controlled objects on the board.
 */
export default abstract class Character extends MakeAnimateable(MakeCollidable(Moveable, 50)) {
	protected override readonly _width: number = TILESIZE + Board.calcTileOffset(0.5);
	protected override readonly _height = TILESIZE + Board.calcTileOffset(0.5);

	/**
	 * The path to the character's picture file.
	 */
	private readonly source: string;

	/**
	 * The maximum number of different animation states this character can be in.
	 */
	abstract override readonly _NUM_ANIMATION_STATES: number;
	/**
	 * How long each animation state for this character lasts.
	 */
	abstract override _ANIMATION_STATE_MILLIS: number;

	public abstract override canBeCollidedByTypes: string[];

	/**
	 * Creates a character.
	 *
	 * @param name
	 * @param speed
	 * @param source the path to the character's picture file
	 */
	constructor(name: string, speed: number, source: string) {
		super(name, speed);

		// keep track of every character created for convenience
		App.CHARACTERS.push(this);

		this.source = source;

		this.getElement().css({
			width: px(this._width),
			height: px(this._height),
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
	 * Stop moving this character and cancels this its current animation frame.
	 *
	 */
	public override stopMoving(): boolean {
		super.stopMoving();
		this.stopAnimation();
		this.checkForCollidableAndRemove();

		return false;
	}

	/**
	 * Starts moving this character and plays its animation.
	 */
	public override startMoving(direction: MovementDirection, options?: StartMoveOptions) {
		super.startMoving(direction, options);
		// start playing this character's animations as they move.
		this.playAnimation();
	}

	/**
	 * Deletes this character off of the game's board.
	 */
	public override delete(): void {
		App.CHARACTERS.splice(App.CHARACTERS.indexOf(this), 1);

		super.delete();
	}

	/**
	 * The the current animation image for this `Character` instance, combined with its current direction since
	 * it is `Moveable`.
	 */
	override _getCurrentAnimationImageName(): keyof IMAGE_LIST {
		return `${this.defaultAnimationImageName()}-${this.currentDirection}` as keyof IMAGE_LIST;
	}
}
