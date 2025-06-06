import PacMan from "../../../../../src/main/board/boardobject/children/character/PacMan.js";
import MovementDirection from "../../../../../src/main/board/boardobject/children/moveable/MovementDirection.js";
import Turn from "../../../../../src/main/board/boardobject/children/Turn.js";
import { GameElement, type Position } from "../../../../../src/main/gameelement/GameElement.js";
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

	/**
	 * Test that collisions with turns behave correctly.
	 */
	public onCollisionTest(): void {
		const testTurn = new Turn("test-turn", [MovementDirection.LEFT, MovementDirection.RIGHT]);
		let turnCenterPosition = testTurn.getCenterPosition();
		const collidableMoveable = new PacMan();
		const movementDirection = MovementDirection.RIGHT;

		collidableMoveable["queueTurn"](movementDirection, testTurn);
		testTurn.onCollision(collidableMoveable);

		this.assertStrictlyEqual(movementDirection, collidableMoveable.getCurrentDirection());
		this.assertTrue(collidableMoveable["shouldRender"]);
		this.assertTrue(
			GameElement.positionsEqual(
				{
					x: turnCenterPosition.x - collidableMoveable.getWidth() / 2,
					y: turnCenterPosition.y - collidableMoveable.getHeight() / 2,
				},
				collidableMoveable.getPosition()
			)
		);

		// reset this
		collidableMoveable["shouldRender"] = false;

		const testPosition: Position = {
			x: 300,
			y: 500,
		};

		collidableMoveable["currentDirection"] = MovementDirection.UP;

		testTurn.setPosition({
			x: testPosition.x,
			y: testPosition.y,
		});
		testTurn.onCollision(collidableMoveable);

		turnCenterPosition = testTurn.getCenterPosition();

		this.assertStrictlyEqual(2, collidableMoveable._animationFrame);
		this.assertFalse(collidableMoveable.isMoving());
		this.assertTrue(
			GameElement.positionsEqual(collidableMoveable.getPosition(), {
				x: turnCenterPosition.x - collidableMoveable.getWidth()! / 2,
				y: turnCenterPosition.y - collidableMoveable.getHeight()! / 2,
			})
		);
		this.assertStrictlyEqual(testTurn, collidableMoveable["stoppedAtTurn"]);
		this.assertTrue(collidableMoveable["shouldRender"]);
	}
}
