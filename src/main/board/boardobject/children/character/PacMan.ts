"use strict";

import { defined, die, exists } from "../../../../utils/Utils.js";
import Character, { type StartMoveOptions, type TurnData } from "./Character.js";
import MovementDirection from "./MovementDirection.js";
import type RunsFrameUpdate from "./RunsFrameUpdate.js";
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
export default class PacMan extends Character implements UpdatesAnimationState, RunsFrameUpdate {
	/**
	 * Whether or not PacMan is currently listening for movement inputs.
	 */
	private listenForKeydown: boolean = true;
	/**
	 * The direction (forwards or backwards) that pacman's animation is currently playing in.
	 */
	private animationDirection: ANIMATION_DIRECTION_FORWARDS | ANIMATION_DIRECTION_BACKWARDS = 0;
	/**
	 * This character's nearest turn which does not accept its current movement direction, and "stops" the character from moving.
	 */
	private nearestStoppingTurn: TurnData | undefined;
	/**
	 * Whether or not pacman is spawning.
	 */
	private spawning: boolean = true;
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
	readonly _ANIMATION_STATE_MILLIS: 30 = 30;
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
	 * Overrides `Character.startMoving()` since pacman needs to keep track of whether he's spawning or not.
	 *
	 */
	public override startMoving(direction: MovementDirection, options?: StartMoveOptions): void {
		if (this.spawning) {
			this.spawning = false;
		}

		super.startMoving(direction, options);
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
			if (this.spawning && !defined(lastMoveCode) && isMoving === false) {
				if (PacMan.SPAWN_MOVECODES.includes(moveCode)) {
					this.startMoving(moveCode);
				}

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
				nearestStoppingTurn
			) {
				if (Character.canTurnWithMoveDirection(moveCode, nearestStoppingTurn)) {
					this.startMoving(moveCode);

					return;
				}

				return;
			}

			let thresholdTurn: TurnData | undefined;

			// filter down the selection of turns we have to choose from to only the ones "ahead" of PacMan and also directly within the
			// turn threshold
			const nearestTurnableTurn = this.findNearestTurnWhere(
				(turn) =>
					this.turnValidators[currentDirection as keyof typeof this.turnValidators](
						turn,
						this.getPosition()!
					) && Character.canTurnWithMoveDirection(moveCode, turn),
				(turn) => {
					if (this.isWithinTurnDistance(turn)) {
						thresholdTurn = turn;
					}
				}
			);

			// if there is a turnable turn at this moment, just immediately move PacMan in that direction
			if (thresholdTurn) {
				this.startMoving(moveCode, {
					fromTurn: thresholdTurn,
				});

				return;
			}

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

	/**
	 * @inheritdoc
	 */
	override _runFrameUpdate(): boolean {
		const currentDirection = this.currentDirection!;

		// look for a nearest "stopping" turn after we've made sure that we aren't within a queued-turn's range. this way,
		// pacman doesn't just stop and cancel valid queued-turns.
		// we only need to look for the nearest stopping position once, so we only check for frame "0" here, and we can accurately
		// track when pacman arrives at its "nearestTurn" and stop pacman if he hits a wall. this will also prevent
		// pacman from ever executing a queued-turn when he is technically "behind" a wall
		if (this.frameCount === 0) {
			this.nearestStoppingTurn = this.findNearestTurnWhere(
				(turn) =>
					this.turnValidators[currentDirection as keyof typeof this.turnValidators](
						turn,
						this.getPosition()!
					) && !Character.canTurnWithMoveDirection(currentDirection, turn)
			);
		}

		const nearestStoppingTurn = this.nearestStoppingTurn;

		if (
			nearestStoppingTurn &&
			// check if pacman is within nearest turn's distance (e.g. technically hitting the wall)
			this.isWithinTurnDistance(nearestStoppingTurn)
		) {
			this.stopMoving();
			// snap pacman to "stop" location to keep collision detection consistent
			this.offsetPositionToTurn(nearestStoppingTurn);

			// break out of the recursive animation frame calls so we can stop at pacman's nearest turn
			return true;
		}

		return false;
	}
}
