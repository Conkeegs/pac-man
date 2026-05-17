"use strict";

import { SPRITE_SHEET_TILE_DIMENSIONS, type SpriteSheetData } from "../../assets/SpriteSheetHandler.js";
import { TILESIZE } from "../../utils/Globals.js";
import { defined } from "../../utils/Utils.js";
import { ANIMATION_TYPE } from "../mixins/Animateable.js";
import type { Collidable } from "../mixins/Collidable.js";
import MakeControllable from "../moveable/mixins/Controllable.js";
import Moveable from "../moveable/Moveable.js";
import MovementDirection from "../moveable/MovementDirection.js";
import Turn from "../Turn.js";
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
	override readonly _ANIMATION_STATE_MILLIS: 20 = 20;
	/**
	 * The directions that PacMan can move in upon first spawning.
	 */
	private static readonly SPAWN_MOVECODES: MovementDirection[] = [MovementDirection.RIGHT, MovementDirection.LEFT];
	/**
	 * Default speed of Pacman.
	 */
	private static readonly PACMAN_SPEED: number = 0.15625 * TILESIZE;
	private static readonly PACMAN_SPRITE_DIMENSIONS: 13 = 13;

	public override canBeCollidedByTypes: string[] = [PacMan.name, Blinky.name, Clyde.name, Inky.name, Pinky.name];

	/**
	 * Creates PacMan.
	 *
	 * @param name unique name of pacman instance, defaults to just "pacman"
	 */
	constructor(name: string = "pacman") {
		super(name, PacMan.PACMAN_SPEED * 0.8);

		this._setAnimationType(ANIMATION_TYPE.LOOP);
		this.spriteSheetHandler.setSpriteImage(this.PACMAN_MOUTH_CLOSED_ANIMATION_STATE);
	}

	/**
	 * Animation state for when pacman has his mouth closed.
	 */
	private get PACMAN_MOUTH_CLOSED_ANIMATION_STATE(): SpriteSheetData {
		return {
			x:
				Character.CHARACTER_SPRITE_SHEET_OFFSET_X +
				2 * SPRITE_SHEET_TILE_DIMENSIONS +
				Character.CHARACTER_SPRITE_OFFSET,
			y: Character.CHARACTER_SPRITE_OFFSET,
			width: PacMan.PACMAN_SPRITE_DIMENSIONS,
			height: PacMan.PACMAN_SPRITE_DIMENSIONS,
		};
	}

	/**
	 * @inheritdoc
	 */
	override get _ANIMATION_STATE_SETS() {
		return {
			default: [
				// mouth closed
				this.PACMAN_MOUTH_CLOSED_ANIMATION_STATE,
			],
			[MovementDirection.RIGHT]: [
				this.PACMAN_MOUTH_CLOSED_ANIMATION_STATE,
				// moving right and mouth half open
				{
					x:
						Character.CHARACTER_SPRITE_SHEET_OFFSET_X +
						SPRITE_SHEET_TILE_DIMENSIONS +
						Character.CHARACTER_SPRITE_OFFSET,
					y: Character.CHARACTER_SPRITE_OFFSET,
					width: PacMan.PACMAN_SPRITE_DIMENSIONS,
					height: PacMan.PACMAN_SPRITE_DIMENSIONS,
				},
				// moving right and mouth all the way open
				{
					x: Character.CHARACTER_SPRITE_SHEET_OFFSET_X + Character.CHARACTER_SPRITE_OFFSET,
					y: Character.CHARACTER_SPRITE_OFFSET,
					width: PacMan.PACMAN_SPRITE_DIMENSIONS,
					height: PacMan.PACMAN_SPRITE_DIMENSIONS,
				},
			],
			[MovementDirection.LEFT]: [
				this.PACMAN_MOUTH_CLOSED_ANIMATION_STATE,
				// moving left and mouth half open
				{
					x:
						SPRITE_SHEET_TILE_DIMENSIONS +
						Character.CHARACTER_SPRITE_SHEET_OFFSET_X +
						Character.CHARACTER_SPRITE_OFFSET,
					y: SPRITE_SHEET_TILE_DIMENSIONS + Character.CHARACTER_SPRITE_OFFSET,
					width: PacMan.PACMAN_SPRITE_DIMENSIONS,
					height: PacMan.PACMAN_SPRITE_DIMENSIONS,
				},
				// moving left and mouth all the way open
				{
					x: Character.CHARACTER_SPRITE_SHEET_OFFSET_X + Character.CHARACTER_SPRITE_OFFSET,
					y: SPRITE_SHEET_TILE_DIMENSIONS + Character.CHARACTER_SPRITE_OFFSET,
					width: PacMan.PACMAN_SPRITE_DIMENSIONS,
					height: PacMan.PACMAN_SPRITE_DIMENSIONS,
				},
			],
			[MovementDirection.UP]: [
				this.PACMAN_MOUTH_CLOSED_ANIMATION_STATE,
				// moving up and mouth half open
				{
					x:
						SPRITE_SHEET_TILE_DIMENSIONS +
						Character.CHARACTER_SPRITE_SHEET_OFFSET_X +
						Character.CHARACTER_SPRITE_OFFSET,
					y: SPRITE_SHEET_TILE_DIMENSIONS * 2 + Character.CHARACTER_SPRITE_OFFSET,
					width: PacMan.PACMAN_SPRITE_DIMENSIONS,
					height: PacMan.PACMAN_SPRITE_DIMENSIONS,
				},
				// moving up and mouth all the way open
				{
					x: Character.CHARACTER_SPRITE_SHEET_OFFSET_X + Character.CHARACTER_SPRITE_OFFSET,
					y: SPRITE_SHEET_TILE_DIMENSIONS * 2 + Character.CHARACTER_SPRITE_OFFSET,
					width: PacMan.PACMAN_SPRITE_DIMENSIONS,
					height: PacMan.PACMAN_SPRITE_DIMENSIONS,
				},
			],
			[MovementDirection.DOWN]: [
				this.PACMAN_MOUTH_CLOSED_ANIMATION_STATE,
				// moving down and mouth half open
				{
					x:
						SPRITE_SHEET_TILE_DIMENSIONS +
						Character.CHARACTER_SPRITE_SHEET_OFFSET_X +
						Character.CHARACTER_SPRITE_OFFSET,
					y: SPRITE_SHEET_TILE_DIMENSIONS * 3 + Character.CHARACTER_SPRITE_OFFSET,
					width: PacMan.PACMAN_SPRITE_DIMENSIONS,
					height: PacMan.PACMAN_SPRITE_DIMENSIONS,
				},
				// moving down and mouth all the way open
				{
					x: Character.CHARACTER_SPRITE_SHEET_OFFSET_X + Character.CHARACTER_SPRITE_OFFSET,
					y: SPRITE_SHEET_TILE_DIMENSIONS * 3 + Character.CHARACTER_SPRITE_OFFSET,
					width: PacMan.PACMAN_SPRITE_DIMENSIONS,
					height: PacMan.PACMAN_SPRITE_DIMENSIONS,
				},
			],
		};
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
	public override startMoving(direction: MovementDirection): void {
		if (this.spawning) {
			this.spawning = false;
		}

		this.stoppedAtTurn = undefined;

		super.startMoving(direction);
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

	override onCollision(withCollidable: Collidable): void {
		// withCollidable.stopMoving();
		// this.stopMoving();
		// console.log("DEAD!!!");
	}
}
