"use strict";

import type { IMAGE_LIST } from "../../../../assets/ImageRegistry.js";
import Board from "../../../../board/Board.js";
import { CHARACTERS, TILESIZE } from "../../../../utils/Globals.js";
import { px } from "../../../../utils/Utils.js";
import MakeAnimateable from "../../mixins/Animateable.js";
import type { Collidable } from "../../mixins/Collidable.js";
import MakeCollidable from "../../mixins/Collidable.js";
import Moveable, { type StartMoveOptions } from "../moveable/Moveable.js";
import MovementDirection from "../moveable/MovementDirection.js";

/**
 * A character is any of the AI or user-controlled objects on the board.
 */
export default abstract class Character extends MakeAnimateable(MakeCollidable(Moveable, 50)) {
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
	public override readonly width: number = TILESIZE + Board.calcTileOffset(0.5);
	public override readonly height = TILESIZE + Board.calcTileOffset(0.5);

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
		CHARACTERS.push(this);

		this.source = source;

		this.element.css({
			width: px(this.width),
			height: px(this.height),
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
		CHARACTERS.splice(CHARACTERS.indexOf(this), 1);

		super.delete();
	}

	/**
	 * @inheritdoc
	 */
	override _getCurrentAnimationImageName(): keyof IMAGE_LIST {
		return `${this.defaultAnimationImageName()}-${this.currentDirection}` as keyof IMAGE_LIST;
	}

	/**
	 * Updates the character in a given frame.
	 *
	 * @param frameCount the number of frames this boardobject has been updating
	 */
	abstract override _runFrameUpdate(frameCount: number): boolean;

	/**
	 * @inheritdoc
	 */
	abstract override _onCollision(withCollidable: Collidable): void;
}
