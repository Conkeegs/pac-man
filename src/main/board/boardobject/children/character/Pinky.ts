import ImageRegistry from "../../../../assets/ImageRegistry.js";
import Ghost from "./Ghost.js";

/**
 * Represents the `Ghost` named Pinky.
 */
export default class Pinky extends Ghost {
	/**
	 * Default speed of Pinky.
	 */
	private static readonly PINKY_SPEED: 88 = 88;

	/**
	 * Creates `Pinky`.
	 *
	 */
	constructor() {
		super("pinky", Pinky.PINKY_SPEED, ImageRegistry.getImage("pinky-0-3"));
	}
}
