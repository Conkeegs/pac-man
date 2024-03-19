"use strict";

import { defined, die, exists } from "../../../../utils/Utils.js";
import Character, { type TurnData } from "./Character.js";
import MovementDirection from "./MovementDirection.js";
import type UpdatesAnimationState from "./UpdatesAnimationState.js";

/**
 * Represents the forward direction of pacman's animation.
 */
type ANIMATION_DIRECTION_FORWARDS = 0;
/**
 * Represents the backward direction of pacman's animation.
 */
type ANIMATION_DIRECTION_BACKWARDS = 1;

/**
 * The possible directions that pacman's animation can play in.
 */
type ANIMATION_DIRECTIONS = {
	FORWARDS: ANIMATION_DIRECTION_FORWARDS;
	BACKWARDS: ANIMATION_DIRECTION_BACKWARDS;
};

/**
 * Represents the PacMan character on the board.
 */
export default class PacMan extends Character implements UpdatesAnimationState {
	/**
	 * The last direction the user moved in.
	 */
	private lastMoveCode: MovementDirection | undefined;
	/**
	 * Whether or not PacMan is currently listening for movement inputs.
	 */
	private listenForKeydown: boolean = true;
	/**
	 * The direction (forwards or backwards) that pacman's animation is currently playing in.
	 */
	private animationDirection: ANIMATION_DIRECTION_FORWARDS | ANIMATION_DIRECTION_BACKWARDS = 0;
	/**
	 * The frame of animation that pacman is currently on.
	 */
	_animationFrame: number = 0;
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
	 * The max number of animation states pacman can be in.
	 */
	readonly _MAX_ANIMATION_FRAMES: 3 = 3;
	/**
	 * The directions that PacMan can move in upon first spawning.
	 */
	private static readonly SPAWN_MOVECODES: MovementDirection[] = [MovementDirection.RIGHT, MovementDirection.LEFT];
	/**
	 * The possible directions that pacman's animation can play in.
	 */
	private static readonly ANIMATION_DIRECTIONS: ANIMATION_DIRECTIONS = {
		FORWARDS: 0,
		BACKWARDS: 1,
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
	 * Starts moving `PacMan`, while also setting his `lastMoveCode` in memory to keep track of the
	 * last move input that was entered for him.
	 *
	 * @param moveCode the direction `PacMan` wants to move
	 * @param turn optional turn in case `PacMan` is going to turn at a turn's location
	 */
	public override startMoving(moveCode: MovementDirection, turn?: TurnData): void {
		// PacMan is going to move, so set his last move code
		this.lastMoveCode = moveCode;

		super.startMoving(moveCode, turn);
	}

	/**
	 * Gets the name of the image file relating to pacman's current animation frame and direction.
	 *
	 * @returns the name of the image file relating to pacman's current animation frame and direction
	 */
	override _getAnimationImage(): string {
		const forwards = PacMan.ANIMATION_DIRECTIONS.FORWARDS;
		const backwards = PacMan.ANIMATION_DIRECTIONS.BACKWARDS;
		const animationDirection = this.animationDirection;

		// increment animation frame so character changes how it looks
		this.animationDirection === forwards ? this._animationFrame++ : this._animationFrame--;

		// if we've reached our max animation frames and the animation is playing forwards, we need to play it backwards
		// now
		if (this._animationFrame === this._MAX_ANIMATION_FRAMES && animationDirection === forwards) {
			this.animationDirection = backwards;
			this._animationFrame--;
		}

		// // if we've reached our lowest animation frames and the animation is playing backwards, we need to play it forwards
		// // now
		if (this._animationFrame === -1 && animationDirection === backwards) {
			this.animationDirection = forwards;
			this._animationFrame++;
		}

		let imageName = `${this.name}-${this._animationFrame}`;

		if (this._animationFrame !== 0) {
			imageName += `-${this.currentDirection}`;
		}

		return imageName;
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
			const currentDirection = this.getCurrentDirection();

			// make sure the key pressed is a valid key that moves PacMan and that he isn't trying to move in the same direction
			// as the one he was just traveling in
			if (!exists(moveCode) || (isMoving && (lastMoveCode === moveCode || currentDirection === moveCode))) {
				return;
			}

			// makes sure this event handler isn't unnecessarily fired more than once per-movement. only setting this to false
			// if our movement key is valid
			this.listenForKeydown = false;

			if (moveCode === MovementDirection.STOP) {
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
				if (PacMan.SPAWN_MOVECODES.includes(moveCode)) {
					this.startMoving(moveCode);
				}

				return;
			}

			if (
				// check if the character has moved in any direction in the past
				!defined(lastMoveCode)
			) {
				return;
			}

			if (
				// check if the character is considered "moving"
				isMoving &&
				// check if the new direction that PacMan is trying to move in is the opposite of the direction
				// he is currently moving in
				moveCode === Character.directionOpposites[currentDirection as keyof typeof Character.directionOpposites]
			) {
				// we don't need to provide the "fromTurn" parameter here since PacMan is only turning around
				// in the opposite direction instead of a 90-degree angle
				this.startMoving(moveCode);

				return;
			}

			const nearestStoppingTurn = this.nearestStoppingTurn;

			if (
				// if all of these are true, PacMan should be considered "stopped" against a wall
				!isMoving &&
				nearestStoppingTurn &&
				Character.canTurnWithMoveDirection(moveCode, nearestStoppingTurn)
			) {
				this.startMoving(moveCode);

				return;
			}

			const position = this.getPosition()!;
			let nearestTurnableTurn: TurnData | undefined;

			// filter down the selection of turns we have to choose from to only the ones "ahead" of PacMan and also directly within the
			// turn threshold
			const filteredTurnData = this.turnData!.filter((turn) => {
				// turns "ahead" of PacMan
				if (this.turnValidators[currentDirection as keyof typeof this.turnValidators](turn, position)) {
					return true;
				}

				// turn within turn threshold
				if (this.isWithinTurnDistance(turn) && Character.canTurnWithMoveDirection(moveCode, turn)) {
					nearestTurnableTurn = turn;

					return true;
				}

				return false;
			});

			// if there is a turnable turn at this moment, just immediately move PacMan in that direction
			if (nearestTurnableTurn) {
				this.startMoving(moveCode, nearestTurnableTurn);

				return;
			}

			// turns are always ordered from left-to-right, starting from the top-left of the board and ending at the bottom-right, so
			// reverse the array here so that when we call "find()" on "filteredTurnData" in order to find the first turn that allows PacMan
			// to turn (given the input moveCode), we find the closest turn to PacMan, instead of a turn that may be at the "start" of the
			// "filteredTurnData" array
			if (currentDirection === MovementDirection.LEFT || currentDirection === MovementDirection.UP) {
				filteredTurnData.reverse();
			}

			// at this point, we know there is not an immediately-available turn to turn at, so find the nearest-available turn that allows our
			// "moveCode"
			nearestTurnableTurn = filteredTurnData.find((turn) => Character.canTurnWithMoveDirection(moveCode, turn));

			// if the nearest turn allows the moveCode that the user has entered, queue the turn for the future since
			// PacMan hasn't arrived in its threshold yet
			if (nearestTurnableTurn) {
				// PacMan is going to move, so set his last move code
				this.lastMoveCode = moveCode;

				this.queueTurn(moveCode, nearestTurnableTurn);
			}
		});

		// listen for user releasing a movement key
		documentBody.addEventListener("keyup", (event) => {
			let moveCode = this.moveCodes[event.code as keyof typeof this.moveCodes];

			// check for user releasing a valid movement key, and let PacMan class know that it can
			// once again start listening for more movement inputs. this prevents user from mashing
			// random movements keys and getting unexpected behavior from the movement listener above
			if (exists(moveCode)) {
				this.listenForKeydown = true;
			}
		});
	}
}
