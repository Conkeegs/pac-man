import { App } from "../../../../../src/main/App.js";
import Board from "../../../../../src/main/board/Board.js";
import PacMan from "../../../../../src/main/board/boardobject/children/character/PacMan.js";
import MovementDirection from "../../../../../src/main/board/boardobject/children/moveable/MovementDirection.js";
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
		const collidable = new PacMan();

		this.assertArrayContains(collidable, App.TICKABLES);

		collidable.delete();

		this.assertArrayDoesntContain(collidable, App.TICKABLES);
	}
}
