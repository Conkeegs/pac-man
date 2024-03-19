import Ghost from "./Ghost.js";

/**
 * Represents the `Ghost` named Clyde.
 */
export default class Clyde extends Ghost {
	/**
	 * Creates `Clyde`.
	 *
	 * @param name
	 * @param speed
	 * @param source
	 */
	constructor(name: string, speed: number, source: string) {
		super(name, speed, source);
	}
}
