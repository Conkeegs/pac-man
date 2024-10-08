import { COLLIDABLES_MAP } from "../../utils/Globals.js";
import { defined } from "../../utils/Utils.js";
import Board from "../Board.js";
import type Collidable from "./Collidable.js";

/**
 * Represents the positions of the sides of a collision box for a
 * `Collidable` instance.
 */
type CollisionBox = {
	left: number;
	right: number;
	top: number;
	bottom: number;
};

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
	/**
	 * The percent (out of 100) that the size of this collidable's collision
	 * box will be, compared to its width and height.
	 */
	private collisionBoxPercentage: number;

	/**
	 *
	 * @param collidable the board object implementing `Collidable` to manage logic around
	 * @param collisionBoxPercentage a percent (out of 100) that the size of this collidable's collision
	 * box will be, compared to its width and height. defaults to `100` for 100% of the collidable's size
	 */
	constructor(collidable: Collidable, collisionBoxPercentage: number | undefined = 100) {
		this.collidable = collidable;
		this.collisionBoxPercentage = collisionBoxPercentage;
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
	 * Gets the current position of this collidable's collision box, based on the collidable's position.
	 *
	 * @returns positions of the collision box's sides
	 */
	public getCollisionBox(): CollisionBox {
		const collidable = this.collidable;
		const collisionSizeMultiplier = this.collisionBoxPercentage / 100;
		const collidablePosition = collidable.getPosition();
		const collidablePositionX = collidablePosition.x;
		const collidableWidth = collidable.getWidth();
		const collidableWidthFraction = collidableWidth * collisionSizeMultiplier;
		const collidablePositionY = collidablePosition.y;
		const collidableHeight = collidable.getHeight();
		const collidableHeightFraction = collidableHeight * collisionSizeMultiplier;

		return {
			left: collidablePositionX + collidableWidthFraction,
			right: collidablePositionX + collidableWidth - collidableWidthFraction,
			top: collidablePositionY + collidableHeightFraction,
			bottom: collidablePositionY + collidableHeight - collidableHeightFraction,
		};
	}

	/**
	 * Determines if this collidable is colliding with another `BoardObject`.
	 *
	 * @param collidable the `Collidable` this collidable might be colliding with
	 * @returns boolean indicating if the two are colliding
	 */
	public isCollidingWithCollidable(collidable: Collidable): boolean {
		const collisionBox = this.getCollisionBox();
		const collidableCollisionBox = collidable._collidableManager.getCollisionBox();
		const left = collisionBox.left;
		const top = collisionBox.top;
		const collidableLeft = collidableCollisionBox.left;
		const collidableRight = collidableCollisionBox.right;
		const collidableTop = collidableCollisionBox.top;

		if (
			// right side past left side
			left + (collisionBox.right - left) >= collidableLeft &&
			// left side past right side
			left <= collidableLeft + (collidableRight - collidableLeft) &&
			// top side past bottom side
			top + (collisionBox.bottom - top) >= collidableTop &&
			// bottom side past top side
			top <= collidableTop + (collidableCollisionBox.bottom - collidableTop)
		) {
			return true;
		}

		return false;
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
