import { BoardObject } from "../../BoardObject.ts";
import MovementDirection from "./MovementDirection.ts";

/**
 * Depending on which direction a character is moving in, this object holds methods which
 * will change the character's CSS `transform` value and also set it in memory.
 */
type MovementMethods = {
	[key in MovementDirection.LEFT | MovementDirection.RIGHT | MovementDirection.UP | MovementDirection.DOWN]: (
		/**
		 * The amount of pixels to change the `translateX` or `translateY` value (negative or positive).
		 */
		amount: number
	) => void;
};

export default abstract class Moveable extends BoardObject {
	/**
	 * The speed of the board object (in pixels-per-second).
	 */
	abstract readonly _speed: number;
	/**
	 * The number of pixels this board object moves per-frame.
	 */
	abstract readonly _distancePerFrame: number;
	/**
	 * Determines if the characters is currently moving.
	 */
	private moving: boolean = false;
	/**
	 * Holds methods which will change the character's CSS `transform` value and also set it in memory.
	 */
	private movementMethods: MovementMethods = {
		[MovementDirection.LEFT]: this.moveLeft,
		[MovementDirection.RIGHT]: this.moveRight,
		[MovementDirection.UP]: this.moveUp,
		[MovementDirection.DOWN]: this.moveDown,
	};
}
