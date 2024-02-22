"use strict";

import { exists } from "../../../../utils/Utils.js";
import Character, { type TurnData } from "./Character.js";
import MovementDirection from "./MovementDirection.js";

/**
 * Represents the PacMan character on the board.
 */
export default class PacMan extends Character {
	/**
	 * The last direction the user moved in.
	 */
	private lastMoveCode: MovementDirection | undefined;
	/**
	 * Whether or not PacMan is currently listening for movement inputs.
	 */
	private listenForKeydown: boolean = true;

	/**
	 * All supported keyboard keys for moving PacMan.
	 */
	private moveCodes = {
		ArrowLeft: MovementDirection.LEFT,
		KeyA: MovementDirection.LEFT,
		ArrowRight: MovementDirection.RIGHT,
		KeyD: MovementDirection.RIGHT,
		ArrowUp: MovementDirection.UP,
		KeyW: MovementDirection.UP,
		ArrowDown: MovementDirection.DOWN,
		KeyS: MovementDirection.DOWN,
		Space: MovementDirection.STOP,
	};

	/**
	 * Takes a direction that PacMan can move and returns the opposite direction of it. Helps determine
	 * if we need to call `Character.startMoving()` with the `fromTurn` parameter or not.
	 */
	private moveCodeOpposites = {
		[MovementDirection.LEFT]: MovementDirection.RIGHT,
		[MovementDirection.RIGHT]: MovementDirection.LEFT,
		[MovementDirection.UP]: MovementDirection.DOWN,
		[MovementDirection.DOWN]: MovementDirection.UP,
	};

	/**
	 * Creates PacMan.
	 *
	 * @param name
	 * @param speed
	 * @param source
	 */
	constructor(name: string, speed: number, source: string) {
		super(name, speed, source);

		this.createMoveEventListeners();
	}

	/**
	 * Every turn's position only allows a certain set of directions for a `Character` to move in. This method determines
	 * if PacMan can turn in a certain direction at the given `turn`.
	 *
	 * @param moveCode the direction PacMan wants to move in
	 * @param turn the turn position PacMan wants to turn at
	 * @returns boolean indicating whether the user can use a given `moveCode` to turn in a certain direction at the given `turn`
	 */
	private canTurnWithMoveCode(moveCode: MovementDirection, turn: TurnData): boolean {
		return turn.directions.includes(moveCode);
	}

	/**
	 * DOM event listeners that allow the user to control PacMan.
	 */
	private createMoveEventListeners() {
		const documentBody = document.body;

		// listen for movement keys for PacMan
		documentBody.addEventListener("keydown", (event) => {
			// make sure we are currently listening for movement inputs before continuing
			if (this.listenForKeydown === false) {
				return;
			}

			event.stopImmediatePropagation();

			let moveCode = this.moveCodes[event.code as keyof typeof this.moveCodes];
			const isMoving = this.isMoving();

			const lastMoveCode = this.lastMoveCode;

			// make sure the key pressed is a valid key that moves PacMan and that he isn't trying to move in the same direction
			// as the one he was just traveling in
			if (!exists(moveCode) || (isMoving && lastMoveCode === moveCode)) {
				return;
			}

			// makes sure this event handler isn't unnecessarily fired more than once per-movement. only setting this to false
			// if our movement key is valid
			this.listenForKeydown = false;

			if (moveCode === MovementDirection.STOP) {
				if (isMoving) {
					event.preventDefault();
					this.stopMoving();
				}

				return;
			}

			this.lastMoveCode = moveCode;

			if (
				// check if the character has moved in any direction in the past
				lastMoveCode &&
				// check if the character is considered "moving"
				isMoving &&
				// check if the new direction that the character is trying to move in is the opposite of the last direction
				// it was moving in
				moveCode === this.moveCodeOpposites[lastMoveCode as keyof typeof this.moveCodeOpposites]
			) {
				// we don't need to provide the "fromTurn" parameter here since PacMan is only turning around
				// in the opposite direction instead of a 90-degree angle
				this.startMoving(moveCode);

				return;
			}

			const turnData = this.turnData!;

			// check if there is a turn that is within turning-distance at this precise moment in time.
			// this way, we can turn PacMan immediately upon the key press
			let nearestTurn = turnData.find((turn) => {
				return this.isWithinTurnDistance(turn) && this.canTurnWithMoveCode(moveCode, turn);
			});

			// if there is a turnable turn at this moment, just immediately move PacMan in that direction
			if (nearestTurn) {
				this.startMoving(moveCode, nearestTurn);

				return;
			}

			const position = this.getPosition()!;
			let closestTurnDistance = Infinity;

			// at this point, we know there is not an immediately-available turn to turn at, so find the nearest-available turn
			nearestTurn = turnData.reduce((closestTurn, currentTurn) => {
				const closestTurnDistanceNew = Math.min(
					closestTurnDistance,
					Math.sqrt(Math.pow(currentTurn.x - position.x, 2) + Math.pow(currentTurn.y - position.y, 2))
				);

				if (closestTurnDistance > closestTurnDistanceNew) {
					closestTurnDistance = closestTurnDistanceNew;

					return currentTurn;
				}

				return closestTurn;
			}, position as TurnData);

			// if the nearest turn allows the moveCode that the user has entered, queue the turn for the future since
			// PacMan hasn't arrived in its threshold yet
			if (this.canTurnWithMoveCode(moveCode, nearestTurn)) {
				this.queueTurn(moveCode, nearestTurn);
			}
		});

		// listen for user releasing a movement key
		documentBody.addEventListener("keyup", (event) => {
			let moveCode = this.moveCodes[event.code as keyof typeof this.moveCodes];

			// check for user releasing a valid movement key, and let PacMan class know that it can
			// once again start listening for more movement inputs. this prevents user from mashing
			// random movements keys and getting unexpected behavior from the movement listener above
			if (exists(moveCode) && this.isMoving() && moveCode === this.lastMoveCode) {
				this.listenForKeydown = true;
			}
		});
	}
}
