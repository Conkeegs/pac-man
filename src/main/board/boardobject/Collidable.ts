import type { BoardObject } from "./BoardObject.js";
import type CollidableManager from "./CollidableManager.js";

/**
 * Implies that a `BoardObject` can collide with other `BoardObject`s.
 */
export default interface Collidable extends BoardObject {
	/**
	 * A class that manages logic around the `COLLIDABLES_MAP` for this `BoardObject`
	 * (storing it in the `COLLIDABLES_MAP`, removing it, etc).
	 */
	_collidableManager: CollidableManager;
}
