import Ghost from "../../../../../../src/main/board/boardobject/children/character/Ghost.js";
import Inky from "../../../../../../src/main/board/boardobject/children/character/Inky.js";
import Test from "../../../../../base/Base.js";
import { tests } from "../../../../../base/Decorators.js";

/**
 * Tests functionality of `src\main\board\boardobject\children\character\Ghost.ts` instances.
 */
@tests(Ghost)
export default class GhostTest extends Test {
	/**
	 * Test that ghost instances are created correctly.
	 */
	public createGhostTest(): void {
		const ghost = new Inky();

		this.assertTrue(ghost.getElement().classList.contains("ghost"));
	}
}
