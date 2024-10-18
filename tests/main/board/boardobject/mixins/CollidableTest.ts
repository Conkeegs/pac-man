import { App } from "../../../../../src/main/App.js";
import Board from "../../../../../src/main/board/Board.js";
import Inky from "../../../../../src/main/board/boardobject/children/character/Inky.js";
import PacMan from "../../../../../src/main/board/boardobject/children/character/PacMan.js";
import Pinky from "../../../../../src/main/board/boardobject/children/character/Pinky.js";
import Assertion from "../../../../base/Assertion.js";
import Test from "../../../../base/Base.js";

/**
 * Tests functionality of `Collidable` instances.
 */
export default class CollidableTest extends Test {
	/**
	 * Test that collidables are created correctly.
	 */
	public createCollidableTest(): void {
		const collidable = new Inky();

		Assertion.assertStrictlyEqual(50, collidable._collisionBoxPercentage);
	}

	/**
	 * Test that collidables can set their positions correctly.
	 */
	public setPositionTest(): void {
		const collidable = new Inky();

		collidable.setPosition({
			x: 1,
			y: 1,
		});

		Assertion.assertArrayContains(collidable, App.COLLIDABLES_MAP[collidable.getCollidablePositionKey()]!);
	}

	/**
	 * Test that collidables can set their x-positions correctly.
	 */
	public setPositionXTest(): void {
		const collidable = new Inky();

		collidable.setPositionX(1);

		Assertion.assertArrayContains(collidable, App.COLLIDABLES_MAP[collidable.getCollidablePositionKey()]!);
	}

	/**
	 * Test that collidables can set their y-positions correctly.
	 */
	public setPositionYTest(): void {
		const collidable = new Inky();

		collidable.setPositionY(1);

		Assertion.assertArrayContains(collidable, App.COLLIDABLES_MAP[collidable.getCollidablePositionKey()]!);
	}

	/**
	 * Test that collidables can delete themselves correctly.
	 */
	public deleteTest(): void {
		const collidable = new Inky();

		collidable.setPosition({
			x: 1,
			y: 1,
		});

		Assertion.assertArrayContains(collidable, App.COLLIDABLES_MAP[collidable.getCollidablePositionKey()]!);

		collidable.delete();

		Assertion.assertArrayDoesntContain(collidable, App.COLLIDABLES_MAP[collidable.getCollidablePositionKey()]!);
	}

	/**
	 * Test that collidables can update their tile key mapping correctly.
	 */
	public updateTileKeysTest(): void {
		const collidable = new Inky();

		Assertion.assertOfType("undefined", App.COLLIDABLES_MAP[collidable.getCollidablePositionKey()]);

		collidable.updateTileKeys();

		Assertion.assertArrayLength(1, App.COLLIDABLES_MAP[collidable.getCollidablePositionKey()]!);
		Assertion.assertArrayContains(collidable, App.COLLIDABLES_MAP[collidable.getCollidablePositionKey()]!);
	}

	/**
	 * Test that collidables can check for their tile mappings and remove themselves from it correctly.
	 */
	public checkForCollidableAndRemoveTest(): void {
		const collidable = new Inky();

		Assertion.assertOfType("undefined", collidable._currentPositionKey);

		collidable.checkForCollidableAndRemove();

		Assertion.assertOfType("undefined", collidable._currentPositionKey);

		collidable.setPosition({
			x: 1,
			y: 1,
		});

		Assertion.assertArrayLength(1, App.COLLIDABLES_MAP[collidable.getCollidablePositionKey()]!);
		Assertion.assertArrayContains(collidable, App.COLLIDABLES_MAP[collidable.getCollidablePositionKey()]!);

		collidable.checkForCollidableAndRemove();

		Assertion.assertArrayLength(0, App.COLLIDABLES_MAP[collidable.getCollidablePositionKey()]!);
		Assertion.assertArrayDoesntContain(collidable, App.COLLIDABLES_MAP[collidable.getCollidablePositionKey()]!);
	}

	/**
	 * Test that collidables can get their collision boxes correctly.
	 */
	public getCollisionBoxTest(): void {
		const collidable = new PacMan();
		const collisionBox = collidable.getCollisionBox();
		const position = collidable.getPosition();
		const width = collidable.getWidth();
		const height = collidable.getHeight();
		const collisionBoxPercentage = collidable._collisionBoxPercentage;

		Assertion.assertOfType("number", collisionBox.bottom);
		Assertion.assertOfType("number", collisionBox.left);
		Assertion.assertOfType("number", collisionBox.right);
		Assertion.assertOfType("number", collisionBox.top);
		Assertion.assertStrictlyEqual(
			position.x + (width - (width * collisionBoxPercentage) / 100) / 2,
			collisionBox.left
		);
		Assertion.assertStrictlyEqual(
			position.x + width - (width - (width * collisionBoxPercentage) / 100) / 2,
			collisionBox.right
		);
		Assertion.assertStrictlyEqual(
			position.y + (height - (height * collisionBoxPercentage) / 100) / 2,
			collisionBox.top
		);
		Assertion.assertStrictlyEqual(
			position.y + height - (height - (height * collisionBoxPercentage) / 100) / 2,
			collisionBox.bottom
		);
	}

	/**
	 * Test that collidables can tell if they are colliding with other collidables correctly.
	 */
	public isCollidingWithCollidableTest(): void {
		const collidable1 = new Inky();
		const collidable2 = new Pinky();

		collidable1.setPosition({
			x: 300,
			y: 400,
		});
		collidable2.setPosition({
			x: 300 - collidable1.getWidth() / 2,
			y: 400,
		});

		// colliding vertically
		Assertion.assertTrue(collidable1.isCollidingWithCollidable(collidable2));
		Assertion.assertTrue(collidable2.isCollidingWithCollidable(collidable1));

		collidable1.setPosition({
			x: 300,
			y: 400 - collidable2.getHeight() / 2,
		});
		collidable2.setPosition({
			x: 300,
			y: 400,
		});

		// colliding horizontally
		Assertion.assertTrue(collidable1.isCollidingWithCollidable(collidable2));
		Assertion.assertTrue(collidable2.isCollidingWithCollidable(collidable1));
	}

	/**
	 * Test that collidables can get their collidable tile keys correctly.
	 */
	public getCollidablePositionKeyTest(): void {
		const collidable = new PacMan();
		const centerPosition = collidable.getCenterPosition();

		Assertion.assertStrictlyEqual(
			`${Board.calcTileNumX(centerPosition.x)}-${Board.calcTileNumY(centerPosition.y)}`,
			collidable.getCollidablePositionKey()
		);
	}
}
