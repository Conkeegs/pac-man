import { App } from "../../../../../../src/main/App.js";
import Board from "../../../../../../src/main/board/Board.js";
import PacMan from "../../../../../../src/main/board/boardobject/children/character/PacMan.js";
import Moveable from "../../../../../../src/main/board/boardobject/children/moveable/Moveable.js";
import MovementDirection from "../../../../../../src/main/board/boardobject/children/moveable/MovementDirection.js";
import Assertion from "../../../../../base/Assertion.js";
import Test from "../../../../../base/Base.js";
import { tests } from "../../../../../base/Decorators.js";

/**
 * Tests functionality of `src\main\board\boardobject\children\character\Character.ts` instances.
 */
@tests(PacMan)
export default class PacManTest extends Test {
	/**
	 * Test that pacman instances can tell whether they're spawning or not.
	 */
	public isSpawningTest(): void {
		const pacman = new PacMan();

		Assertion.assertTrue(pacman.isSpawning());

		pacman["spawning"] = false;

		Assertion.assertFalse(pacman.isSpawning());
	}

	/**
	 * Test that pacman instances can start moving correctly.
	 */
	public startMovingTest(): void {
		const pacman = new PacMan();

		Assertion.assertTrue(pacman.isSpawning());

		pacman.startMoving(MovementDirection.RIGHT);

		Assertion.assertFalse(pacman.isSpawning());
	}

	/**
	 * Test that pacman instances can tick each frame correctly.
	 */
	public async tickTest(): Promise<void> {
		const pacman = new PacMan();

		pacman.startMoving(MovementDirection.RIGHT);
		await App["loadTurnData"]();

		Assertion.assertArrayLength(0, pacman["turnQueue"]);

		pacman.tick();

		Assertion.assertArrayLength(0, pacman["turnQueue"]);
		// should not "stop" at wall yet
		Assertion.assertTrue(pacman.isMoving());

		const turnWithRightDirection = Board.turnData!.find((turn) =>
			turn.directions.includes(MovementDirection.RIGHT)
		)!;

		pacman["queueTurn"](MovementDirection.DOWN, turnWithRightDirection);
		pacman.setPosition({
			x: turnWithRightDirection.x - pacman.getWidth() / 2,
			y: turnWithRightDirection.y - pacman.getHeight() / 2,
		});

		Assertion.assertArrayLength(1, pacman["turnQueue"]);

		pacman.tick();

		Assertion.assertArrayLength(0, pacman["turnQueue"]);
		// should not "stop" at wall yet since queued turn exists
		Assertion.assertTrue(pacman.isMoving());

		const turnWithNoRightDirection = Board.turnData!.find(
			(turn) => !turn.directions.includes(MovementDirection.RIGHT)
		)!;

		pacman.startMoving(MovementDirection.RIGHT);
		pacman.setPosition({
			x: turnWithNoRightDirection.x - pacman.getWidth() / 2,
			y: turnWithNoRightDirection.y - pacman.getHeight() / 2,
		});

		pacman.tick();

		Assertion.assertArrayLength(0, pacman["turnQueue"]);
		// pacman should have stopped now since he hit a wall and has no queued turns
		Assertion.assertFalse(pacman.isMoving());
	}

	/**
	 * Test that pacman instances handle key presses correctly.
	 */
	public async handleKeyDownTest(): Promise<void> {
		const pacman = new PacMan();

		document.body.dispatchEvent(
			new KeyboardEvent("keydown", {
				code: "KeyD",
			})
		);
		document.body.dispatchEvent(
			new KeyboardEvent("keyup", {
				code: "KeyD",
			})
		);

		// just spawned
		Assertion.assertFalse(pacman.isSpawning());
		Assertion.assertTrue(pacman.isMoving());
		Assertion.assertStrictlyEqual(MovementDirection.RIGHT, pacman.getCurrentDirection());

		document.body.dispatchEvent(
			new KeyboardEvent("keydown", {
				code: "KeyA",
			})
		);
		document.body.dispatchEvent(
			new KeyboardEvent("keyup", {
				code: "KeyA",
			})
		);

		// moving in opposite direction
		Assertion.assertTrue(pacman.isMoving());
		Assertion.assertStrictlyEqual(MovementDirection.LEFT, pacman.getCurrentDirection());

		pacman.stopMoving();
		pacman["nearestStoppingTurn"] = {
			x: 300,
			y: 400,
			directions: [MovementDirection.UP],
		};

		document.body.dispatchEvent(
			new KeyboardEvent("keydown", {
				code: "KeyW",
			})
		);
		document.body.dispatchEvent(
			new KeyboardEvent("keyup", {
				code: "KeyW",
			})
		);

		// moving after "stopped"
		Assertion.assertTrue(pacman.isMoving());
		Assertion.assertStrictlyEqual(MovementDirection.UP, pacman.getCurrentDirection());

		await App["loadTurnData"]();

		const turnWithLeftDirection = Board.turnData!.find((turn) =>
			Moveable["canTurnWithMoveDirection"](MovementDirection.LEFT, turn)
		)!;

		pacman.setPosition({
			x: turnWithLeftDirection.x - pacman.getWidth() / 2,
			y: turnWithLeftDirection.y - pacman.getHeight() / 2,
		});
		document.body.dispatchEvent(
			new KeyboardEvent("keydown", {
				code: "KeyA",
			})
		);
		document.body.dispatchEvent(
			new KeyboardEvent("keyup", {
				code: "KeyA",
			})
		);

		// regular, 90-degree turn
		Assertion.assertTrue(pacman.isMoving());
		Assertion.assertStrictlyEqual(MovementDirection.LEFT, pacman.getCurrentDirection());

		const turnWithDownDirection = Board.turnData!.find((turn) =>
			Moveable["canTurnWithMoveDirection"](MovementDirection.DOWN, turn)
		)!;

		pacman.setPosition({
			x: turnWithDownDirection.x + pacman.getWidth(),
			y: turnWithDownDirection.y - pacman.getHeight() / 2,
		});

		document.body.dispatchEvent(
			new KeyboardEvent("keydown", {
				code: "KeyS",
			})
		);
		document.body.dispatchEvent(
			new KeyboardEvent("keyup", {
				code: "KeyS",
			})
		);

		// turn should be queued now
		Assertion.assertTrue(pacman.isMoving());
		// queued turn, so we haven't started moving "down" yet and should still be moving left
		Assertion.assertStrictlyEqual(MovementDirection.LEFT, pacman.getCurrentDirection());
		Assertion.assertStrictlyEqual(pacman.getLastMoveCode(), MovementDirection.DOWN);
		Assertion.assertNotEmpty(pacman["turnQueue"]);

		const queuedTurn = pacman["turnQueue"][0]!;

		Assertion.assertStrictlyEqual(MovementDirection.DOWN, queuedTurn.direction);
		Assertion.assertStrictlyEqual(turnWithDownDirection.x, queuedTurn.turn.x);
		Assertion.assertStrictlyEqual(turnWithDownDirection.y, queuedTurn.turn.y);
	}

	/**
	 * Test that pacman instances handle key releases correctly.
	 */
	public handleKeyUpTest(): void {
		const pacman = new PacMan();

		Assertion.assertTrue(pacman["listenForKeydown"]);

		document.body.dispatchEvent(
			new KeyboardEvent("keydown", {
				code: "KeyD",
			})
		);

		Assertion.assertTrue(pacman.isMoving());
		Assertion.assertFalse(pacman["listenForKeydown"]);

		document.body.dispatchEvent(
			new KeyboardEvent("keyup", {
				code: "KeyD",
			})
		);

		Assertion.assertTrue(pacman.isMoving());
		Assertion.assertTrue(pacman["listenForKeydown"]);
	}

	/**
	 * Test that pacman instances can create their event listeners correctly.
	 */
	public createMoveEventListenersTest(): void {
		const pacman = new PacMan();

		Assertion.assertOfType(
			"object",
			pacman._EVENT_LISTENERS.find((listenerData) => listenerData.eventName === "keydown")
		);
		Assertion.assertOfType(
			"object",
			pacman._EVENT_LISTENERS.find((listenerData) => listenerData.eventName === "keyup")
		);
	}

	/**
	 * Test that pacman instances can get their current animation images correctly.
	 */
	public getCurrentAnimationImageNameTest(): void {
		const pacman = new PacMan();
		let animationImage = pacman._getCurrentAnimationImageName();

		Assertion.assertStrictlyEqual(1, pacman._animationFrame);
		Assertion.assertStrictlyEqual(pacman.defaultAnimationImageName(), animationImage);

		pacman._animationFrame++;

		animationImage = pacman._getCurrentAnimationImageName();

		Assertion.assertStrictlyEqual(
			`${pacman.defaultAnimationImageName()}-${pacman["currentDirection"]}`,
			animationImage
		);
	}
}
