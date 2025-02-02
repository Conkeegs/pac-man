import AssetRegistry from "../../../../assets/AssetRegistry.js";
import Ghost from "./Ghost.js";

/**
 * Represents the `Ghost` named Inky.
 */
export default class Inky extends Ghost {
	/**
	 * Default speed of Inky.
	 */
	private static readonly INKY_SPEED: 88 = 88;

	/**
	 * Creates `Inky`.
	 *
	 */
	constructor() {
		super("inky", Inky.INKY_SPEED, AssetRegistry.getImageSrc("inky-1-2"));
	}
}
