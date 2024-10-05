import { COLLIDABLES_MAP } from "../../utils/Globals.js";
import { defined } from "../../utils/Utils.js";
import Board from "../Board.js";
import type Collidable from "./Collidable.js";

/**
 * Manages logic around the `COLLIDABLES_MAP` object for `Collidable` boardobjects.
 */
export default class CollidableManager {
	/**
	 * The `Collidable` `BoardObject` class.
	 */
	private collidable: Collidable;
	/**
	 * The current key into the `COLLIDABLES_MAP` that this collidable is under.
	 */
	private currentPositionKey: string | undefined;

	constructor(collidable: Collidable) {
		this.collidable = collidable;
	}

	/**
	 * Every `BoardObject` class that implements the `Collidable` interface should call this method every time
	 * they update their position. This makes sure that the `COLLIDABLES_MAP` stores `collidable` in its own "group",
	 * based on its current x and y position. This reduces the number of `BoardObject`s we need to run collision detection
	 * against.
	 *
	 */
	public updateTileKeys(): void {
		const collidable = this.collidable;
		const newCollidablePositionKey = this.getCollidablePositionKey();
		this.currentPositionKey = newCollidablePositionKey;

		// create a new mapping for the new position, if there isn't one yet
		if (!defined(COLLIDABLES_MAP[newCollidablePositionKey])) {
			COLLIDABLES_MAP[newCollidablePositionKey] = [];
		}

		// make sure we remove any existing references to "collidable" in the map,since it's
		// now moving to a different location in the map
		this.checkForCollidableAndRemove();
		// push "collidable" into its own position-based group
		COLLIDABLES_MAP[newCollidablePositionKey]!.push(collidable);
	}

	/**
	 * Checks that `collidable` doesn't already have a mapping in the `COLLIDABLES_MAP`, and removes it if it does.
	 */
	public checkForCollidableAndRemove(): void {
		const currentPositionKey = this.currentPositionKey;

		if (!currentPositionKey) {
			return;
		}

		const collidable = this.collidable;
		let positionCollidables = COLLIDABLES_MAP[currentPositionKey];

		if (defined(positionCollidables) && positionCollidables!.includes(collidable)) {
			COLLIDABLES_MAP[currentPositionKey]!.splice(positionCollidables!.indexOf(collidable), 1);
		}
	}

	/**
	 * This will create a properly-formatted key into the `COLLIDABLES_MAP` based on this collidable's `Position`.
	 *
	 * @returns a properly-formatted key into the `COLLIDABLES_MAP`
	 */
	private getCollidablePositionKey(): string {
		const centerPosition = this.collidable.getCenterPosition();

		return `${Board.calcTileNumX(centerPosition.x)}-${Board.calcTileNumY(centerPosition.y)}`;
	}
}
