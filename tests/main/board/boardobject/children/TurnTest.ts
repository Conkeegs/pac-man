import MovementDirection from "../../../../../src/main/board/boardobject/children/moveable/MovementDirection.js";
import Turn from "../../../../../src/main/board/boardobject/children/Turn.js";
import { TILESIZE } from "../../../../../src/main/utils/Globals.js";
import { px } from "../../../../../src/main/utils/Utils.js";
import Test from "../../../../base/Base.js";
import { tests } from "../../../../base/Decorators.js";

/**
 * Tests functionality of `Turn` instances.
 */
@tests(Turn)
export default class TurnTest extends Test {
	/**
	 * Test creating a turn board object.
	 */
	public createTurnTest(): void {
		const testTurn = new Turn("test-turn", [MovementDirection.LEFT, MovementDirection.RIGHT]);

		this.assertStrictlyEqual(px(TILESIZE / 4), testTurn.getElement().css("width"));
		this.assertStrictlyEqual(px(TILESIZE / 4), testTurn.getElement().css("height"));
	}

	/**
	 * Test a turn can return its available directions correctly.
	 */
	public getDirectionsTest(): void {
		const directions = [MovementDirection.LEFT, MovementDirection.RIGHT];
		const testTurn = new Turn("test-turn", directions);

		this.assertStrictlyEqual(directions, testTurn.getDirections());
	}
}
