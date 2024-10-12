import type { AbstractConstructor } from "../../../types.js";
import { COLLIDABLES_MAP } from "../../../utils/Globals.js";
import { defined } from "../../../utils/Utils.js";
import type { Position } from "../../Board.js";
import Board from "../../Board.js";
import { BoardObject, type PositionSetOptions } from "../BoardObject.js";

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
	 * Y-coordinate of the bottom-hand side.
	 */
	bottom: number;
};

/**
 * Gives `BoardObject` instances functionality that allows them to properly "collide" with
 * other board objects on the board.
 */
export type Collidable = InstanceType<ReturnType<typeof MakeCollidable<typeof BoardObject>>>;

/**
 * Formats `Position` objects into string-keys that can be used to index into the `COLLIDABLES_MAP`.
 *
 * @param position the `Position` object to make into the collidable key
 * @returns
 */
export function makeCollidablePositionKey(position: Position): string {
	return `${Board.calcTileNumX(position.x)}-${Board.calcTileNumY(position.y)}`;
}

/**
 * Gives `BoardObject` instances functionality that allows it to properly "collide" with
 * other board objects on the board.
 *
 * @param Base a `BoardObject` instance
 * @returns a `BoardObject` that is considered "collidable" in the game's physics
 */
export default function MakeCollidable<TBase extends AbstractConstructor>(
	Base: TBase,
	collisionBoxPercentage: number | undefined = 100
) {
	abstract class CollidableClass extends Base {
		/**
		 * The current key into the `COLLIDABLES_MAP` that this collidable is under.
		 */
		_currentPositionKey: string | undefined;
		/**
		 * The percent (out of 100) that the size of this collidable's collision
		 * box will be, compared to its width and height.
		 */
		_collisionBoxPercentage: number;

		/**
		 * The types of `BoardObject` sub-classes that this collidable can
		 * be "collided by".
		 */
		public canBeCollidedByTypes: string[] = [];

		/**
		 * Creates a `CollidableClass` instance.
		 *
		 * @param args arguments passed to the board object's constructor
		 */
		constructor(...args: any[]) {
			super(...args);

			this._collisionBoxPercentage = collisionBoxPercentage;
		}

		/**
		 * Logic that executes when this collidable is collided with.
		 *
		 * @param withCollidable the `Collidable` that has collided with this collidable
		 *
		 * @returns boolean to optionally break out of `tick()`
		 */
		abstract _onCollision(withCollidable: CollidableClass): void;

		/**
		 * @inheritdoc
		 */
		public setPosition(position: Position, options?: PositionSetOptions): void {
			(super["setPosition" as keyof {}] as BoardObject["setPosition"])(position, options);

			this.updateTileKeys();
		}

		/**
		 * @inheritdoc
		 */
		public setPositionX(x: number, options?: PositionSetOptions): void {
			(super["setPositionX" as keyof {}] as BoardObject["setPositionX"])(x, options);

			this.updateTileKeys();
		}

		/**
		 * @inheritdoc
		 */
		public setPositionY(y: number, options?: PositionSetOptions): void {
			(super["setPositionY" as keyof {}] as BoardObject["setPositionY"])(y, options);

			this.updateTileKeys();
		}

		/**
		 * Deletes this food object and makes sure that it's also removed from the collidables map.
		 */
		public delete(): void {
			this.checkForCollidableAndRemove();

			(super["delete" as keyof {}] as BoardObject["delete"])();
		}

		/**
		 * Every `BoardObject` class that implements the `Collidable` interface should call this method every time
		 * they update their position. This makes sure that the `COLLIDABLES_MAP` stores `collidable` in its own "group",
		 * based on its current x and y position. This reduces the number of `BoardObject`s we need to run collision detection
		 * against.
		 *
		 */
		public updateTileKeys(): void {
			const newCollidablePositionKey = this.getCollidablePositionKey();

			if (newCollidablePositionKey === this._currentPositionKey) {
				return;
			}

			this._currentPositionKey = newCollidablePositionKey;

			// create a new mapping for the new position, if there isn't one yet
			if (!defined(COLLIDABLES_MAP[newCollidablePositionKey])) {
				COLLIDABLES_MAP[newCollidablePositionKey] = [];
			}

			// make sure we remove any existing references to "collidable" in the map,since it's
			// now moving to a different location in the map
			this.checkForCollidableAndRemove();
			// push "collidable" into its own position-based group
			COLLIDABLES_MAP[newCollidablePositionKey]!.push(this as unknown as Collidable);
		}

		/**
		 * Checks that `collidable` doesn't already have a mapping in the `COLLIDABLES_MAP`, and removes it if it does.
		 */
		public checkForCollidableAndRemove(): void {
			const currentPositionKey = this._currentPositionKey;

			if (!currentPositionKey) {
				return;
			}

			let positionCollidables = COLLIDABLES_MAP[currentPositionKey];
			const instance = this as unknown as Collidable;

			if (defined(positionCollidables) && positionCollidables!.includes(instance)) {
				COLLIDABLES_MAP[currentPositionKey]!.splice(positionCollidables!.indexOf(instance), 1);
			}
		}

		/**
		 * Gets the current position of this collidable's collision box, based on the collidable's position.
		 *
		 * @returns positions of the collision box's sides
		 */
		public getCollisionBox(): CollisionBox {
			const collisionBoxPercentage = this._collisionBoxPercentage;
			const collidable = this as unknown as BoardObject;
			const width = collidable.getWidth();
			const height = collidable.getHeight();
			const paddingHorizontal = (width - (width * collisionBoxPercentage) / 100) / 2;
			const paddingVertical = (height - (height * collisionBoxPercentage) / 100) / 2;
			const collidablePosition = collidable.getPosition();
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
		 * This will create a properly-formatted key into the `COLLIDABLES_MAP` based on this collidable's `Position`.
		 *
		 * @returns a properly-formatted key into the `COLLIDABLES_MAP`
		 */
		public getCollidablePositionKey(): string {
			return makeCollidablePositionKey((this as unknown as BoardObject).getCenterPosition());
		}
	}

	return CollidableClass;
}
