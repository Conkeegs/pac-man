import AssetRegistry from "../../../../assets/AssetRegistry.js";
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
		super("blinky", Blinky.BLINKY_SPEED, AssetRegistry.getImageSrc("blinky-1-0"));
	}
}
