import { App } from "../../../../../../../src/main/app/App.js";
import Board from "../../../../../../../src/main/board/Board.js";
import MakeControllable from "../../../../../../../src/main/board/boardobject/children/moveable/mixins/Controllable.js";
import Moveable from "../../../../../../../src/main/board/boardobject/children/moveable/Moveable.js";
import MovementDirection from "../../../../../../../src/main/board/boardobject/children/moveable/MovementDirection.js";
import Turn from "../../../../../../../src/main/board/boardobject/children/Turn.js";
import Test from "../../../../../../base/Base.js";

/**
 * Tests functionality of `Controllable` instances.
 */
export default class ControllableTest extends Test {
	/**
	 * Test that controllables can be created correctly.
	 */
	public createControllableTest(): void {
		const controllable = new (class extends MakeControllable(Moveable) {})("test-controllable", 0, 0, 0);

		this.assertTrue(App.getInstance().getControllableGameElementIds().has(controllable.getUniqueId()));
	}

	/**
	 * Test that controllables can get their current input direction.
	 */
	public getCurrentInputDirectionTest(): void {
		const controllable = new (class extends MakeControllable(Moveable) {})("test-controllable", 0, 0, 0);

		this.assertOfType("undefined", controllable.getCurrentInputDirection());

		controllable.handleInput("KeyD");

		this.assertStrictlyEqual(MovementDirection.RIGHT, controllable.getCurrentInputDirection());
	}

	/**
	 * Test that controllables can handle input from players.
	 */
	public handleInputTest(): void {
		const controllable = new (class extends MakeControllable(Moveable) {})("test-controllable", 0, 0, 0);
		// this code should not exist, so nothing should happen
		let code = "NonExistent";

		controllable.handleInput(code);

		this.assertOfType("undefined", controllable["currentDirection"]);
		this.assertEmpty(controllable["turnQueue"]);

		// this code does exist but controllable is not moving, so nothing should happen
		code = "KeyD";

		controllable.handleInput(code);

		this.assertOfType("undefined", controllable["currentDirection"]);
		this.assertEmpty(controllable["turnQueue"]);

		// controllable is now moving, but currentDirection is undefined, so nothing should happen
		controllable["moving"] = true;

		controllable.handleInput(code);

		this.assertOfType("undefined", controllable["currentDirection"]);
		this.assertEmpty(controllable["turnQueue"]);

		// controllable now has current direction, but since input direction is the same,
		// nothing should happen
		controllable["currentDirection"] = MovementDirection.RIGHT;

		controllable.handleInput(code);

		this.assertStrictlyEqual(MovementDirection.RIGHT, controllable["currentDirection"]);
		this.assertEmpty(controllable["turnQueue"]);

		// now movement direction is different than input direction, and is also the opposite of it,
		// so controllable should now start moving in opposite direction
		controllable["currentDirection"] = MovementDirection.LEFT;

		controllable.handleInput(code);

		this.assertStrictlyEqual(MovementDirection.RIGHT, controllable["currentDirection"]);
		this.assertEmpty(controllable["turnQueue"]);

		// this direction will be for the turn queue (moving up)
		code = "KeyW";

		const app = App.getInstance();
		const testTurn = new Turn("test-turn", [MovementDirection.UP]);
		const controllablePosition = controllable.getPosition();
		const turnTileX = Board.calcTileNumX(controllablePosition.x) + 1;
		const turnTileY = Board.calcTileNumY(controllablePosition.y);

		app["board"] = Board.getInstance();

		app["board"].getTurnMap().set(Board.createTileKey(turnTileX, turnTileY), testTurn);
		app["board"]["placeBoardObject"](controllable, turnTileX - 1, turnTileY, true);
		app["board"]["placeBoardObject"](testTurn, turnTileX, turnTileY, true);

		controllable.handleInput(code);

		this.assertStrictlyEqual(MovementDirection.RIGHT, controllable["currentDirection"]);
		this.assertStrictlyEqual(testTurn, controllable["turnQueue"][0]!.turn);
		this.assertStrictlyEqual(testTurn.getDirections()[0], controllable["turnQueue"][0]!.direction);
	}
}
