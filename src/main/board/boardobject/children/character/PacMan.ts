"use strict";

import AssetRegistry, { type ASSET_LIST } from "../../../../assets/AssetRegistry.js";
import { defined, originalPacManSpeedToNewSpeed } from "../../../../utils/Utils.js";
import { ANIMATION_TYPE } from "../../mixins/Animateable.js";
import type { Collidable } from "../../mixins/Collidable.js";
import MakeControllable from "../moveable/mixins/Controllable.js";
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
export default class PacMan extends MakeControllable(Character) {
	/**
	 * Whether or not pacman is spawning.
	 */
	private spawning: boolean = true;
	/**
	 * The current `Turn` this pacman is stopped at.
	 */
	private stoppedAtTurn: Turn | undefined;
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

	public override canBeCollidedByTypes: string[] = [PacMan.name, Blinky.name, Clyde.name, Inky.name, Pinky.name];

	/**
	 * Creates PacMan.
	 *
	 * @param name unique name of pacman instance, defaults to just "pacman"
	 */
	constructor(name: string = "pacman") {
		super(name, PacMan.PACMAN_SPEED * 0.8, AssetRegistry.getImageSrc("pacman-1"));

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
	 * Set the current `Turn` this pacman is stopped at.
	 */
	public setStoppedAtTurn(turn: Turn): void {
		this.stoppedAtTurn = turn;
	}

	/**
	 * Overrides `Character.startMoving()` since pacman needs to keep track of whether he's spawning or not.
	 *
	 */
	public override startMoving(direction: MovementDirection, options?: StartMoveOptions): void {
		if (this.spawning) {
			this.spawning = false;
		}

		this.stoppedAtTurn = undefined;

		super.startMoving(direction, options);
	}

	/**
	 * Handles input form the player for this pacman's movement.
	 *
	 * @param currentInputCode the current input key from the player
	 */
	public override handleInput(currentInputCode: string): void {
		super.handleInput(currentInputCode);

		const currentInputDirection = this.getCurrentInputDirection();

		if (!defined(currentInputDirection)) {
			return;
		}

		const stoppedAtTurn = this.stoppedAtTurn;

		if (
			// PacMan should be considered "stopped" against a wall
			stoppedAtTurn &&
			Moveable.canTurnWithMoveDirection(currentInputDirection, stoppedAtTurn)
		) {
			this.startMoving(currentInputDirection);

			return;
		}

		// let PacMan immediately start moving (left or right) if he has just spawned
		if (this.spawning && PacMan.SPAWN_MOVECODES.includes(currentInputDirection)) {
			this.startMoving(currentInputDirection);

			return;
		}
	}

	/**
	 * @inheritdoc
	 */
	override _getCurrentAnimationImageName(): keyof ASSET_LIST["image"] {
		let imageName = this.defaultAnimationImageName();

		if (this._animationFrame !== 1) {
			imageName += `-${this.currentDirection}`;
		}

		return imageName as keyof ASSET_LIST["image"];
	}

	override onCollision(withCollidable: Collidable): void {
		// withCollidable.stopMoving();
		// this.stopMoving();
		// console.log("DEAD!!!");
	}
}
