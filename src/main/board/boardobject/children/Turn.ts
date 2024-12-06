import { TILESIZE } from "../../../utils/Globals.js";
import { px } from "../../../utils/Utils.js";
import { BoardObject } from "../BoardObject.js";
import MakeCollidable, { type Collidable } from "../mixins/Collidable.js";
import Blinky from "./character/Blinky.js";
import Clyde from "./character/Clyde.js";
import Inky from "./character/Inky.js";
import PacMan from "./character/PacMan.js";
import Pinky from "./character/Pinky.js";
import type Moveable from "./moveable/Moveable.js";
import type MovementDirection from "./moveable/MovementDirection.js";

/**
 * Represents a position on the board where a character is allowed to turn,
 * and also includes an array of `MovementDirection` values to tell the character
 * what directions it can turn when it reaches the given turn coordinates.
 */
export default class Turn extends MakeCollidable(BoardObject) {
	protected override readonly _width: number = TILESIZE / 4;
	protected override readonly _height = TILESIZE / 4;

	/**
	 * This turn's `MovementDirection`s it has available.
	 */
	private directions: MovementDirection[];

	/**
	 * @inheritdoc
	 */
	public override canBeCollidedByTypes: string[] = [PacMan.name, Pinky.name, Inky.name, Blinky.name, Clyde.name];

	/**
	 * Create a turn instance.
	 *
	 * @param name unique name and HTML id of turn
	 * @param directions the allowed `MovementDirection`s of the turn
	 */
	constructor(name: string, directions: MovementDirection[]) {
		super(name);

		this.directions = directions;

		this.getElement().css({
			width: px(this._width),
			height: px(this._height),
		});
	}

	/**
	 * Get this turn's `MovementDirection`s it has available.
	 *
	 * @returns the available directions of the turn
	 */
	public getDirections(): MovementDirection[] {
		return this.directions;
	}

	/**
	 * @inheritdoc
	 */
	public override _onCollision(collidableMoveable: Moveable & Collidable): void {}
}
