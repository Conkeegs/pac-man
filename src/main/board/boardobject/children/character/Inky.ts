import Ghost from "./Ghost.js";

/**
 * Represents the `Ghost` named Inky.
 */
export default class Inky extends Ghost {
	/**
	 * Creates `Inky`.
	 *
	 * @param name
	 * @param speed
	 * @param source
	 */
	constructor(name: string, speed: number, source: string) {
		super(name, speed, source);
	}
}
