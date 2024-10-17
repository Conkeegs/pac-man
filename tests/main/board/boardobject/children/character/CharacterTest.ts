import { App } from "../../../../../../src/main/App.js";
import ImageRegistry from "../../../../../../src/main/assets/ImageRegistry.js";
import Board from "../../../../../../src/main/board/Board.js";
import Character from "../../../../../../src/main/board/boardobject/children/character/Character.js";
import PacMan from "../../../../../../src/main/board/boardobject/children/character/PacMan.js";
import MovementDirection from "../../../../../../src/main/board/boardobject/children/moveable/MovementDirection.js";
import { TILESIZE } from "../../../../../../src/main/utils/Globals.js";
import { px } from "../../../../../../src/main/utils/Utils.js";
import Assertion from "../../../../../base/Assertion.js";
import Test from "../../../../../base/Base.js";
import { tests } from "../../../../../base/Decorators.js";

/**
 * Tests functionality of `src\main\board\boardobject\children\character\Character.ts` instances.
 */
@tests(Character)
export default class CharacterTest extends Test {
	/**
	 * Test that character instances can be created correctly.
	 */
	public createCharacterTest(): void {
		const pacman = new PacMan();
		const pacmanElement = pacman.getElement();

		Assertion.assertArrayContains(pacman, App.CHARACTERS);
		Assertion.assertStrictlyEqual(px(TILESIZE + Board.calcTileOffset(0.5)), pacmanElement.css("width"));
		Assertion.assertStrictlyEqual(px(TILESIZE + Board.calcTileOffset(0.5)), pacmanElement.css("height"));
		Assertion.assertStrictlyEqual(
			`url(\"${ImageRegistry.getImage("pacman-1")}\")`,
			pacmanElement.css("backgroundImage")
		);
	}

	/**
	 * Test that characters can get their image source correctly.
	 */
	public getSourceTest(): void {
		const pacman = new PacMan();

		Assertion.assertStrictlyEqual(ImageRegistry.getImage("pacman-1"), pacman.getSource());
	}

	/**
	 * Test that characters can stop moving correctly.
	 */
	public stopMovingTest(): void {
		const pacman = new PacMan();

		Assertion.assertFalse(pacman.isMoving());

		const movementDirection = MovementDirection.UP;

		pacman.startMoving(movementDirection);

		Assertion.assertTrue(pacman.isMoving());

		pacman.setPosition({ x: 500, y: 700 });
		pacman.stopMoving();

		Assertion.assertFalse(pacman.isMoving());
	}

	/**
	 * Test that characters can start moving correctly.
	 */
	public startMovingTest(): void {
		const pacman = new PacMan();

		Assertion.assertFalse(pacman.isMoving());

		const movementDirection = MovementDirection.UP;
		const turn = {
			x: 500,
			y: 700,
			directions: [movementDirection],
		};

		pacman["turnQueue"].push({
			direction: movementDirection,
			turn,
		});
		pacman.startMoving(movementDirection);

		Assertion.assertTrue(pacman.isMoving());

		pacman.stopMoving();
		pacman.startMoving(movementDirection, {
			fromTurn: turn,
		});

		Assertion.assertTrue(pacman.isMoving());

		pacman.stopMoving();
	}

	/**
	 * Test that characters can delete correctly.
	 */
	public deleteTest(): void {
		const pacman = new PacMan();

		Assertion.assertArrayContains(pacman, App.CHARACTERS);

		pacman.delete();

		Assertion.assertArrayDoesntContain(pacman, App.CHARACTERS);
	}
}
