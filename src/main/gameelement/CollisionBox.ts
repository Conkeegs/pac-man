import Board from "../board/Board.js";
import { GameElement, type Position } from "./GameElement.js";

/**
 * Represents a bounding-box used for collision detection.
 */
export default class CollisionBox extends GameElement {
	/**
	 * X-coordinate of the left-most side.
	 */
	private left: number;
	/**
	 * X-coordinate of the right-most side.
	 */
	private right: number;
	/**
	 * Y-coordinate of the top-most side.
	 */
	private top: number;
	/**
	 * Y-coordinate of the bottom-most side.
	 */
	private bottom: number;

	/**
	 * Creates a new `CollisionBox` instance.
	 *
	 * @param name the unique name of this collision box
	 * @param left the leftmost pixel offset
	 * @param right the rightmost pixel offset
	 * @param top the topmost pixel offset
	 * @param bottom the bottommost pixel offset
	 */
	constructor(name: string, left: number, right: number, top: number, bottom: number) {
		super(name, right - left, bottom - top);

		this.left = left;
		this.right = right;
		this.top = top;
		this.bottom = bottom;
	}

	/**
	 * Get the leftmost pixel offset of this collision box.
	 *
	 * @returns leftmost pixel offset
	 */
	public getLeft(): number {
		return this.left;
	}

	/**
	 * Get the rightmost pixel offset of this collision box.
	 *
	 * @returns rightmost pixel offset
	 */
	public getRight(): number {
		return this.right;
	}

	/**
	 * Get the topmost pixel offset of this collision box.
	 *
	 * @returns topmost pixel offset
	 */
	public getTop(): number {
		return this.top;
	}

	/**
	 * Get the bottommost pixel offset of this collision box.
	 *
	 * @returns bottommost pixel offset
	 */
	public getBottom(): number {
		return this.bottom;
	}

	/**
	 * Set the pixel offset of the left side of this collision box.
	 *
	 * @param left new pixel offset of left side
	 */
	public setLeft(left: number): void {
		this.left = left;
	}

	/**
	 * Set the pixel offset of the right side of this collision box.
	 *
	 * @param right new pixel offset of right side
	 */
	public setRight(right: number): void {
		this.right = right;
	}

	/**
	 * Set the pixel offset of the top side of this collision box.
	 *
	 * @param top new pixel offset of top side
	 */
	public setTop(top: number): void {
		this.top = top;
	}

	/**
	 * Set the pixel offset of the bottom side of this collision box.
	 *
	 * @param bottom new pixel offset of bottom side
	 */
	public setBottom(bottom: number): void {
		this.bottom = bottom;
	}

	/**
	 * Sets the position of this collision box and re-calculates the pixel offset
	 * of its sides.
	 *
	 * @param position new position
	 */
	public override setPosition(position: Position): void {
		super.setPosition(position);

		const positionX = position.x;
		const positionY = position.y;

		this.setLeft(positionX);
		this.setRight(positionX + this.getWidth());
		this.setTop(positionY);
		this.setBottom(positionY + this.getHeight());
	}

	/**
	 * Sets the x-position of this collision box and re-calculates the pixel offset
	 * of its horizontal sides.
	 *
	 * @param x new x-position
	 */
	public override setPositionX(x: number): void {
		super.setPositionX(x);

		this.setLeft(x);
		this.setRight(x + this.getWidth());
	}

	/**
	 * Sets the y-position of this collision box and re-calculates the pixel offset
	 * of its vertical sides.
	 *
	 * @param y new y-position
	 */
	public override setPositionY(y: number): void {
		super.setPositionY(y);

		this.setTop(y);
		this.setBottom(y + this.getHeight());
	}

	/**
	 * Determines if this collision box is colliding with another.
	 *
	 * @param otherCollisionBox the collision box this collision box might be colliding with
	 * @returns boolean indicating if the two are colliding
	 */
	public isCollidingWith(otherCollisionBox: CollisionBox): boolean {
		const left = this.left;
		const top = this.top;
		const otherCollisionBoxLeft = otherCollisionBox.left;
		const otherCollisionBoxRight = otherCollisionBox.right;
		const otherCollisionBoxTop = otherCollisionBox.top;

		if (
			// right side past left side
			left + (this.right - left) >= otherCollisionBoxLeft &&
			// left side past right side
			left <= otherCollisionBoxLeft + (otherCollisionBoxRight - otherCollisionBoxLeft) &&
			// top side past bottom side
			top + (this.bottom - top) >= otherCollisionBoxTop &&
			// bottom side past top side
			top <= otherCollisionBoxTop + (otherCollisionBox.bottom - otherCollisionBoxTop)
		) {
			return true;
		}

		return false;
	}

	/**
	 * Find the closest distance (in pixels) that any given side of this collision box
	 * is to the reference position `position`, and returns that distance.
	 *
	 * @param position reference position
	 * @returns closest distance (in pixels) that any given side of this collision box
	 * is to the reference position `position`
	 */
	public findDistanceToPosition(position: Position): number {
		const left = this.left;
		const right = this.right;
		const top = this.top;
		const bottom = this.bottom;
		const topLeftCorner: Position = {
			x: left,
			y: top,
		};
		const topRightCorner: Position = {
			x: right,
			y: top,
		};
		const bottomLeftCorner: Position = {
			x: left,
			y: bottom,
		};
		const bottomRightCorner: Position = {
			x: right,
			y: bottom,
		};

		return Math.min(
			Board.positionDistanceToLineSegment(position, topLeftCorner, topRightCorner),
			Board.positionDistanceToLineSegment(position, topRightCorner, bottomRightCorner),
			Board.positionDistanceToLineSegment(position, bottomRightCorner, bottomLeftCorner),
			Board.positionDistanceToLineSegment(position, bottomLeftCorner, topLeftCorner)
		);
	}

	/**
	 * Find all of the tile keys that this collision box is contained in.
	 *
	 * @returns all of the tile keys that this collision box is contained in
	 */
	public findTileKeys(): string[] {
		const tileKeys: string[] = [];
		const leftTile = Board.calcTileNumX(this.getLeft());
		const rightTile = Board.calcTileNumX(this.getRight());
		const topTile = Board.calcTileNumY(this.getTop());
		const bottomTile = Board.calcTileNumY(this.getBottom());

		// look through each column and row this collision box is in
		for (let tileY = bottomTile; tileY <= topTile; tileY++) {
			for (let tileX = leftTile; tileX <= rightTile; tileX++) {
				tileKeys.push(Board.createTileKey(tileX, tileY));
			}
		}

		return tileKeys;
	}
}
