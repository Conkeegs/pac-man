import { App } from "../../../../../../src/main/App.js";
import ImageRegistry from "../../../../../../src/main/assets/ImageRegistry.js";
import Board from "../../../../../../src/main/board/Board.js";
import Character from "../../../../../../src/main/board/boardobject/children/character/Character.js";
import PacMan from "../../../../../../src/main/board/boardobject/children/character/PacMan.js";
import MovementDirection from "../../../../../../src/main/board/boardobject/children/moveable/MovementDirection.js";
import Turn from "../../../../../../src/main/board/boardobject/children/Turn.js";
import { TILESIZE } from "../../../../../../src/main/utils/Globals.js";
import { px } from "../../../../../../src/main/utils/Utils.js";
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

		this.assertArrayContains(pacman, App.CHARACTERS);
		this.assertStrictlyEqual(px(TILESIZE + Board.calcTileOffset(0.5)), pacmanElement.css("width"));
		this.assertStrictlyEqual(px(TILESIZE + Board.calcTileOffset(0.5)), pacmanElement.css("height"));
		this.assertStrictlyEqual(
			`url(\"${ImageRegistry.getImage("pacman-1")}\")`,
			pacmanElement.css("backgroundImage")
		);
	}

	/**
	 * Test that characters can get their image source correctly.
	 */
	public getSourceTest(): void {
		const pacman = new PacMan();

		this.assertStrictlyEqual(ImageRegistry.getImage("pacman-1"), pacman.getSource());
	}

	/**
	 * Test that characters can stop moving correctly.
	 */
	public stopMovingTest(): void {
		const pacman = new PacMan();

		this.assertFalse(pacman.isMoving());

		const movementDirection = MovementDirection.UP;

		pacman.startMoving(movementDirection);

		this.assertTrue(pacman.isMoving());

		pacman.setPosition({ x: 500, y: 700 });
		pacman.stopMoving();

		this.assertFalse(pacman.isMoving());
	}

	/**
	 * Test that characters can start moving correctly.
	 */
	public startMovingTest(): void {
		const pacman = new PacMan();

		this.assertFalse(pacman.isMoving());

		const movementDirection = MovementDirection.UP;
		const turn = new Turn("test-turn", [movementDirection]);

		turn.setPosition({
			x: 500,
			y: 700,
		});

		pacman["turnQueue"].push({
			direction: movementDirection,
			turn,
		});
		pacman.startMoving(movementDirection);

		this.assertTrue(pacman.isMoving());

		pacman.stopMoving();
		pacman.startMoving(movementDirection, {
			fromTurn: turn,
		});

		this.assertTrue(pacman.isMoving());

		pacman.stopMoving();
	}

	/**
	 * Test that characters can delete correctly.
	 */
	public deleteTest(): void {
		const pacman = new PacMan();

		this.assertArrayContains(pacman, App.CHARACTERS);

		pacman.delete();

		this.assertArrayDoesntContain(pacman, App.CHARACTERS);
	}
}
