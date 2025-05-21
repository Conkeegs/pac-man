import Board from "../../../../../../src/main/board/Board.js";
import PacMan from "../../../../../../src/main/board/boardobject/children/character/PacMan.js";
import Moveable from "../../../../../../src/main/board/boardobject/children/moveable/Moveable.js";
import MovementDirection from "../../../../../../src/main/board/boardobject/children/moveable/MovementDirection.js";
import Turn from "../../../../../../src/main/board/boardobject/children/Turn.js";
import { ANIMATION_TYPE } from "../../../../../../src/main/board/boardobject/mixins/Animateable.js";
import Test from "../../../../../base/Base.js";
import { tests } from "../../../../../base/Decorators.js";

/**
 * Tests functionality of `src\main\board\boardobject\children\character\Character.ts` instances.
 */
@tests(PacMan)
export default class PacManTest extends Test {
	/**
	 * Test that pacman instances are created correctly.
	 */
	public createPacmanTest(): void {
		const pacman = new PacMan();

		this.assertStrictlyEqual(ANIMATION_TYPE.LOOP, pacman._animationType);
	}

	/**
	 * Test that pacman instances can tell whether they're spawning or not.
	 */
	public isSpawningTest(): void {
		const pacman = new PacMan();

		this.assertTrue(pacman.isSpawning());

		pacman["spawning"] = false;

		this.assertFalse(pacman.isSpawning());
	}

	/**
	 * Test that pacman instances can start moving correctly.
	 */
	public startMovingTest(): void {
		const pacman = new PacMan();

		this.assertTrue(pacman.isSpawning());

		pacman.startMoving(MovementDirection.RIGHT);

		this.assertFalse(pacman.isSpawning());
	}

	/**
	 * Test that pacman instances can tick each frame correctly.
	 */
	public async tickTest(): Promise<void> {
		const pacman = new PacMan();
		const board = Board.getInstance();

		pacman.startMoving(MovementDirection.RIGHT);
		await board["placeTurnBoardObjects"]();
		pacman.setCurrentDirection(MovementDirection.RIGHT);
		// place at default position so turns are properly found
		board["placeBoardObject"](pacman, Board["PACMAN_SPAWN_X"], Board["PACMAN_SPAWN_Y"]);

		const turnWithNoRightDirection = board
			.getTurns()
			.find((turn) => !turn.getDirections().includes(MovementDirection.RIGHT))!;
		const turnWithNoRightDirectionCenterPosition = turnWithNoRightDirection.getCenterPosition();

		pacman.setPosition({
			x: turnWithNoRightDirectionCenterPosition.x - pacman.getWidth() * 2,
			y: turnWithNoRightDirectionCenterPosition.y - pacman.getHeight() / 2,
		});
		pacman.tick();

		const nearestStoppingTurn = pacman.getNearestStoppingTurn();

		this.assertExists(nearestStoppingTurn);
		this.assertStrictlyEqual(turnWithNoRightDirection, nearestStoppingTurn);
	}

	/**
	 * Test that pacman instances handle key presses correctly.
	 */
	public async handleKeyDownTest(): Promise<void> {
		const pacman = new PacMan();

		pacman["handleKeyDown"](
			new KeyboardEvent("keydown", {
				code: "KeyD",
			})
		);
		pacman["handleKeyUp"](
			new KeyboardEvent("keyup", {
				code: "KeyD",
			})
		);

		// just spawned
		this.assertFalse(pacman.isSpawning());
		this.assertTrue(pacman.isMoving());
		this.assertStrictlyEqual(MovementDirection.RIGHT, pacman.getCurrentDirection());

		pacman["handleKeyDown"](
			new KeyboardEvent("keydown", {
				code: "KeyA",
			})
		);
		pacman["handleKeyUp"](
			new KeyboardEvent("keyup", {
				code: "KeyA",
			})
		);

		// moving in opposite direction
		this.assertTrue(pacman.isMoving());
		this.assertStrictlyEqual(MovementDirection.LEFT, pacman.getCurrentDirection());

		pacman.stopMoving();

		const nearestStoppingTurn = new Turn("test-turn", [MovementDirection.UP]);

		nearestStoppingTurn.setPosition({
			x: 300,
			y: 400,
		});
		pacman["nearestStoppingTurn"] = nearestStoppingTurn;

		pacman["handleKeyDown"](
			new KeyboardEvent("keydown", {
				code: "KeyW",
			})
		);
		pacman["handleKeyUp"](
			new KeyboardEvent("keyup", {
				code: "KeyW",
			})
		);

		// moving after "stopped"
		this.assertTrue(pacman.isMoving());
		this.assertStrictlyEqual(MovementDirection.UP, pacman.getCurrentDirection());

		await Board.getInstance()["placeTurnBoardObjects"]();

		const turnWithLeftDirection = Board.getInstance()
			.getTurns()
			.find((turn) => Moveable["canTurnWithMoveDirection"](MovementDirection.LEFT, turn))!;
		const turnWithLeftDirectionCenterPosition = turnWithLeftDirection.getCenterPosition();

		pacman.setPosition({
			x: turnWithLeftDirectionCenterPosition.x - pacman.getWidth() / 2,
			y: turnWithLeftDirectionCenterPosition.y - pacman.getHeight() / 2,
		});
		pacman["handleKeyDown"](
			new KeyboardEvent("keydown", {
				code: "KeyA",
			})
		);
		pacman["handleKeyUp"](
			new KeyboardEvent("keyup", {
				code: "KeyA",
			})
		);

		// regular, 90-degree turn
		this.assertTrue(pacman.isMoving());
		this.assertStrictlyEqual(MovementDirection.LEFT, pacman.getCurrentDirection());

		const turnWithDownDirection = Board.getInstance()
			.getTurns()
			.find((turn) => Moveable["canTurnWithMoveDirection"](MovementDirection.DOWN, turn))!;
		const turnWithDownDirectionCenterPosition = turnWithDownDirection.getCenterPosition();

		pacman.setPosition({
			x: turnWithDownDirectionCenterPosition.x + pacman.getWidth(),
			y: turnWithDownDirectionCenterPosition.y - pacman.getHeight() / 2,
		});

		pacman["handleKeyDown"](
			new KeyboardEvent("keydown", {
				code: "KeyS",
			})
		);
		pacman["handleKeyUp"](
			new KeyboardEvent("keyup", {
				code: "KeyS",
			})
		);

		// turn should be queued now
		this.assertTrue(pacman.isMoving());
		// queued turn, so we haven't started moving "down" yet and should still be moving left
		this.assertStrictlyEqual(MovementDirection.LEFT, pacman.getCurrentDirection());
		this.assertStrictlyEqual(pacman.getLastMoveCode(), MovementDirection.DOWN);
		this.assertNotEmpty(pacman["turnQueue"]);

		const queuedTurn = pacman["turnQueue"][0]!;
		const queuedTurnCenterPosition = queuedTurn.turn.getCenterPosition();

		this.assertStrictlyEqual(MovementDirection.DOWN, queuedTurn.direction);
		this.assertStrictlyEqual(turnWithDownDirectionCenterPosition.x, queuedTurnCenterPosition.x);
		this.assertStrictlyEqual(turnWithDownDirectionCenterPosition.y, queuedTurnCenterPosition.y);
	}

	/**
	 * Test that pacman instances handle key releases correctly.
	 */
	public handleKeyUpTest(): void {
		const pacman = new PacMan();

		this.assertTrue(pacman["listenForKeydown"]);

		pacman["handleKeyDown"](
			new KeyboardEvent("keydown", {
				code: "KeyD",
			})
		);

		this.assertTrue(pacman.isMoving());
		this.assertFalse(pacman["listenForKeydown"]);

		pacman["handleKeyUp"](
			new KeyboardEvent("keyup", {
				code: "KeyD",
			})
		);

		this.assertTrue(pacman.isMoving());
		this.assertTrue(pacman["listenForKeydown"]);
	}

	/**
	 * Test that pacman instances can create their event listeners correctly.
	 */
	public createMoveEventListenersTest(): void {
		const pacman = new PacMan();

		this.assertOfType(
			"object",
			pacman._EVENT_LISTENERS.find((listenerData) => listenerData.eventName === "keydown")
		);
		this.assertOfType(
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

		this.assertStrictlyEqual(1, pacman._animationFrame);
		this.assertStrictlyEqual(pacman.defaultAnimationImageName(), animationImage);

		pacman._animationFrame++;

		animationImage = pacman._getCurrentAnimationImageName();

		this.assertStrictlyEqual(`${pacman.defaultAnimationImageName()}-${pacman["currentDirection"]}`, animationImage);
	}

	/**
	 * Test that pacman can get his nearest "stopping" turn correctly.
	 */
	public getNearestStoppingTurnTest(): void {
		const pacman = new PacMan();

		this.assertStrictlyEqual(undefined, pacman.getNearestStoppingTurn());

		const nearestStoppingTurn = new Turn("test-turn", [MovementDirection.RIGHT]);

		pacman["nearestStoppingTurn"] = nearestStoppingTurn;

		this.assertStrictlyEqual(nearestStoppingTurn, pacman.getNearestStoppingTurn());
	}
}
