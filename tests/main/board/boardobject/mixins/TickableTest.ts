import { App } from "../../../../../src/main/App.js";
import Board from "../../../../../src/main/board/Board.js";
import { BoardObject } from "../../../../../src/main/board/boardobject/BoardObject.js";
import PacMan from "../../../../../src/main/board/boardobject/children/character/PacMan.js";
import MovementDirection from "../../../../../src/main/board/boardobject/children/moveable/MovementDirection.js";
import MakeTickable from "../../../../../src/main/board/boardobject/mixins/Tickable.js";
import Test from "../../../../base/Base.js";

/**
 * Tests functionality of `Tickable` instances.
 */
export default class TickableTest extends Test {
	/**
	 * Test that tickables are created correctly.
	 */
	public createCollidableTest(): void {
		const collidable = new PacMan();

		this.assertArrayContains(collidable, App.TICKABLES);
	}

	/**
	 * Test if tickables can get whether or not they should interpolate.
	 */
	public getShouldInterpolateTest(): void {
		const collidable = new PacMan();

		this.assertTrue(collidable.getShouldInterpolate());

		collidable["_shouldInterpolate"] = false;

		this.assertFalse(collidable.getShouldInterpolate());
	}

	/**
	 * Test if tickables can set whether or not they should interpolate.
	 */
	public setShouldInterpolateTest(): void {
		const collidable = new PacMan();

		this.assertTrue(collidable.getShouldInterpolate());

		collidable.setShouldInterpolate(false);

		this.assertFalse(collidable.getShouldInterpolate());

		collidable.setShouldInterpolate(true);

		this.assertTrue(collidable.getShouldInterpolate());
	}

	/**
	 * Test that tickables can tick each frame correctly.
	 */
	public async tickTest(): Promise<void> {
		await Board.getInstance()["loadTurnData"]();

		const collidable = new PacMan();

		collidable.startMoving(MovementDirection.RIGHT);

		this.assertStrictlyEqual(0, collidable._framesUpdating);

		collidable.tick();

		this.assertStrictlyEqual(1, collidable._framesUpdating);
	}

	/**
	 * Test that tickables can delete themselves correctly.
	 */
	public deleteTest(): void {
		const collidable = new (class extends MakeTickable(BoardObject) {
			constructor() {
				super("test tickable");
			}

			public override interpolate() {}
		})();

		collidable.tick();

		this.assertStrictlyEqual(1, collidable["_framesUpdating"]);
		this.assertArrayContains(collidable, App.TICKABLES);

		collidable.delete();

		this.assertStrictlyEqual(0, collidable["_framesUpdating"]);
		this.assertArrayDoesntContain(collidable, App.TICKABLES);
	}
}
