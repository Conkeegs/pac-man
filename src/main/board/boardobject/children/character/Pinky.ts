import AssetRegistry from "../../../../assets/AssetRegistry.js";
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
		super("pinky", Pinky.PINKY_SPEED, AssetRegistry.getImageSrc("pinky-1-3"));
	}
}
