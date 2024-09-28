import { COLLIDABLES_MAP } from "../../utils/Globals.js";
import { defined } from "../../utils/Utils.js";
import Board from "../Board.js";
import { type Position } from "./BoardObject.js";
import type Collidable from "./Collidable.js";

/**
 * Manages logic around the `COLLIDABLES_MAP` object for `Collidable` boardobjects.
 */
export default class CollidableManager {
	/**
	 * The `Collidable` `BoardObject` class.
	 */
	private collidable: Collidable;

	constructor(collidable: Collidable) {
		this.collidable = collidable;
	}

	/**
	 * Every `BoardObject` class that implements the `Collidable` interface should call this method every time
	 * they update their position. This makes sure that the `COLLIDABLES_MAP` stores `collidable` in its own "group",
	 * based on its current x and y position. This reduces the number of `BoardObject`s we need to run collision detection
	 * against.
	 *
	 * @param newPosition the new position of `collidable`
	 */
	public updateTileKeys(newPosition: Position): void {
		const collidable = this.collidable;
		const currentPosition = collidable.getPosition();
		const newCollidablePositionKey = this.getCollidablePositionKey(newPosition);

		// create a new mapping for the new position, if there isn't one yet
		if (!defined(COLLIDABLES_MAP[newCollidablePositionKey])) {
			COLLIDABLES_MAP[newCollidablePositionKey] = [];
		}

		const halfCollidableWidth = collidable.getWidth()! / 2;
		const halfCollidableHeight = collidable.getHeight()! / 2;
		const currentTileX = Board.calcTileNumX(currentPosition.x + halfCollidableWidth);
		const currentTileY = Board.calcTileNumY(currentPosition.y + halfCollidableHeight);
		const newTileX = Board.calcTileNumX(newPosition.x + halfCollidableWidth);
		const newTileY = Board.calcTileNumY(newPosition.y + halfCollidableHeight);

		if (currentTileX !== newTileX || currentTileY !== newTileY) {
			// make sure we remove any existing references to "collidable" in the map, if it already exists,
			// since it's now moving to a different location in the map
			this.checkForCollidableAndRemove();

			// push "collidable" into its own position-based group
			COLLIDABLES_MAP[newCollidablePositionKey]!.push(collidable);
		}
	}

	/**
	 * Checks that `collidable` doesn't already have a mapping in the `COLLIDABLES_MAP`, and removes it if it does.
	 */
	public checkForCollidableAndRemove(): void {
		const collidable = this.collidable;
		const currentCollidablePositionKey = this.getCollidablePositionKey(collidable.getPosition());
		let positionCollidables = COLLIDABLES_MAP[currentCollidablePositionKey];

		if (defined(positionCollidables) && positionCollidables!.includes(collidable)) {
			COLLIDABLES_MAP[currentCollidablePositionKey]!.splice(positionCollidables!.indexOf(collidable), 1);
		}
	}

	/**
	 * Given a `Position`, this will create a properly-formatted key into the `COLLIDABLES_MAP`.
	 *
	 * @param position the position to create the key out of
	 * @returns a properly-formatted key into the `COLLIDABLES_MAP`
	 */
	private getCollidablePositionKey(position: Position): string {
		const collidable = this.collidable;

		return `${Board.calcTileNumX(position.x + collidable.getWidth()! / 2)}-${Board.calcTileNumY(
			position.y + collidable.getHeight()! / 2
		)}`;
	}
}
