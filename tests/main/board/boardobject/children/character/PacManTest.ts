import PacMan from "../../../../../../src/main/board/boardobject/children/character/PacMan.js";
import Test from "../../../../../base/Base.js";
import { tests } from "../../../../../base/Decorators.js";

/**
 * Tests functionality of `src\main\board\boardobject\children\character\Character.ts` instances.
 */
@tests(PacMan)
export default class PacManTest extends Test {
	/**
	 * Test that pacman instances can get their animation images correctly.
	 */
	public getAnimationImageTest(): void {
		const pacman = new PacMan();
	}
}
