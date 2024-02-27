"use strict";

import { defined, die, exists } from "../../../../utils/Utils.js";
import type { Position } from "../../BoardObject.js";
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
	 * Takes a given turn and a position and returns a boolean indicating whether or not the turn is "ahead" of the
	 * direction PacMan is currently heading and if it is on the same "row"/"column" as PacMan.
	 */
	private turnValidators = {
		[MovementDirection.LEFT]: (turn: TurnData, position: Position) => {
			// only turns to the left of PacMan and in the same row
			return turn.x <= position.x && turn.y - this.getHeight()! / 2 === position.y;
		},
		[MovementDirection.RIGHT]: (turn: TurnData, position: Position) => {
			// only turns to the right of PacMan and in the same row
			return turn.x >= position.x && turn.y - this.getHeight()! / 2 === position.y;
		},
		[MovementDirection.UP]: (turn: TurnData, position: Position) => {
			// only turns above PacMan and in the same column
			return turn.y <= position.y && turn.x - this.getWidth()! / 2 === position.x;
		},
		[MovementDirection.DOWN]: (turn: TurnData, position: Position) => {
			// only turns below PacMan and in the same column
			return turn.y >= position.y && turn.x - this.getWidth()! / 2 === position.x;
		},
	};

	/**
	 * The directions that PacMan can move in upon first spawning.
	 */
	private readonly SPAWN_MOVECODES = [MovementDirection.RIGHT, MovementDirection.LEFT];

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

			console.log("NOT LISTENING");

			// makes sure this event handler isn't unnecessarily fired more than once per-movement. only setting this to false
			// if our movement key is valid
			this.listenForKeydown = false;

			if (moveCode === MovementDirection.STOP) {
				console.log("IS STOP", isMoving);
				if (isMoving) {
					event.preventDefault();
					this.stopMoving();

					die({
						position: this.getPosition(),
					});
				}

				// console.log({ avg: this.positionSum / this.positionCount });
				// console.log({ frameCount: this.frameCount, fps: this.frameCount / this.frameSecondsSum });

				return;
			}

			// let PacMan immediately start moving (left or right) if he has just spawned
			if (!defined(lastMoveCode) && isMoving === false) {
				if (this.SPAWN_MOVECODES.includes(moveCode)) {
					// PacMan is going to move, so set his last move code
					this.lastMoveCode = moveCode;
					console.log("JUST SPAWNED");

					this.startMoving(moveCode);
				}

				return;
			}

			console.log({
				moveCode,
				lastMoveCode,
				opposite: this.moveCodeOpposites[lastMoveCode as keyof typeof this.moveCodeOpposites],
			});

			if (
				// check if the character has moved in any direction in the past
				defined(lastMoveCode) &&
				// check if the character is considered "moving"
				isMoving &&
				// check if the new direction that the character is trying to move in is the opposite of the last direction
				// it was moving in
				moveCode === this.moveCodeOpposites[lastMoveCode as keyof typeof this.moveCodeOpposites]
			) {
				// PacMan is going to move, so set his last move code
				this.lastMoveCode = moveCode;
				console.log("TURNING AROUND");

				// we don't need to provide the "fromTurn" parameter here since PacMan is only turning around
				// in the opposite direction instead of a 90-degree angle
				this.startMoving(moveCode);

				return;
			}

			const position = this.getPosition()!;
			let nearestTurn: TurnData | undefined;

			// filter down the selection of turns we have to choose from to only the ones "ahead" of PacMan and also directly within the
			// turn threshold
			const filteredTurnData = this.turnData!.filter((turn) => {
				// turns "ahead" of PacMan
				if (this.turnValidators[lastMoveCode as keyof typeof this.turnValidators](turn, position)) {
					return true;
				}

				// turn within turn threshold
				if (this.isWithinTurnDistance(turn) && this.canTurnWithMoveCode(moveCode, turn)) {
					nearestTurn = turn;

					return true;
				}

				return false;
			});

			console.log({ filteredTurnData, nearestTurn });

			// if there is a turnable turn at this moment, just immediately move PacMan in that direction
			if (nearestTurn) {
				// PacMan is going to move, so set his last move code
				this.lastMoveCode = moveCode;
				console.log("NEAREST TURN IMMEDIATELY");

				this.startMoving(moveCode, nearestTurn);

				return;
			}

			// turns are always ordered from left-to-right, starting from the top-left of the board and ending at the bottom-right, so
			// reverse the array here so that when we call "find()" on "filteredTurnData" in order to find the first turn that allows PacMan
			// to turn (given the input moveCode), we find the closest turn to PacMan, instead of a turn that may be at the "start" of the
			// "filteredTurnData" array
			if (lastMoveCode === MovementDirection.LEFT || lastMoveCode === MovementDirection.UP) {
				filteredTurnData.reverse();
			}

			// at this point, we know there is not an immediately-available turn to turn at, so find the nearest-available turn that allows our
			// "moveCode"
			nearestTurn = filteredTurnData.find((turn) => this.canTurnWithMoveCode(moveCode, turn));

			console.log({ nearestTurn });

			// if the nearest turn allows the moveCode that the user has entered, queue the turn for the future since
			// PacMan hasn't arrived in its threshold yet
			if (nearestTurn) {
				// PacMan is going to move, so set his last move code
				this.lastMoveCode = moveCode;
				console.log("VALID TURN AHEAD, QUEUEING");

				this.queueTurn(moveCode, nearestTurn);
			}
		});

		// listen for user releasing a movement key
		documentBody.addEventListener("keyup", (event) => {
			let moveCode = this.moveCodes[event.code as keyof typeof this.moveCodes];

			// check for user releasing a valid movement key, and let PacMan class know that it can
			// once again start listening for more movement inputs. this prevents user from mashing
			// random movements keys and getting unexpected behavior from the movement listener above
			if (exists(moveCode)) {
				console.log("LISTENING AGAIN");

				this.listenForKeydown = true;
			}
		});
	}
}
