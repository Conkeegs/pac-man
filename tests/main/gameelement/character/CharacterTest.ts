import AssetRegistry from "../../../../src/main/assets/AssetRegistry.js";
import Board from "../../../../src/main/Board.js";
import Character from "../../../../src/main/gameelement/character/Character.js";
import PacMan from "../../../../src/main/gameelement/character/PacMan.js";
import MovementDirection from "../../../../src/main/gameelement/moveable/MovementDirection.js";
import Turn from "../../../../src/main/gameelement/Turn.js";
import { TILESIZE } from "../../../../src/main/utils/Globals.js";
import { px } from "../../../../src/main/utils/Utils.js";
import Test from "../../../base/Base.js";
import { tests } from "../../../base/Decorators.js";

/**
 * Tests functionality of `src\main\board\gameelement\children\character\Character.ts` instances.
 */
@tests(Character)
export default class CharacterTest extends Test {
	/**
	 * Test that character instances can be created correctly.
	 */
	public createCharacterTest(): void {
		const pacman = new PacMan();
		const pacmanElement = pacman.getElement();

		this.assertStrictlyEqual(px(TILESIZE + Board.calcTileOffset(0.5)), pacmanElement.css("width"));
		this.assertStrictlyEqual(px(TILESIZE + Board.calcTileOffset(0.5)), pacmanElement.css("height"));
		this.assertStrictlyEqual(
			`url(\"${AssetRegistry.getImageSrc("pacman")}\")`,
			pacmanElement.css("backgroundImage"),
		);
	}

	/**
	 * Test that characters set their current direction properly.
	 */
	public setCurrentDirectionTest(): void {
		const character = new PacMan();
		const direction = MovementDirection.RIGHT;

		character.setCurrentDirection(direction);

		this.assertStrictlyEqual(direction, character["currentDirection"]);
		this.assertStrictlyEqual(direction, character["_currentAnimationSet"]);
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
		pacman.startMoving(movementDirection);

		this.assertTrue(pacman.isMoving());

		pacman.stopMoving();
	}
}
