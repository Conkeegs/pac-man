import Ghost from "./Ghost.js";

/**
 * Represents the `Ghost` named Blinky.
 */
export default class Blinky extends Ghost {
	/**
	 * Creates `Blinky`.
	 *
	 * @param name
	 * @param speed
	 * @param source
	 */
	constructor(name: string, speed: number, source: string) {
		super(name, speed, source);
	}
}
