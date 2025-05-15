import { App } from "../../../../../src/main/App.js";
import Inky from "../../../../../src/main/board/boardobject/children/character/Inky.js";
import PacMan from "../../../../../src/main/board/boardobject/children/character/PacMan.js";
import Turn from "../../../../../src/main/board/boardobject/children/Turn.js";
import { TILESIZE } from "../../../../../src/main/utils/Globals.js";
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
		const collisionBoxPercentage = collidable._collisionBoxPercentage;

		this.assertStrictlyEqual(50, collisionBoxPercentage);

		const collidableWidth = collidable.getWidth();
		const collidableHeight = collidable.getHeight();
		const paddingHorizontal = (collidableWidth - (collidableWidth * collisionBoxPercentage) / 100) / 2;
		const paddingVertical = (collidableHeight - (collidableHeight * collisionBoxPercentage) / 100) / 2;
		const collidablePosition = collidable.getPosition();
		const collidablePositionX = collidablePosition.x;
		const collidablePositionY = collidablePosition.y;
		const collisionBox = collidable.getCollisionBox();

		this.assertStrictlyEqual(collidablePositionX + paddingHorizontal, collisionBox.getLeft());
		this.assertStrictlyEqual(collidablePositionX + collidableWidth - paddingHorizontal, collisionBox.getRight());
		this.assertStrictlyEqual(collidablePositionY + paddingVertical, collisionBox.getTop());
		this.assertStrictlyEqual(collidablePositionY + collidableHeight - paddingVertical, collisionBox.getBottom());

		const firstChild = collidable.getChildren()[0]!;

		this.assertStrictlyEqual(paddingHorizontal, firstChild.offsetX);
		this.assertStrictlyEqual(paddingVertical, firstChild.offsetY);
		this.assertStrictlyEqual(collisionBox, firstChild.boardObject);
	}

	/**
	 * Test that collidables can get their current tile keys correctly.
	 */
	public getCurrentTileKeysTest(): void {
		const collidable = new PacMan();

		this.assertNotEmpty(collidable.getCurrentTileKeys());

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
		const collidable = new Turn("test-turn", []);
		let oldTileKeys = [...collidable.getCurrentTileKeys()];

		for (const tileKey of oldTileKeys) {
			this.assertArrayLength(1, App.COLLIDABLES_MAP[tileKey]!);
			this.assertArrayContains(collidable, App.COLLIDABLES_MAP[tileKey]!);
		}

		const oldPreviousLeftTile = collidable["previousLeftTile"];
		const oldPreviousRightTile = collidable["previousRightTile"];
		const oldPreviousTopTile = collidable["previousTopTile"];
		const oldPreviousBottomTile = collidable["previousBottomTile"];

		collidable["updateTileKeys"]();

		const newTileKeys = collidable.getCurrentTileKeys();

		// no tile keys should have changed since none of the collidable's collision box's sides
		// have moved into separate tiles yet
		for (let i = 0; i < newTileKeys.length; i++) {
			this.assertStrictlyEqual(oldTileKeys[i], newTileKeys[i]);
		}

		this.assertStrictlyEqual(oldPreviousLeftTile, collidable["previousLeftTile"]);
		this.assertStrictlyEqual(oldPreviousRightTile, collidable["previousRightTile"]);
		this.assertStrictlyEqual(oldPreviousTopTile, collidable["previousTopTile"]);
		this.assertStrictlyEqual(oldPreviousBottomTile, collidable["previousBottomTile"]);

		// set x-position so that collidable's collision box is in between two tiles horizontally,
		// so the rightmost collision box side changes tiles
		collidable.setPosition({
			x: TILESIZE - collidable.getWidth() / 2,
			y: 0,
		});

		this.assertStrictlyEqual(oldPreviousLeftTile, collidable["previousLeftTile"]);
		// only right tile should have changed
		this.assertNotStrictlyEqual(oldPreviousRightTile, collidable["previousRightTile"]);
		// should be at second tile
		this.assertStrictlyEqual(2, collidable["previousRightTile"]);
		this.assertStrictlyEqual(oldPreviousTopTile, collidable["previousTopTile"]);
		this.assertStrictlyEqual(oldPreviousBottomTile, collidable["previousBottomTile"]);
	}

	/**
	 * Test that collidables can check for their tile mappings and remove themselves from it correctly.
	 */
	public checkForCollidableAndRemoveTest(): void {
		const collidable = new Inky();

		this.assertNotEmpty(collidable._currentTileKeys);

		collidable["checkForCollidableAndRemove"]();

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

		collidable["checkForCollidableAndRemove"]();

		currentTileKeys = collidable.getCurrentTileKeys();

		for (const tileKey of currentTileKeys) {
			this.assertArrayLength(0, App.COLLIDABLES_MAP[tileKey]!);
			this.assertArrayDoesntContain(collidable, App.COLLIDABLES_MAP[tileKey]!);
		}

		this.assertEmpty(collidable._currentTileKeys);
	}

	/**
	 * Test that collidables can tell if they are colliding with other collidables correctly.
	 */
	// public isCollidingWithCollidableTest(): void {
	// 	const collidable1 = new Inky();
	// 	const collidable2 = new Pinky();

	// 	collidable1.setPosition({
	// 		x: 300,
	// 		y: 400,
	// 	});
	// 	collidable2.setPosition({
	// 		x: 300 - collidable1.getWidth() / 2,
	// 		y: 400,
	// 	});

	// 	let collisionBox1 = collidable1.getCollisionBox();
	// 	let collisionBox2 = collidable2.getCollisionBox();

	// 	// colliding vertically
	// 	this.assertTrue(collisionBox1.isCollidingWith(collidable2));
	// 	this.assertTrue(collisionBox2.isCollidingWith(collidable1));

	// 	collidable1.setPosition({
	// 		x: 300,
	// 		y: 400 - collidable2.getHeight() / 2,
	// 	});
	// 	collidable2.setPosition({
	// 		x: 300,
	// 		y: 400,
	// 	});

	// 	// colliding horizontally
	// 	this.assertTrue(collidable1.isCollidingWithCollidable(collidable2));
	// 	this.assertTrue(collidable2.isCollidingWithCollidable(collidable1));
	// }

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
