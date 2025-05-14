import Board from "../../../src/main/board/Board.js";
import CollisionBox from "../../../src/main/gameelement/CollisionBox.js";
import type { Position } from "../../../src/main/gameelement/GameElement.js";
import Test from "../../base/Base.js";
import { tests } from "../../base/Decorators.js";

@tests(CollisionBox)
export default class CollisionBoxTest extends Test {
	/**
	 * Test that collision box instances can be created correctly.
	 */
	public createCollisionBoxTest(): void {
		const left = 0;
		const right = 5;
		const top = 0;
		const bottom = 5;
		const collisionBox = new CollisionBox("test-collision-box", left, right, top, bottom);

		this.assertStrictlyEqual(left, collisionBox["left"]);
		this.assertStrictlyEqual(right, collisionBox["right"]);
		this.assertStrictlyEqual(top, collisionBox["top"]);
		this.assertStrictlyEqual(bottom, collisionBox["bottom"]);
	}

	/**
	 * Test that collision boxes can get their left offsets.
	 */
	public getLeftTest(): void {
		const collisionBox = new CollisionBox("test-collision-box", 0, 0, 0, 0);
		const left = 7;

		collisionBox["left"] = left;

		this.assertStrictlyEqual(left, collisionBox.getLeft());
	}

	/**
	 * Test that collision boxes can get their right offsets.
	 */
	public getRightTest(): void {
		const collisionBox = new CollisionBox("test-collision-box", 0, 0, 0, 0);
		const right = 7;

		collisionBox["right"] = right;

		this.assertStrictlyEqual(right, collisionBox.getRight());
	}

	/**
	 * Test that collision boxes can get their top offsets.
	 */
	public getTopTest(): void {
		const collisionBox = new CollisionBox("test-collision-box", 0, 0, 0, 0);
		const top = 7;

		collisionBox["top"] = top;

		this.assertStrictlyEqual(top, collisionBox.getTop());
	}

	/**
	 * Test that collision boxes can get their bottom offsets.
	 */
	public getBottomTest(): void {
		const collisionBox = new CollisionBox("test-collision-box", 0, 0, 0, 0);
		const bottom = 7;

		collisionBox["bottom"] = bottom;

		this.assertStrictlyEqual(bottom, collisionBox.getBottom());
	}

	/**
	 * Test that collision boxes can set their left offsets.
	 */
	public setLeftTest(): void {
		const collisionBox = new CollisionBox("test-collision-box", 0, 0, 0, 0);
		const left = 7;

		collisionBox.setLeft(left);

		this.assertStrictlyEqual(left, collisionBox.getLeft());
	}

	/**
	 * Test that collision boxes can set their right offsets.
	 */
	public setRightTest(): void {
		const collisionBox = new CollisionBox("test-collision-box", 0, 0, 0, 0);
		const right = 7;

		collisionBox.setRight(right);

		this.assertStrictlyEqual(right, collisionBox.getRight());
	}

	/**
	 * Test that collision boxes can set their top offsets.
	 */
	public setTopTest(): void {
		const collisionBox = new CollisionBox("test-collision-box", 0, 0, 0, 0);
		const top = 7;

		collisionBox.setTop(top);

		this.assertStrictlyEqual(top, collisionBox.getTop());
	}

	/**
	 * Test that collision boxes can set their bottom offsets.
	 */
	public setBottomTest(): void {
		const collisionBox = new CollisionBox("test-collision-box", 0, 0, 0, 0);
		const bottom = 7;

		collisionBox.setBottom(bottom);

		this.assertStrictlyEqual(bottom, collisionBox.getBottom());
	}

	/**
	 * Test that collision boxes can set their positions.
	 */
	public setPositionTest(): void {
		const collisionBox = new CollisionBox("test-collision-box", 0, 0, 0, 0);
		const position: Position = {
			x: 700,
			y: 500,
		};

		collisionBox.setPosition(position);

		const positionX = position.x;
		const positionY = position.y;

		this.assertStrictlyEqual(positionX, collisionBox.getLeft());
		this.assertStrictlyEqual(positionX + collisionBox.getWidth(), collisionBox.getRight());
		this.assertStrictlyEqual(positionY, collisionBox.getTop());
		this.assertStrictlyEqual(positionY + collisionBox.getHeight(), collisionBox.getBottom());
	}

	/**
	 * Test that collision boxes can set their x-positions.
	 */
	public setPositionXTest(): void {
		const collisionBox = new CollisionBox("test-collision-box", 0, 0, 0, 0);
		const positionX = 700;

		collisionBox.setPositionX(positionX);

		this.assertStrictlyEqual(positionX, collisionBox.getLeft());
		this.assertStrictlyEqual(positionX + collisionBox.getWidth(), collisionBox.getRight());
		// these should not have changed
		this.assertStrictlyEqual(0, collisionBox.getTop());
		this.assertStrictlyEqual(0, collisionBox.getBottom());
	}

	/**
	 * Test that collision boxes can set their y-positions.
	 */
	public setPositionYTest(): void {
		const collisionBox = new CollisionBox("test-collision-box", 0, 0, 0, 0);
		const positionY = 700;

		collisionBox.setPositionY(positionY);

		// horizontal values should not have changed
		this.assertStrictlyEqual(0, collisionBox.getLeft());
		this.assertStrictlyEqual(0, collisionBox.getRight());
		this.assertStrictlyEqual(positionY, collisionBox.getTop());
		this.assertStrictlyEqual(positionY + collisionBox.getHeight(), collisionBox.getBottom());
	}

	/**
	 * Test that collision boxes can tell whether or not they are colliding with
	 * other collision boxes.
	 */
	public isCollidingWithTest(): void {
		// these two are not colliding right now
		const collisionBox1 = new CollisionBox("test-collision-box-1", 0, 5, 0, 5);
		const collisionBox2 = new CollisionBox("test-collision-box-2", 6, 11, 0, 5);

		this.assertFalse(collisionBox1.isCollidingWith(collisionBox2));
		this.assertFalse(collisionBox2.isCollidingWith(collisionBox1));

		// with this, they'll just be colliding
		collisionBox2.setLeft(5);

		this.assertTrue(collisionBox1.isCollidingWith(collisionBox2));
		this.assertTrue(collisionBox2.isCollidingWith(collisionBox1));

		// same horizontal positioning but not colliding vertically
		collisionBox2.setLeft(0);
		collisionBox2.setRight(5);
		collisionBox2.setTop(6);
		collisionBox2.setBottom(11);

		this.assertFalse(collisionBox1.isCollidingWith(collisionBox2));
		this.assertFalse(collisionBox2.isCollidingWith(collisionBox1));

		// now they'll be colliding vertically
		collisionBox2.setTop(5);

		this.assertTrue(collisionBox1.isCollidingWith(collisionBox2));
		this.assertTrue(collisionBox2.isCollidingWith(collisionBox1));
	}

	/**
	 * Test that collision boxes can find the closest side to a reference position.
	 */
	public findDistanceToPositionTest(): void {
		const position: Position = {
			x: 10,
			y: 10,
		};
		const positionX = position.x;
		const positionY = position.y;
		const offsetX = 1;
		// in this case, collision box's left side should be closest to position, since
		// the y-position of both the point and the collision box are the same and the collision
		// box's left side is farther along the x-axis
		let collisionBox = new CollisionBox(
			"test-collision-box-1",
			positionX + offsetX,
			positionX + 5,
			positionY,
			positionY + 5
		);

		this.assertStrictlyEqual(offsetX, collisionBox.findDistanceToPosition(position));

		// in this case, collision box's right side should be closest to position, since
		// the y-position of both the point and the collision box are the same and the point
		// is farther along the x-axis
		collisionBox = new CollisionBox(
			"test-collision-box-2",
			positionX - offsetX,
			positionX - 5,
			positionY,
			positionY + 5
		);

		this.assertStrictlyEqual(offsetX, collisionBox.findDistanceToPosition(position));

		const offsetY = 5;

		// in this case, collision box's bottom side should be closest to position, since
		// the x-position of both the point and the collision box are the same and the collision
		// box's bottom side is farther along the y-axis
		collisionBox = new CollisionBox(
			"test-collision-box-3",
			positionX,
			positionX + 5,
			positionY - offsetY - 5,
			positionY - offsetY
		);

		this.assertStrictlyEqual(offsetY, collisionBox.findDistanceToPosition(position));

		// in this case, collision box's top side should be closest to position, since
		// the x-position of both the point and the collision box are the same and the point
		// is farther along the y-axis
		collisionBox = new CollisionBox(
			"test-collision-box-4",
			positionX,
			positionX + 5,
			positionY + offsetY,
			positionY + offsetY + 5
		);

		this.assertStrictlyEqual(offsetY, collisionBox.findDistanceToPosition(position));
	}

	/**
	 * Test that collision boxes can find their tile keys.
	 */
	public findTileKeysTest(): void {
		// tile keys that represent a collision box that expands 3 rows
		// and 3 columns
		const expectedTileKeys = ["1-1", "2-1", "3-1", "1-2", "2-2", "3-2", "1-3", "2-3", "3-3"];
		const collisionBox = new CollisionBox(
			"test-collision-box",
			Board.calcTileOffsetX(1),
			Board.calcTileOffsetX(3),
			Board.calcTileOffsetY(3),
			Board.calcTileOffsetY(1)
		);
		const tileKeys = collisionBox.findTileKeys();

		for (let i = 0; i < tileKeys.length; i++) {
			this.assertStrictlyEqual(expectedTileKeys[i], tileKeys[i]);
		}
	}
}
