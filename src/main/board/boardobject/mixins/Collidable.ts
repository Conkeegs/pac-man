import { App } from "../../../App.js";
import CollisionBox from "../../../gameelement/CollisionBox.js";
import type { Position } from "../../../gameelement/GameElement.js";
import type { AbstractConstructor } from "../../../types.js";
import { defined } from "../../../utils/Utils.js";
import Board from "../../Board.js";
import { BoardObject } from "../BoardObject.js";

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
		 * The `CollisionBox` used to track collisions for this collidable.
		 */
		private collisionBox: CollisionBox;
		/**
		 * The previous tile number that collidable's `CollisionBox`'s leftmost side was in.
		 */
		private previousLeftTile: number = 0;
		/**
		 * The previous tile number that collidable's `CollisionBox`'s rightmost side was in.
		 */
		private previousRightTile: number = 0;
		/**
		 * The previous tile number that collidable's `CollisionBox`'s topmost side was in.
		 */
		private previousTopTile: number = 0;
		/**
		 * The previous tile number that collidable's `CollisionBox`'s bottommost side was in.
		 */
		private previousBottomTile: number = 0;
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

			// calculate percentage of collidable's width and height that the collision box's
			// dimensions should be, and then use it to set the initial sides of the collision box
			const collidableWidth = this.getWidth();
			const collidableHeight = this.getHeight();
			const paddingHorizontal = (collidableWidth - (collidableWidth * collisionBoxPercentage) / 100) / 2;
			const paddingVertical = (collidableHeight - (collidableHeight * collisionBoxPercentage) / 100) / 2;
			const collidablePosition = this.getPosition();
			const collidablePositionX = collidablePosition.x;
			const collidablePositionY = collidablePosition.y;

			this.collisionBox = new CollisionBox(
				`${this.getName()}-collision-box`,
				collidablePositionX + paddingHorizontal,
				collidablePositionX + collidableWidth - paddingHorizontal,
				collidablePositionY + paddingVertical,
				collidablePositionY + collidableHeight - paddingVertical
			);

			this.updateTileKeys();
			this.addChild({
				offsetX: paddingHorizontal,
				offsetY: paddingVertical,
				boardObject: this.collisionBox,
			});
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
		 * Get this collidable's collision box percentage.
		 *
		 * @returns this collidable's collision box percentage
		 */
		public getCollisionBoxPercentage(): number {
			return this._collisionBoxPercentage;
		}

		/**
		 * Gets the current position of this collidable's collision box, based on the collidable's position.
		 *
		 * @returns positions of the collision box's sides
		 */
		public getCollisionBox(): CollisionBox {
			return this.collisionBox;
		}

		/**
		 * Set the position of this collidable and update its mapping for group-based collision
		 * detection.
		 *
		 * @param position new position
		 */
		public override setPosition(position: Position): void {
			super.setPosition(position);

			this.updateTileKeys();
		}

		/**
		 * Set the x-position of this collidable and update its mapping for group-based collision
		 * detection.
		 *
		 * @param x new x-position
		 */
		public override setPositionX(x: number): void {
			super.setPositionX(x);

			this.updateTileKeys();
		}

		/**
		 * Set the y-position of this collidable and update its mapping for group-based collision
		 * detection.
		 *
		 * @param y new y-position
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
		 * Deletes this board object and makes sure that it's also removed from the collidables map.
		 */
		public override delete(): void {
			this.checkForCollidableAndRemove();
			super.delete();
			App.COLLIDABLES.splice(App.COLLIDABLES.indexOf(this), 1);
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

		/**
		 * Every `BoardObject` class that implements the `Collidable` interface should call this method every time
		 * they update their position. This makes sure that the `COLLIDABLES_MAP` stores `collidable` in its own "group",
		 * based on its current x and y position. This reduces the number of `BoardObject`s we need to run collision detection
		 * against.
		 *
		 */
		private updateTileKeys(): void {
			const collisionBox = this.collisionBox;
			const leftTile = Board.calcTileNumX(collisionBox.getLeft());
			const rightTile = Board.calcTileNumX(collisionBox.getRight());
			const topTile = Board.calcTileNumY(collisionBox.getTop());
			const bottomTile = Board.calcTileNumY(collisionBox.getBottom());

			// if none of the sides of the collision box have gone into a different tile,
			// skip further calculation
			if (
				leftTile == this.previousLeftTile &&
				rightTile == this.previousRightTile &&
				topTile == this.previousTopTile &&
				bottomTile == this.previousBottomTile
			) {
				return;
			}

			this.previousLeftTile = leftTile;
			this.previousRightTile = rightTile;
			this.previousTopTile = topTile;
			this.previousBottomTile = bottomTile;

			// make sure we remove any existing references to "collidable" in the map, since it's
			// now moving to a different location in the map
			this.checkForCollidableAndRemove();

			const collisionBoxTileKeys = collisionBox.findTileKeys();

			for (let i = 0; i < collisionBoxTileKeys.length; i++) {
				const tileKey = collisionBoxTileKeys[i]!;

				// create a new mapping for the new tile key, if there isn't one yet
				if (!defined(App.COLLIDABLES_MAP[tileKey])) {
					App.COLLIDABLES_MAP[tileKey] = [];
				}

				// push "collidable" into its own position-based group
				App.COLLIDABLES_MAP[tileKey].push(this);
				this._currentTileKeys.push(tileKey);
			}
		}

		/**
		 * Checks that this collidable doesn't already have mappings in the `COLLIDABLES_MAP`, and removes it if it does.
		 */
		private checkForCollidableAndRemove(): void {
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
				}
			}

			this._currentTileKeys = [];
		}
	}

	return CollidableClass;
}
