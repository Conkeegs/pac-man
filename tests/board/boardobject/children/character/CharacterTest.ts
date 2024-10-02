import { App } from "../../../../../src/main/App.js";
import ImageRegistry from "../../../../../src/main/assets/ImageRegistry.js";
import Board from "../../../../../src/main/board/Board.js";
import Character from "../../../../../src/main/board/boardobject/children/character/Character.js";
import PacMan from "../../../../../src/main/board/boardobject/children/character/PacMan.js";
import { CHARACTERS, TILESIZE } from "../../../../../src/main/utils/Globals.js";
import { millisToSeconds, px } from "../../../../../src/main/utils/Utils.js";
import Assertion from "../../../../base/Assertion.js";
import Test from "../../../../base/Base.js";
import { tests } from "../../../../base/Decorators.js";

/**
 * Tests functionality of `src\main\board\boardobject\children\character\Character.ts` instances.
 */
@tests(Character)
export default class CharacterTest extends Test {
	/**
	 * Test that character instances can be created correctly.
	 */
	public createCharacterTest(): void {
		const pacman = new PacMan("pacman");
		const pacmanElement = pacman.getElement();

		Assertion.assertArrayContains(pacman, CHARACTERS);
		Assertion.assertStrictlyEqual(
			pacman["collisionThreshold"],
			Math.ceil(pacman.getSpeed() * millisToSeconds(App.DESIRED_MS_PER_FRAME)) + Character["COLLISION_PADDING"]
		);
		Assertion.assertStrictlyEqual(px(TILESIZE + Board.calcTileOffset(0.5)), pacmanElement.css("width"));
		Assertion.assertStrictlyEqual(px(TILESIZE + Board.calcTileOffset(0.5)), pacmanElement.css("height"));
		Assertion.assertStrictlyEqual(
			`url(${ImageRegistry.getImage("pacman-0")})`,
			pacmanElement.css("backgroundImage")
		);
		// this.element.css({
		// 	width: px(this.width),
		// 	height: px(this.height),
		// 	backgroundImage: `url(${source})`,
		// });
	}
}
