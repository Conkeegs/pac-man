import { App } from "../../../../App.js";
import type { Position } from "../../../../GameElement.js";
import type { AbstractConstructor } from "../../../../types.js";
import { defined } from "../../../../utils/Utils.js";
import Board from "../../../Board.js";
import { BoardObject } from "../../BoardObject.js";

/**
 * Represents the positions of the sides of a collision box for a
 * `Collidable` instance.
 */
type CollisionBox = {
	/**
	 * X-coordinate of the left-most side.
	 */
	left: number;
	/**
	 * X-coordinate of the right-most side.
	 */
	right: number;
	/**
	 * Y-coordinate of the top-most side.
	 */
	top: number;
	/**
	 * Y-coordinate of the bottom-most side.
	 */
	bottom: number;
};

/**
 * Gives `BoardObject` instances functionality that allows them to properly "collide" with
 * other board objects on the board.
 */
export type Collidable = InstanceType<ReturnType<typeof MakeCollidable<typeof BoardObject>>>;

/**
 * Gives `BoardObject` instances functionality that allows it to properly "collide" with
 * other board objects on the board.
 *
 * @param Base a `BoardObject` instance
 * @param collisionBoxPercentage percent (out of 100) of board object's size that
 * its collision box will be
 * @returns a `BoardObject` that is considered "collidable" in the game's physics
 */
export default function MakeCollidable<TBase extends AbstractConstructor<BoardObject>>(
	Base: TBase,
	collisionBoxPercentage: number | undefined = 100
) {
	abstract class CollidableClass extends Base {
		/**
		 * The current key into the `COLLIDABLES_MAP` that this collidable is under.
		 */
		_currentTileKeys: string[] = [];
		/**
		 * The percent (out of 100) that the size of this collidable's collision
		 * box will be, compared to its width and height.
		 */
		_collisionBoxPercentage: number;

		/**
		 * The types of `BoardObject` sub-classes that this collidable can
		 * be "collided by".
		 */
		public abstract canBeCollidedByTypes: string[];

		/**
		 * Creates a `CollidableClass` instance.
		 *
		 * @param args arguments passed to the board object's constructor
		 */
		constructor(...args: any[]) {
			super(...args);

			this._collisionBoxPercentage = collisionBoxPercentage;

			App.COLLIDABLES.push(this);
		}

		/**
		 * Get the current tile keys that this collidable's collision box
		 * is located in.
		 *
		 * @returns current tile keys that this collidable's collision box
		 * is located in
		 */
		public getCurrentTileKeys(): string[] {
			return this._currentTileKeys;
		}

		/**
		 * Gets the current position of this collidable's collision box, based on the collidable's position.
		 *
		 * @returns positions of the collision box's sides
		 */
		public getCollisionBox(): CollisionBox {
			const collisionBoxPercentage = this._collisionBoxPercentage;
			const width = this.getWidth();
			const height = this.getHeight();
			const paddingHorizontal = (width - (width * collisionBoxPercentage) / 100) / 2;
			const paddingVertical = (height - (height * collisionBoxPercentage) / 100) / 2;
			const collidablePosition = this.getPosition();
			const collidablePositionX = collidablePosition.x;
			const collidablePositionY = collidablePosition.y;

			return {
				left: collidablePositionX + paddingHorizontal,
				right: collidablePositionX + width - paddingHorizontal,
				top: collidablePositionY + paddingVertical,
				bottom: collidablePositionY + height - paddingVertical,
			};
		}

		/**
		 * @inheritdoc
		 */
		public override setPosition(position: Position): void {
			super.setPosition(position);

			this.updateTileKeys();
		}

		/**
		 * @inheritdoc
		 */
		public override setPositionX(x: number): void {
			super.setPositionX(x);

			this.updateTileKeys();
		}

		/**
		 * @inheritdoc
		 */
		public override setPositionY(y: number): void {
			super.setPositionY(y);

			this.updateTileKeys();
		}

		/**
		 * Logic that executes when this collidable is collided with.
		 *
		 * @param withCollidable the `Collidable` that has collided with this collidable
		 *
		 * @returns boolean to optionally break out of `tick()`
		 */
		abstract onCollision(withCollidable: CollidableClass): void;

		/**
		 * Determines if this collidable is colliding with another `BoardObject`.
		 *
		 * @param collidable the `Collidable` this collidable might be colliding with
		 * @returns boolean indicating if the two are colliding
		 */
		public isCollidingWithCollidable(collidable: CollidableClass): boolean {
			const collisionBox = this.getCollisionBox();
			const collidableCollisionBox = collidable.getCollisionBox();
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
		 * Deletes this board object and makes sure that it's also removed from the collidables map.
		 */
		public override delete(): void {
			this.checkForCollidableAndRemove();
			super.delete();
			App.COLLIDABLES.splice(App.COLLIDABLES.indexOf(this), 1);
		}

		/**
		 * Every `BoardObject` class that implements the `Collidable` interface should call this method every time
		 * they update their position. This makes sure that the `COLLIDABLES_MAP` stores `collidable` in its own "group",
		 * based on its current x and y position. This reduces the number of `BoardObject`s we need to run collision detection
		 * against.
		 *
		 */
		public updateTileKeys(): void {
			// make sure we remove any existing references to "collidable" in the map, since it's
			// now moving to a different location in the map
			this.checkForCollidableAndRemove();

			const collisionBox = this.getCollisionBox();
			const leftTile = Board.calcTileNumX(collisionBox.left);
			const rightTile = Board.calcTileNumX(collisionBox.right);
			const topTile = Board.calcTileNumY(collisionBox.top);
			const bottomTile = Board.calcTileNumY(collisionBox.bottom);
			const currentTileKeys = this._currentTileKeys;

			// looks through each column and row this collidable's collision box is in
			// and make sure it is put into the respective tile keys in the collidables map
			for (let tileY = bottomTile; tileY <= topTile; tileY++) {
				for (let tileX = leftTile; tileX <= rightTile; tileX++) {
					const tileKey = Board.createTileKey(tileX, tileY);

					// if we're in the first column/row, and the first tile key that this collidable's
					// collision box is located in is still just the first column/row, we know that no
					// other parts of the collision box have changed tiles, so stop here
					if (tileY == bottomTile && tileX == leftTile && currentTileKeys[0] === tileKey) {
						return;
					}

					// create a new mapping for the new position, if there isn't one yet
					if (!defined(App.COLLIDABLES_MAP[tileKey])) {
						App.COLLIDABLES_MAP[tileKey] = [];
					}

					// push "collidable" into its own position-based group
					App.COLLIDABLES_MAP[tileKey].push(this);
					this._currentTileKeys.push(tileKey);
				}
			}
		}

		/**
		 * Checks that `collidable` doesn't already have a mapping in the `COLLIDABLES_MAP`, and removes it if it does.
		 */
		public checkForCollidableAndRemove(): void {
			const currentTileKeys = this._currentTileKeys;
			const currentTileKeysLength = currentTileKeys.length;

			if (!currentTileKeysLength) {
				return;
			}

			// find all tiles the collision box is in and remove it
			for (let i = 0; i < currentTileKeysLength; i++) {
				let positionCollidables = App.COLLIDABLES_MAP[currentTileKeys[i]!];

				if (defined(positionCollidables) && positionCollidables.includes(this)) {
					positionCollidables.splice(positionCollidables.indexOf(this), 1);

					this._currentTileKeys = [];
				}
			}
		}

		/**
		 * Returns a boolean indicating if this `Collidable` instance can be collided by one
		 * with the name `collidableName`.
		 *
		 * @param collidableName the name of the collidable to check against
		 * @returns boolean indicating if this collidable can collide with `collidableName`
		 */
		public canBeCollidedBy(collidableName: string): boolean {
			return this.canBeCollidedByTypes.includes(collidableName);
		}
	}

	return CollidableClass;
}
