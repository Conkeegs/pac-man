import { App } from "../../../../../src/main/App.js";
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
	 * Test that collidables can get their current tile keys correctly.
	 */
	public getCurrentTileKeysTest(): void {
		const collidable = new PacMan();

		this.assertEmpty(collidable.getCurrentTileKeys());

		collidable.setPosition({
			x: 1,
			y: 1,
		});

		this.assertNotEmpty(collidable.getCurrentTileKeys());
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

		const currentTileKeys = collidable.getCurrentTileKeys();

		for (const tileKey of currentTileKeys) {
			this.assertArrayContains(collidable, App.COLLIDABLES_MAP[tileKey]!);
		}
	}

	/**
	 * Test that collidables can set their x-positions correctly.
	 */
	public setPositionXTest(): void {
		const collidable = new Inky();

		collidable.setPositionX(1);

		const currentTileKeys = collidable.getCurrentTileKeys();

		for (const tileKey of currentTileKeys) {
			this.assertArrayContains(collidable, App.COLLIDABLES_MAP[tileKey]!);
		}
	}

	/**
	 * Test that collidables can set their y-positions correctly.
	 */
	public setPositionYTest(): void {
		const collidable = new Inky();

		collidable.setPositionY(1);

		const currentTileKeys = collidable.getCurrentTileKeys();

		for (const tileKey of currentTileKeys) {
			this.assertArrayContains(collidable, App.COLLIDABLES_MAP[tileKey]!);
		}
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

		let currentTileKeys = collidable.getCurrentTileKeys();

		for (const tileKey of currentTileKeys) {
			this.assertArrayContains(collidable, App.COLLIDABLES_MAP[tileKey]!);
		}

		collidable.delete();

		currentTileKeys = collidable.getCurrentTileKeys();

		for (const tileKey of currentTileKeys) {
			this.assertArrayDoesntContain(collidable, App.COLLIDABLES_MAP[tileKey]!);
		}
	}

	/**
	 * Test that collidables can update their tile key mapping correctly.
	 */
	public updateTileKeysTest(): void {
		const collidable = new Inky();
		let currentTileKeys = collidable.getCurrentTileKeys();

		for (const tileKey of currentTileKeys) {
			this.assertOfType("undefined", App.COLLIDABLES_MAP[tileKey]);
		}

		collidable.updateTileKeys();

		currentTileKeys = collidable.getCurrentTileKeys();

		for (const tileKey of currentTileKeys) {
			this.assertArrayLength(1, App.COLLIDABLES_MAP[tileKey]!);
			this.assertArrayContains(collidable, App.COLLIDABLES_MAP[tileKey]!);
		}
	}

	/**
	 * Test that collidables can check for their tile mappings and remove themselves from it correctly.
	 */
	public checkForCollidableAndRemoveTest(): void {
		const collidable = new Inky();

		this.assertEmpty(collidable._currentTileKeys);

		collidable.checkForCollidableAndRemove();

		this.assertEmpty(collidable._currentTileKeys);

		collidable.setPosition({
			x: 1,
			y: 1,
		});

		let currentTileKeys = collidable.getCurrentTileKeys();

		for (const tileKey of currentTileKeys) {
			this.assertArrayLength(1, App.COLLIDABLES_MAP[tileKey]!);
			this.assertArrayContains(collidable, App.COLLIDABLES_MAP[tileKey]!);
		}

		collidable.checkForCollidableAndRemove();

		currentTileKeys = collidable.getCurrentTileKeys();

		for (const tileKey of currentTileKeys) {
			this.assertArrayLength(0, App.COLLIDABLES_MAP[tileKey]!);
			this.assertArrayDoesntContain(collidable, App.COLLIDABLES_MAP[tileKey]!);
		}

		this.assertEmpty(collidable._currentTileKeys);
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
	 * Test that collidables know which other collidables they can collide with.
	 */
	public canBeCollidedByTest(): void {
		const collidable = new PacMan();

		for (const name of collidable.canBeCollidedByTypes) {
			this.assertTrue(collidable.canBeCollidedBy(name));
		}
	}
}
