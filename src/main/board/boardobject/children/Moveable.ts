import { BoardObject } from "../BoardObject.ts";

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
	abstract _moving: boolean;
}
