import Board from "../../../../../src/main/board/Board.js";
import Inky from "../../../../../src/main/board/boardobject/children/character/Inky.js";
import PacMan from "../../../../../src/main/board/boardobject/children/character/PacMan.js";
import MovementDirection from "../../../../../src/main/board/boardobject/children/moveable/MovementDirection.js";
import MakeTickable from "../../../../../src/main/board/boardobject/mixins/Tickable.js";
import { GameElement, type Position } from "../../../../../src/main/gameelement/GameElement.js";
import Test from "../../../../base/Base.js";

/**
 * Tests functionality of `Tickable` instances.
 */
export default class TickableTest extends Test {
	/**
	 * Test that tickables are created correctly.
	 */
	public createCollidableTest(): void {}

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

		this.assertStrictlyEqual(0, collidable._tickCount);

		collidable.tick();

		this.assertStrictlyEqual(1, collidable._tickCount);
	}

	/**
	 * Test that game elements can interpolate their positions each frame correctly.
	 */
	public interpolateTest(): void {
		const tickable = new Inky();

		tickable.setPosition({
			x: 300,
			y: 400,
		});

		const moveablePosition = tickable.getPosition();
		const oldPosition: Position = {
			x: moveablePosition.x,
			y: moveablePosition.y,
		};
		const oldPositionX = oldPosition.x;
		const alpha = 0.5;
		const newPosition: Position = {
			x: moveablePosition.x + 100,
			y: moveablePosition.y + 100,
		};

		// set position to some distance ahead by 100 pixels
		tickable.setPosition(newPosition);

		const newPositionX = newPosition.x;

		this.assertStrictlyEqual(
			newPositionX * alpha + oldPositionX * (1.0 - alpha),
			tickable.interpolate(alpha, newPositionX, oldPositionX),
		);
	}

	/**
	 * Test that tickables can delete themselves correctly.
	 */
	public deleteTest(): void {
		const collidable = new (class extends MakeTickable(GameElement) {
			constructor() {
				super("test tickable", 0, 0);
			}

			public override interpolate() {
				return 0;
			}
		})();

		collidable.tick();

		this.assertStrictlyEqual(1, collidable["_tickCount"]);

		collidable.delete();

		this.assertStrictlyEqual(0, collidable["_tickCount"]);
	}
}
