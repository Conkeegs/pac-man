import { SPRITE_SHEET_TILE_DIMENSIONS, type AnimationState } from "../mixins/Animateable.js";
import MovementDirection from "../moveable/MovementDirection.js";
import Character from "./Character.js";
import Ghost from "./Ghost.js";

/**
 * Represents the `Ghost` named Blinky.
 */
export default class Blinky extends Ghost {
	/**
	 * Default speed of Blinky.
	 */
	private static readonly BLINKY_SPEED: 88 = 88;

	/**
	 * Creates `Blinky`.
	 *
	 */
	constructor() {
		super("blinky", Blinky.BLINKY_SPEED);
	}

	/**
	 * Animation states for blinky is facing left.
	 */
	private get BLINKY_LEFT_ANIMATION_STATES(): AnimationState[] {
		return [
			// looking left, first state
			{
				x:
					Character.CHARACTER_SPRITE_SHEET_OFFSET_X +
					SPRITE_SHEET_TILE_DIMENSIONS * 2 +
					Character.CHARACTER_SPRITE_OFFSET,
				y: SPRITE_SHEET_TILE_DIMENSIONS * 4 + Character.CHARACTER_SPRITE_OFFSET,
				width: Ghost.GHOST_SPRITE_DIMENSIONS,
				height: Ghost.GHOST_SPRITE_DIMENSIONS,
			},
			// looking left, second state
			{
				x:
					Character.CHARACTER_SPRITE_SHEET_OFFSET_X +
					SPRITE_SHEET_TILE_DIMENSIONS * 3 +
					Character.CHARACTER_SPRITE_OFFSET,
				y: SPRITE_SHEET_TILE_DIMENSIONS * 4 + Character.CHARACTER_SPRITE_OFFSET,
				width: Ghost.GHOST_SPRITE_DIMENSIONS,
				height: Ghost.GHOST_SPRITE_DIMENSIONS,
			},
		];
	}

	/**
	 * @inheritdoc
	 */
	override get _ANIMATION_STATE_SETS() {
		return {
			default: this.BLINKY_LEFT_ANIMATION_STATES,
			[MovementDirection.LEFT]: this.BLINKY_LEFT_ANIMATION_STATES,
			[MovementDirection.RIGHT]: [
				// looking right, first state
				{
					x: Character.CHARACTER_SPRITE_SHEET_OFFSET_X + Character.CHARACTER_SPRITE_OFFSET,
					y: SPRITE_SHEET_TILE_DIMENSIONS * 4 + Character.CHARACTER_SPRITE_OFFSET,
					width: Ghost.GHOST_SPRITE_DIMENSIONS,
					height: Ghost.GHOST_SPRITE_DIMENSIONS,
				},
				// looking right, second state
				{
					x:
						Character.CHARACTER_SPRITE_SHEET_OFFSET_X +
						SPRITE_SHEET_TILE_DIMENSIONS +
						Character.CHARACTER_SPRITE_OFFSET,
					y: SPRITE_SHEET_TILE_DIMENSIONS * 4 + Character.CHARACTER_SPRITE_OFFSET,
					width: Ghost.GHOST_SPRITE_DIMENSIONS,
					height: Ghost.GHOST_SPRITE_DIMENSIONS,
				},
			],
			[MovementDirection.UP]: [
				// looking up, first state
				{
					x:
						Character.CHARACTER_SPRITE_SHEET_OFFSET_X +
						SPRITE_SHEET_TILE_DIMENSIONS * 4 +
						Character.CHARACTER_SPRITE_OFFSET,
					y: SPRITE_SHEET_TILE_DIMENSIONS * 4 + Character.CHARACTER_SPRITE_OFFSET,
					width: Ghost.GHOST_SPRITE_DIMENSIONS,
					height: Ghost.GHOST_SPRITE_DIMENSIONS,
				},
				// looking up, second state
				{
					x:
						Character.CHARACTER_SPRITE_SHEET_OFFSET_X +
						SPRITE_SHEET_TILE_DIMENSIONS * 5 +
						Character.CHARACTER_SPRITE_OFFSET,
					y: SPRITE_SHEET_TILE_DIMENSIONS * 4 + Character.CHARACTER_SPRITE_OFFSET,
					width: Ghost.GHOST_SPRITE_DIMENSIONS,
					height: Ghost.GHOST_SPRITE_DIMENSIONS,
				},
			],
			[MovementDirection.DOWN]: [
				// looking down, first state
				{
					x:
						Character.CHARACTER_SPRITE_SHEET_OFFSET_X +
						SPRITE_SHEET_TILE_DIMENSIONS * 6 +
						Character.CHARACTER_SPRITE_OFFSET,
					y: SPRITE_SHEET_TILE_DIMENSIONS * 4 + Character.CHARACTER_SPRITE_OFFSET,
					width: Ghost.GHOST_SPRITE_DIMENSIONS,
					height: Ghost.GHOST_SPRITE_DIMENSIONS,
				},
				// looking down, second state
				{
					x:
						Character.CHARACTER_SPRITE_SHEET_OFFSET_X +
						SPRITE_SHEET_TILE_DIMENSIONS * 7 +
						Character.CHARACTER_SPRITE_OFFSET,
					y: SPRITE_SHEET_TILE_DIMENSIONS * 4 + Character.CHARACTER_SPRITE_OFFSET,
					width: Ghost.GHOST_SPRITE_DIMENSIONS,
					height: Ghost.GHOST_SPRITE_DIMENSIONS,
				},
			],
		};
	}
}
