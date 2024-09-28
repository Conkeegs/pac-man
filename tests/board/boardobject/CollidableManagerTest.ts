import Board from "../../../src/main/board/Board.js";
import type { Position } from "../../../src/main/board/boardobject/BoardObject.js";
import Inky from "../../../src/main/board/boardobject/children/character/Inky.js";
import PacMan from "../../../src/main/board/boardobject/children/character/PacMan.js";
import CollidableManager from "../../../src/main/board/boardobject/CollidableManager.js";
import { COLLIDABLES_MAP, TILESIZE } from "../../../src/main/utils/Globals.js";
import { defined } from "../../../src/main/utils/Utils.js";
import Assertion from "../../base/Assertion.js";
import Test from "../../base/Base.js";
import { tests } from "../../base/Decorators.js";

/**
 * Tests the functionality of a `BoardObject` instance.
 */
@tests(CollidableManager)
export default class CollidableManagerTest extends Test {
	/**
	 * Test that collidable managers are created correctly.
	 */
	public createCollidableManagerTest(): void {
		const pacman = new PacMan();

		Assertion.assertStrictlyEqual(pacman, pacman._collidableManager["collidable"]);
	}

	/**
	 * Test that collidable managers update tile-related keys correctly.
	 */
	public updateTileKeysTest(): void {
		const inky = new Inky();
		const inkyPosition = inky.getPosition();
		const collidableManager = inky._collidableManager;

		// haven't updated position yet so no collidable mapping should be found
		Assertion.assertTrue(
			!defined(
				COLLIDABLES_MAP[
					Reflect.apply(collidableManager["getCollidablePositionKey"], collidableManager, [inkyPosition])
				]
			)
		);

		const inkyPositionX = inkyPosition.x;
		const inkyPositionY = inkyPosition.y;
		let currentTileX = Board.calcTileNumX(inkyPositionX);
		let currentTileY = Board.calcTileNumY(inkyPositionY);
		let newPosition: Position = { x: inkyPositionX, y: inkyPositionY };
		const newTileX = Board.calcTileNumX(newPosition.x);
		const newTileY = Board.calcTileNumY(newPosition.y);

		collidableManager["updateTileKeys"](newPosition);

		let positionKeyNewPosition = Reflect.apply(collidableManager["getCollidablePositionKey"], collidableManager, [
			newPosition,
		]);
		let positionCollidables = COLLIDABLES_MAP[positionKeyNewPosition]!;

		// collidable mapping should be found for tile nums, but no reference to inky yet
		Assertion.assertFalse(
			!defined(
				COLLIDABLES_MAP[
					Reflect.apply(collidableManager["getCollidablePositionKey"], collidableManager, [inkyPosition])
				]
			)
		);
		Assertion.assertFalse(!defined(COLLIDABLES_MAP[positionKeyNewPosition]));
		Assertion.assertEmpty(COLLIDABLES_MAP[positionKeyNewPosition]!);
		Assertion.assertStrictlyEqual(currentTileX, newTileX);
		Assertion.assertStrictlyEqual(currentTileY, newTileY);
		Assertion.assertArrayDoesntContain(inky, positionCollidables);

		newPosition = { x: inkyPositionX + TILESIZE, y: inkyPositionY };

		inky.setPosition(newPosition);

		positionKeyNewPosition = Reflect.apply(collidableManager["getCollidablePositionKey"], collidableManager, [
			newPosition,
		]);
		positionCollidables = COLLIDABLES_MAP[positionKeyNewPosition]!;

		// position updated, so inky should be found in mapping
		Assertion.assertEmpty(
			COLLIDABLES_MAP[
				Reflect.apply(collidableManager["getCollidablePositionKey"], collidableManager, [
					{ x: inkyPositionX, y: inkyPositionY },
				])
			]!
		);
		Assertion.assertNotEmpty(positionCollidables);
		Assertion.assertNotStrictlyEqual(Board.calcTileNumX(inkyPositionX), Board.calcTileNumX(newPosition.x));
		Assertion.assertArrayContains(inky, positionCollidables);

		newPosition = { x: inkyPositionX, y: inkyPositionY + TILESIZE };

		inky.setPosition(newPosition);

		positionKeyNewPosition = Reflect.apply(collidableManager["getCollidablePositionKey"], collidableManager, [
			newPosition,
		]);
		positionCollidables = COLLIDABLES_MAP[positionKeyNewPosition]!;

		// position updated, so inky should be found in different mapping and old mapping should be empty now
		Assertion.assertEmpty(
			COLLIDABLES_MAP[
				Reflect.apply(collidableManager["getCollidablePositionKey"], collidableManager, [
					{ x: inkyPositionX + TILESIZE, y: inkyPositionY },
				])
			]!
		);
		Assertion.assertNotEmpty(positionCollidables);
		Assertion.assertNotStrictlyEqual(Board.calcTileNumX(inkyPositionY), Board.calcTileNumX(newPosition.y));
		Assertion.assertArrayContains(inky, positionCollidables);
	}

	/**
	 * Test that collidable managers can check for mapping and remove them.
	 */
	public checkForCollidableAndRemoveTest(): void {
		const inky = new Inky();
		const inkyPosition = inky.getPosition();
		const collidableManager = inky._collidableManager;
		let positionCollidables =
			COLLIDABLES_MAP[
				Reflect.apply(collidableManager["getCollidablePositionKey"], collidableManager, [inkyPosition])
			];

		Assertion.assertTrue(!defined(positionCollidables));

		const newPosition = { x: TILESIZE, y: TILESIZE };

		inky.setPosition(newPosition);

		positionCollidables =
			COLLIDABLES_MAP[
				Reflect.apply(collidableManager["getCollidablePositionKey"], collidableManager, [newPosition])
			];

		Assertion.assertFalse(!defined(positionCollidables));
		Assertion.assertNotEmpty(positionCollidables!);
		Assertion.assertArrayContains(inky, positionCollidables!);

		collidableManager.checkForCollidableAndRemove();

		Assertion.assertFalse(!defined(positionCollidables));
		Assertion.assertEmpty(positionCollidables!);
		Assertion.assertArrayDoesntContain(inky, positionCollidables!);
	}

	/**
	 * Test that collidable managers can create tile keys correctly.
	 */
	public getCollidablePositionKeyTest(): void {
		const inky = new Inky();
		const inkyPosition = inky.getPosition();
		const collidableManager = inky._collidableManager;

		const positionKey = Reflect.apply(collidableManager["getCollidablePositionKey"], collidableManager, [
			inkyPosition,
		]);

		Assertion.assertStrictlyEqual(
			`${Board.calcTileNumX(inkyPosition.x + inky.getWidth()! / 2)}-${Board.calcTileNumY(
				inkyPosition.y + inky.getHeight()! / 2
			)}`,
			positionKey
		);
	}
}
