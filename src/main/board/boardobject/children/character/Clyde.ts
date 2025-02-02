import AssetRegistry from "../../../../assets/AssetRegistry.js";
import Ghost from "./Ghost.js";

/**
 * Represents the `Ghost` named Clyde.
 */
export default class Clyde extends Ghost {
	/**
	 * Default speed of Clyde.
	 */
	private static readonly CLYDE_SPEED: 88 = 88;

	/**
	 * Creates `Clyde`.
	 *
	 */
	constructor() {
		super("clyde", Clyde.CLYDE_SPEED, AssetRegistry.getImageSrc("clyde-1-2"));
	}
}
