import Ghost from "./Ghost.js";

/**
 * Represents the `Ghost` named Pinky.
 */
export default class Pinky extends Ghost {
	/**
	 * Creates `Pinky`.
	 *
	 * @param name
	 * @param speed
	 * @param source
	 */
	constructor(name: string, speed: number, source: string) {
		super(name, speed, source);
	}
}
