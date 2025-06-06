import { GameElement } from "../../../gameelement/GameElement.js";
import { TILESIZE } from "../../../utils/Globals.js";
import { BoardObject } from "../BoardObject.js";
import MakeCollidable, { type Collidable } from "../mixins/Collidable.js";
import Blinky from "./character/Blinky.js";
import Clyde from "./character/Clyde.js";
import Inky from "./character/Inky.js";
import PacMan from "./character/PacMan.js";
import Pinky from "./character/Pinky.js";
import Moveable from "./moveable/Moveable.js";
import type MovementDirection from "./moveable/MovementDirection.js";

/**
 * Represents a position on the board where a character is allowed to turn,
 * and also includes an array of `MovementDirection` values to tell the character
 * what directions it can turn when it reaches the given turn coordinates.
 */
export default class Turn extends MakeCollidable(BoardObject) {
	/**
	 * `Turn`s' width and height in pixels.
	 */
	private static readonly TURN_DIMENSIONS: number = TILESIZE / 4;
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
		super(name, Turn.TURN_DIMENSIONS, Turn.TURN_DIMENSIONS);

		this.directions = directions;
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
	public override onCollision(collidableMoveable: Moveable & Collidable): void {
		const position = this.getPosition();
		const queuedTurnInfo = collidableMoveable.getTurnQueue()[0]!;

		// check the turn queue for any queued turns
		if (queuedTurnInfo) {
			const queuedTurnInfoTurn = queuedTurnInfo.turn;

			if (GameElement.positionsEqual(position, queuedTurnInfoTurn.getPosition())) {
				collidableMoveable.offsetPositionToTurn(this);
				collidableMoveable.setCurrentDirection(queuedTurnInfo.direction);
				collidableMoveable.queueRenderUpdate();

				return;
			}
		}

		if (!(collidableMoveable instanceof PacMan)) {
			return;
		}

		const currentDirection = collidableMoveable.getCurrentDirection()!;

		if (Moveable.canTurnWithMoveDirection(currentDirection, this)) {
			// const currentInputDirection = collidableMoveable.getCurrentInputDirection()!;

			// if (
			// 	currentDirection != currentInputDirection &&
			// 	Moveable.canTurnWithMoveDirection(currentInputDirection, this)
			// ) {
			// 	collidableMoveable.startMoving(currentInputDirection, {
			// 		fromTurn: this,
			// 	});
			// }

			return;
		}

		// we know at this point that pacman must stop at this turn.

		// don't allow pacman to stop against walls when his mouth is closed. otherwise, visually updating his rotation
		// when users are against walls does not make a visual change
		if (collidableMoveable._animationFrame === 1) {
			collidableMoveable._animationFrame++;

			collidableMoveable.updateAnimationImage();
		}

		collidableMoveable.stopMoving();
		collidableMoveable.setStoppedAtTurn(this);
		// snap pacman to "stop" location to keep collision detection consistent
		collidableMoveable.offsetPositionToTurn(this);
		collidableMoveable.queueRenderUpdate();
	}
}
