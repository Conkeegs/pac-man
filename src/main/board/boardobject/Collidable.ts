import type { BoardObject } from "./BoardObject.js";
import type CollidableManager from "./CollidableManager.js";

/**
 * Implies that a `BoardObject` can collide with other `BoardObject`s.
 */
export default interface Collidable extends BoardObject {
	/**
	 * The types of `BoardObject`s that can collide with this collidable.
	 */
	canBeCollidedByTypes: string[];

	/**
	 * A class that manages logic around the `COLLIDABLES_MAP` for this `BoardObject`
	 * (storing it in the `COLLIDABLES_MAP`, removing it, etc).
	 */
	_collidableManager: CollidableManager;
	/**
	 * Logic that executes when this collidable is collided with.
	 *
	 * @param withCollidable the `Collidable` that has collided with this collidable
	 *
	 * @returns boolean to optionally break out of `tick()`
	 */
	_onCollision(withCollidable: Collidable): boolean;
}
