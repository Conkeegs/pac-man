import Ghost from "../../../../src/main/gameelement/character/Ghost.js";
import Inky from "../../../../src/main/gameelement/character/Inky.js";
import Test from "../../../base/Base.js";
import { tests } from "../../../base/Decorators.js";

/**
 * Tests functionality of `src\main\board\gameelement\children\character\Ghost.ts` instances.
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
