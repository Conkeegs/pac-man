"use strict";

import { App } from "../../../../App.js";
import ImageRegistry, { type IMAGE_LIST } from "../../../../assets/ImageRegistry.js";
import { GameElement } from "../../../../GameElement.js";
import MakeListenable from "../../../../mixins/Listenable.js";
import { defined, exists, originalPacManSpeedToNewSpeed } from "../../../../utils/Utils.js";
import { ANIMATION_TYPE } from "../../mixins/Animateable.js";
import type { StartMoveOptions } from "../moveable/Moveable.js";
import Moveable from "../moveable/Moveable.js";
import MovementDirection from "../moveable/MovementDirection.js";
import type Turn from "../Turn.js";
import Blinky from "./Blinky.js";
import Character from "./Character.js";
import Clyde from "./Clyde.js";
import Inky from "./Inky.js";
import Pinky from "./Pinky.js";

/**
 * Represents the PacMan character on the board.
 */
export default class PacMan extends MakeListenable(Character) {
	protected override _collisionHandlers = {
		[PacMan.name]: undefined,
		[Pinky.name]: undefined,
		[Inky.name]: undefined,
		[Blinky.name]: undefined,
		[Clyde.name]: undefined,
	};

	/**
	 * Whether or not PacMan is currently listening for movement inputs.
	 */
	private listenForKeydown: boolean = true;
	/**
	 * Pacman's nearest turn which does not accept its current movement direction, and "stops" pacman from moving.
	 */
	private nearestStoppingTurn: Turn | undefined;
	/**
	 * Whether or not pacman is spawning.
	 */
	private spawning: boolean = true;
	/**
	 * All supported keyboard keys for moving PacMan, mapped to their respective movement directions.
	 */
	private static keyEventDirectionMap = {
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
	 * @inheritdoc
	 */
	override readonly _NUM_ANIMATION_STATES: 3 = 3;
	/**
	 * @inheritdoc
	 */
	override readonly _ANIMATION_STATE_MILLIS: 30 = 30;
	/**
	 * The directions that PacMan can move in upon first spawning.
	 */
	private static readonly SPAWN_MOVECODES: MovementDirection[] = [MovementDirection.RIGHT, MovementDirection.LEFT];
	/**
	 * Default speed of Pacman.
	 */
	private static readonly PACMAN_SPEED: number = originalPacManSpeedToNewSpeed(55);
	/**
	 * @inheritdoc
	 */
	override _animationFrame: 1 | 2 | 3 = 1;

	/**
	 * Creates PacMan.
	 *
	 * @param name unique name of pacman instance, defaults to just "pacman"
	 */
	constructor(name: string = "pacman") {
		super(name, PacMan.PACMAN_SPEED * 0.8, ImageRegistry.getImage("pacman-1"));

		this.createMoveEventListeners();
		this._setAnimationType(ANIMATION_TYPE.LOOP);
	}

	/**
	 * Whether or not pacman is spawning
	 *
	 * @returns boolean indicating whether or not pacman is spawning
	 */
	public isSpawning(): boolean {
		return this.spawning;
	}

	/**
	 * Get the nearest turn that will stop PacMan.
	 *
	 * @returns pacman's nearest turn that will stop him
	 */
	public getNearestStoppingTurn(): Turn | undefined {
		return this.nearestStoppingTurn;
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
	 * @inheritdoc
	 */
	public override tick(): void {
		// we only need to look for the nearest stopping position once, so we only check for frame "0" here, and we can accurately
		// track when pacman arrives at its "nearestTurn" and stop pacman if he hits a wall. this will also prevent
		// pacman from ever executing a queued-turn when he is technically "behind" a wall
		if (this._framesUpdating === 0) {
			this.nearestStoppingTurn = this.findNearestTurnWhere(
				(turn) => !Moveable.canTurnWithMoveDirection(this.currentDirection!, turn)
			);
		}

		super.tick();
	}

	/**
	 * Handle any keys pressed to control pacman's movement.
	 *
	 * @param event keyboard event from user
	 */
	private handleKeyDown(event: Event): void {
		// make sure we are currently listening for movement inputs before continuing and that
		// the game is not paused
		if (this.listenForKeydown === false || App.GAME_PAUSED) {
			return;
		}

		event.stopImmediatePropagation();

		let inputDirection =
			PacMan.keyEventDirectionMap[(event as KeyboardEvent).code as keyof typeof PacMan.keyEventDirectionMap];
		const isMoving = this.isMoving();

		const lastMoveCode = this.lastMoveCode;
		const currentDirection = this.getCurrentDirection();

		// make sure the key pressed is a valid key that moves PacMan and that he isn't trying to move in the same direction
		// as the one he was just traveling in
		if (
			!exists(inputDirection) ||
			(isMoving && (lastMoveCode === inputDirection || currentDirection === inputDirection))
		) {
			return;
		}

		// makes sure this event handler isn't unnecessarily fired more than once per-movement. only setting this to false
		// if our movement key is valid
		this.listenForKeydown = false;

		// let PacMan immediately start moving (left or right) if he has just spawned
		if (this.spawning && !defined(lastMoveCode) && isMoving === false) {
			if (PacMan.SPAWN_MOVECODES.includes(inputDirection)) {
				this.startMoving(inputDirection);
			}

			return;
		}

		if (
			// check if the character is considered "moving"
			isMoving &&
			// check if the new direction that PacMan is trying to move in is the opposite of the direction
			// he is currently moving in
			inputDirection ===
				Character.directionOpposites[currentDirection as keyof typeof Character.directionOpposites]
		) {
			// we don't need to provide the "fromTurn" parameter here since PacMan is only turning around
			// in the opposite direction instead of a 90-degree angle
			this.startMoving(inputDirection);

			return;
		}

		const nearestStoppingTurn = this.nearestStoppingTurn;

		if (
			// if all of these are true, PacMan should be considered "stopped" against a wall
			!isMoving &&
			nearestStoppingTurn
		) {
			if (Character.canTurnWithMoveDirection(inputDirection, nearestStoppingTurn)) {
				this.startMoving(inputDirection);

				return;
			}

			// if stopped against a wall and user attempts to turn in another direction that also
			// hits a wall, update the way pacman is facing for convenience
			this.setCurrentDirection(inputDirection);
			this._updateAnimationImage(this._getCurrentAnimationImageName());

			return;
		}

		// filter down the selection of turns we have to choose from to only the ones "ahead" of PacMan and also directly within the
		// turn threshold
		const nearestTurnableTurn = this.findNearestTurnWhere((turn) =>
			Moveable.canTurnWithMoveDirection(inputDirection, turn)
		);

		// if the nearest turn allows the moveCode that the user has entered, queue the turn for the future since
		// PacMan hasn't arrived in its threshold yet
		if (nearestTurnableTurn) {
			// if there is a turnable turn at this moment, just immediately move PacMan in that direction
			if (GameElement.positionsEqual(this.getCenterPosition(), nearestTurnableTurn.getCenterPosition())) {
				this.startMoving(inputDirection, {
					fromTurn: nearestTurnableTurn,
				});

				return;
			}

			// PacMan is going to move, so set his last move code
			this.lastMoveCode = inputDirection;

			this.queueTurn(inputDirection, nearestTurnableTurn);
		}
	}

	/**
	 * Handle user letting go of keyboard key so pacman can once again listen for movement keys.
	 *
	 * @param event keyboard event from user
	 */
	private handleKeyUp(event: Event): void {
		let moveCode =
			PacMan.keyEventDirectionMap[(event as KeyboardEvent).code as keyof typeof PacMan.keyEventDirectionMap];

		// check for user releasing a valid movement key, and let PacMan class know that it can
		// once again start listening for more movement inputs. this prevents user from mashing
		// random movements keys and getting unexpected behavior from the movement listener above
		if (exists(moveCode)) {
			this.listenForKeydown = true;
		}
	}

	/**
	 * DOM event listeners that allow the user to control PacMan.
	 */
	private createMoveEventListeners() {
		const documentBody = document.body;

		// listen for movement keys for PacMan
		this._addEventListener("keydown", this.handleKeyDown.bind(this), documentBody);
		// listen for user releasing a movement key
		this._addEventListener("keyup", this.handleKeyUp.bind(this), documentBody);
	}

	/**
	 * @inheritdoc
	 */
	override _getCurrentAnimationImageName(): keyof IMAGE_LIST {
		let imageName = this.defaultAnimationImageName();

		if (this._animationFrame !== 1) {
			imageName += `-${this.currentDirection}`;
		}

		return imageName as keyof IMAGE_LIST;
	}
}
