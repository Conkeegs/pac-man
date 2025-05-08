import { App } from "../../../../../src/main/App.js";
import Board from "../../../../../src/main/board/Board.js";
import Inky from "../../../../../src/main/board/boardobject/children/character/Inky.js";
import PacMan from "../../../../../src/main/board/boardobject/children/character/PacMan.js";
import Pinky from "../../../../../src/main/board/boardobject/children/character/Pinky.js";
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

		this.assertStrictlyEqual(50, collidable._collisionBoxPercentage);
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

		this.assertArrayContains(collidable, App.COLLIDABLES_MAP[collidable.getCollidablePositionKey()]!);
	}

	/**
	 * Test that collidables can set their x-positions correctly.
	 */
	public setPositionXTest(): void {
		const collidable = new Inky();

		collidable.setPositionX(1);

		this.assertArrayContains(collidable, App.COLLIDABLES_MAP[collidable.getCollidablePositionKey()]!);
	}

	/**
	 * Test that collidables can set their y-positions correctly.
	 */
	public setPositionYTest(): void {
		const collidable = new Inky();

		collidable.setPositionY(1);

		this.assertArrayContains(collidable, App.COLLIDABLES_MAP[collidable.getCollidablePositionKey()]!);
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

		this.assertArrayContains(collidable, App.COLLIDABLES_MAP[collidable.getCollidablePositionKey()]!);

		collidable.delete();

		this.assertArrayDoesntContain(collidable, App.COLLIDABLES_MAP[collidable.getCollidablePositionKey()]!);
	}

	/**
	 * Test that collidables can update their tile key mapping correctly.
	 */
	public updateTileKeysTest(): void {
		const collidable = new Inky();

		this.assertOfType("undefined", App.COLLIDABLES_MAP[collidable.getCollidablePositionKey()]);

		collidable.updateTileKeys();

		this.assertArrayLength(1, App.COLLIDABLES_MAP[collidable.getCollidablePositionKey()]!);
		this.assertArrayContains(collidable, App.COLLIDABLES_MAP[collidable.getCollidablePositionKey()]!);
	}

	/**
	 * Test that collidables can check for their tile mappings and remove themselves from it correctly.
	 */
	public checkForCollidableAndRemoveTest(): void {
		const collidable = new Inky();

		this.assertOfType("undefined", collidable._currentTileKey);

		collidable.checkForCollidableAndRemove();

		this.assertOfType("undefined", collidable._currentTileKey);

		collidable.setPosition({
			x: 1,
			y: 1,
		});

		this.assertArrayLength(1, App.COLLIDABLES_MAP[collidable.getCollidablePositionKey()]!);
		this.assertArrayContains(collidable, App.COLLIDABLES_MAP[collidable.getCollidablePositionKey()]!);

		collidable.checkForCollidableAndRemove();

		this.assertArrayLength(0, App.COLLIDABLES_MAP[collidable.getCollidablePositionKey()]!);
		this.assertArrayDoesntContain(collidable, App.COLLIDABLES_MAP[collidable.getCollidablePositionKey()]!);
		this.assertOfType("undefined", collidable._currentTileKey);
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

		this.assertOfType("number", collisionBox.bottom);
		this.assertOfType("number", collisionBox.left);
		this.assertOfType("number", collisionBox.right);
		this.assertOfType("number", collisionBox.top);
		this.assertStrictlyEqual(position.x + (width - (width * collisionBoxPercentage) / 100) / 2, collisionBox.left);
		this.assertStrictlyEqual(
			position.x + width - (width - (width * collisionBoxPercentage) / 100) / 2,
			collisionBox.right
		);
		this.assertStrictlyEqual(position.y + (height - (height * collisionBoxPercentage) / 100) / 2, collisionBox.top);
		this.assertStrictlyEqual(
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
		this.assertTrue(collidable1.isCollidingWithCollidable(collidable2));
		this.assertTrue(collidable2.isCollidingWithCollidable(collidable1));

		collidable1.setPosition({
			x: 300,
			y: 400 - collidable2.getHeight() / 2,
		});
		collidable2.setPosition({
			x: 300,
			y: 400,
		});

		// colliding horizontally
		this.assertTrue(collidable1.isCollidingWithCollidable(collidable2));
		this.assertTrue(collidable2.isCollidingWithCollidable(collidable1));
	}

	/**
	 * Test that collidables can get their collidable tile keys correctly.
	 */
	public getCollidablePositionKeyTest(): void {
		const collidable = new PacMan();
		const centerPosition = collidable.getCenterPosition();

		this.assertStrictlyEqual(
			`${Board.calcTileNumX(centerPosition.x)}-${Board.calcTileNumY(centerPosition.y)}`,
			collidable.getCollidablePositionKey()
		);
	}

	/**
	 * Test that collidables know which other collidables they can collide with.
	 */
	public canBeCollidedByTest(): void {
		const collidable = new PacMan();

		for (const name of collidable.canBeCollidedByTypes) {
			this.assertTrue(collidable.canBeCollidedBy(name));
		}
	}
}
