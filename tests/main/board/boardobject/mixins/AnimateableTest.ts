import { App } from "../../../../../src/main/App.js";
import PacMan from "../../../../../src/main/board/boardobject/children/character/PacMan.js";
import Assertion from "../../../../base/Assertion.js";
import Test from "../../../../base/Base.js";

/**
 * Tests functionality of `src\main\board\boardobject\children\character\Inky.ts` instances.
 */
export default class AnimateableTest extends Test {
	/**
	 * Test that animateables can be created correctly.
	 */
	public createAnimateableTest(): void {
		const animateable = new PacMan();

		Assertion.assertArrayContains(animateable, App.ANIMATEABLES);
	}
}
