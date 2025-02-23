import { App } from "../../../../../../src/main/App.js";
import Board from "../../../../../../src/main/board/Board.js";
import Inky from "../../../../../../src/main/board/boardobject/children/character/Inky.js";
import PacMan from "../../../../../../src/main/board/boardobject/children/character/PacMan.js";
import Pinky from "../../../../../../src/main/board/boardobject/children/character/Pinky.js";
import Moveable from "../../../../../../src/main/board/boardobject/children/moveable/Moveable.js";
import MovementDirection from "../../../../../../src/main/board/boardobject/children/moveable/MovementDirection.js";
import Turn from "../../../../../../src/main/board/boardobject/children/Turn.js";
import type { Position } from "../../../../../../src/main/GameElement.js";
import { millisToSeconds } from "../../../../../../src/main/utils/Utils.js";
import Test from "../../../../../base/Base.js";
import { tests } from "../../../../../base/Decorators.js";

/**
 * Tests functionality of `Moveable` instances.
 */
@tests(Moveable)
export default class MoveableTest extends Test {
	/**
	 * Test that moveable instances get created correctly.
	 */
	public createMoveableTest(): void {
		const moveable = new PacMan();

		this.assertStrictlyEqual(PacMan["PACMAN_SPEED"] * 0.8, moveable["speed"]);
		this.assertStrictlyEqual(
			PacMan["PACMAN_SPEED"] * 0.8 * millisToSeconds(App.DESIRED_MS_PER_FRAME),
			moveable["distancePerFrame"]
		);
	}

	/**
	 * Test that moveables can get their speed correctly.
	 */
	public getSpeedTest(): void {
		const pacman = new PacMan();

		this.assertStrictlyEqual(PacMan["PACMAN_SPEED"] * 0.8, pacman.getSpeed());
	}

	/**
	 * Test that moveables can get their current direction correctly.
	 */
	public getCurrentDirectionTest(): void {
		const pacman = new PacMan();

		this.assertDoesntExist(pacman.getCurrentDirection());

		const movementDirection = MovementDirection.UP;

		pacman["currentDirection"] = movementDirection;

		this.assertStrictlyEqual(movementDirection, pacman["currentDirection"]);
	}

	/**
	 * Test that moveables can get their last movement code correctly.
	 */
	public getLastMoveCodeTest(): void {
		const pacman = new PacMan();

		this.assertDoesntExist(pacman.getLastMoveCode());

		const movementDirection = MovementDirection.UP;

		pacman["lastMoveCode"] = movementDirection;

		this.assertStrictlyEqual(movementDirection, pacman["lastMoveCode"]);
	}

	/**
	 * Test that moveables can get their last movement code correctly.
	 */
	public getDistancePerFrameTest(): void {
		const moveable = new PacMan();

		this.assertStrictlyEqual(
			PacMan["PACMAN_SPEED"] * 0.8 * millisToSeconds(App.DESIRED_MS_PER_FRAME),
			moveable.getDistancePerFrame()
		);
	}

	/**
	 * Test that moveables can get their turn queue data correctly.
	 */
	public getTurnQueueTest(): void {
		const moveable = new PacMan();
		const turnQueue = moveable.getTurnQueue();

		this.assertEmpty(turnQueue);

		const testTurn = new Turn("test-turn", [MovementDirection.RIGHT]);

		moveable["queueTurn"](MovementDirection.RIGHT, testTurn);

		this.assertStrictlyEqual(testTurn, turnQueue[0]!.turn);
		this.assertStrictlyEqual(MovementDirection.RIGHT, turnQueue[0]!.direction);
	}

	/**
	 * Test that moveables can get whether or not they are moving correctly.
	 */
	public isMovingTest(): void {
		const pacman = new PacMan();

		this.assertFalse(pacman.isMoving());

		const movementDirection = MovementDirection.UP;

		pacman.startMoving(movementDirection);

		this.assertTrue(pacman.isMoving());

		pacman.stopMoving();

		this.assertFalse(pacman.isMoving());
	}

	/**
	 * Test that moveables can stop moving correctly.
	 */
	public stopMovingTest(): void {
		const pacman = new PacMan();

		this.assertFalse(pacman.isMoving());

		const movementDirection = MovementDirection.UP;

		pacman.startMoving(movementDirection);

		this.assertTrue(pacman.isMoving());

		pacman.setPosition({ x: 500, y: 700 });
		pacman.stopMoving();

		this.assertFalse(pacman.isMoving());
		this.assertArrayLength(0, pacman["turnQueue"]);
		this.assertDoesntExist(pacman["lastMoveCode"]);
		this.assertStrictlyEqual(0, pacman["_framesUpdating"]);
		this.assertArrayDoesntContain(pacman, App.COLLIDABLES_MAP[pacman["getCollidablePositionKey"]()]!);
		this.assertDoesntExist(pacman["_animationIntervalId"]);
		this.assertDoesntExist(pacman.getCurrentDirection());
	}

	/**
	 * Test that moveables can start moving correctly.
	 */
	public startMovingTest(): void {
		const pacman = new PacMan();

		this.assertFalse(pacman.isMoving());

		const movementDirection = MovementDirection.UP;
		const turn = new Turn("test-turn", [movementDirection]);

		turn.setPosition({
			x: 500,
			y: 700,
		});

		pacman["turnQueue"].push({
			direction: movementDirection,
			turn,
		});
		pacman.startMoving(movementDirection);

		this.assertTrue(pacman.isMoving());
		this.assertArrayLength(0, pacman["turnQueue"]);
		this.assertStrictlyEqual(movementDirection, pacman.getCurrentDirection());
		this.assertOfType("number", pacman["_animationIntervalId"]);
		this.assertStrictlyEqual(movementDirection, pacman.getLastMoveCode());

		pacman.stopMoving();
		pacman.startMoving(movementDirection, {
			fromTurn: turn,
		});

		const position = pacman.getPosition();
		const turnCenterPosition = turn.getCenterPosition();

		this.assertTrue(pacman.isMoving());
		this.assertArrayLength(0, pacman["turnQueue"]);
		this.assertStrictlyEqual(movementDirection, pacman.getCurrentDirection());
		this.assertOfType("number", pacman["_animationIntervalId"]);
		this.assertStrictlyEqual(movementDirection, pacman.getLastMoveCode());
		this.assertStrictlyEqual(turnCenterPosition.x - pacman.getWidth()! / 2, position.x);
		this.assertStrictlyEqual(turnCenterPosition.y - pacman.getHeight()! / 2, position.y);

		pacman.stopMoving();
	}

	/**
	 * Test that moveables can tick each frame correctly.
	 */
	public async tickTest(): Promise<void> {
		await Board.getInstance()["loadTurnData"]();

		const pacman = new PacMan();
		const turn = Board.getInstance().getTurns()[0]!;
		const turnCenterPosition = turn.getCenterPosition();
		const turnFirstDirection = turn.getDirections()[0]!;

		pacman.setPosition({
			x: turnCenterPosition.x - pacman.getWidth() / 2,
			y: turnCenterPosition.y - pacman.getHeight() / 2,
		});
		pacman.startMoving(turnFirstDirection);
		pacman.tick();

		this.assertTrue(pacman.isMoving());
		this.assertStrictlyEqual(turnFirstDirection, pacman.getCurrentDirection());

		let movementDirection = MovementDirection.LEFT;

		pacman.stopMoving();

		this.assertStrictlyEqual(0, pacman["_framesUpdating"]);

		// finally, we want to test that moveables move a certain amount every tick(), depending
		// on the direction they are moving and that the frame count increases for the moveable.
		// first, test the "UP" direction
		movementDirection = MovementDirection.UP;
		let originalPosition: Position = {
			x: 0,
			y: 0,
		};

		pacman["currentDirection"] = movementDirection;
		pacman.setPosition({
			x: originalPosition.x,
			y: originalPosition.y,
		});
		pacman.startMoving(movementDirection);
		pacman.tick();

		this.assertStrictlyEqual(
			originalPosition.y - pacman.getSpeed() * millisToSeconds(App.DESIRED_MS_PER_FRAME),
			pacman.getPosition().y
		);
		this.assertStrictlyEqual(1, pacman["_framesUpdating"]);

		// test the "DOWN" direction
		movementDirection = MovementDirection.DOWN;
		originalPosition = {
			x: 0,
			y: 0,
		};

		pacman["currentDirection"] = movementDirection;
		pacman.setPosition({
			x: originalPosition.x,
			y: originalPosition.y,
		});
		pacman.startMoving(movementDirection);
		pacman.tick();

		this.assertStrictlyEqual(
			originalPosition.y + pacman.getSpeed() * millisToSeconds(App.DESIRED_MS_PER_FRAME),
			pacman.getPosition().y
		);
		this.assertStrictlyEqual(1, pacman["_framesUpdating"]);

		// test the "LEFT" direction
		movementDirection = MovementDirection.LEFT;
		originalPosition = {
			x: 0,
			y: 0,
		};

		pacman["currentDirection"] = movementDirection;
		pacman.setPosition({
			x: originalPosition.x,
			y: originalPosition.y,
		});
		pacman.startMoving(movementDirection);
		pacman.tick();

		this.assertStrictlyEqual(
			originalPosition.x - pacman.getSpeed() * millisToSeconds(App.DESIRED_MS_PER_FRAME),
			pacman.getPosition().x
		);
		this.assertStrictlyEqual(1, pacman["_framesUpdating"]);

		// test the "RIGHT" direction
		movementDirection = MovementDirection.RIGHT;
		originalPosition = {
			x: 0,
			y: 0,
		};

		pacman["currentDirection"] = movementDirection;
		pacman.setPosition({
			x: originalPosition.x,
			y: originalPosition.y,
		});
		pacman.startMoving(movementDirection);
		pacman.tick();

		this.assertStrictlyEqual(
			originalPosition.x + pacman.getSpeed() * millisToSeconds(App.DESIRED_MS_PER_FRAME),
			pacman.getPosition().x
		);
		this.assertStrictlyEqual(1, pacman["_framesUpdating"]);
	}

	/**
	 * Test that moveables can interpolate their positions each frame correctly.
	 */
	public interpolateTest(): void {
		const moveable = new Inky();

		moveable.setPosition({
			x: 300,
			y: 400,
		});

		const moveablePosition = moveable.getPosition();
		const oldPosition: Position = {
			x: moveablePosition.x,
			y: moveablePosition.y,
		};
		const oldPositionX = oldPosition.x;
		const alpha = 0.5;

		moveable.startMoving(MovementDirection.RIGHT);
		moveable.interpolate(alpha, oldPosition);

		this.assertStrictlyEqual(oldPositionX * alpha + oldPositionX * (1.0 - alpha), moveable.getPosition().x);
	}

	/**
	 * Test that moveables can delete themselves correctly.
	 */
	public deleteTest(): void {
		const moveable = new Pinky();

		this.assertArrayContains(moveable, App.MOVEABLES);

		moveable.delete();

		this.assertArrayDoesntContain(moveable, App.MOVEABLES);
	}

	/**
	 * Test that moveables can queue turns correctly.
	 */
	public async queueTurnTest(): Promise<void> {
		await Board.getInstance()["loadTurnData"]();

		const moveable = new PacMan();

		this.assertArrayLength(0, moveable["turnQueue"]);

		const turn = Board.getInstance().getTurns()[0]!;

		moveable["queueTurn"](turn.getDirections()[0]!, turn);

		this.assertArrayLength(1, moveable["turnQueue"]);
		this.assertStrictlyEqual(turn, moveable["turnQueue"][0]!.turn);
		this.assertStrictlyEqual(turn.getDirections()[0]!, moveable["turnQueue"][0]!.direction);

		moveable["queueTurn"](turn.getDirections()[1]!, turn);

		this.assertArrayLength(1, moveable["turnQueue"]);
		this.assertStrictlyEqual(turn, moveable["turnQueue"][0]!.turn);
		this.assertStrictlyEqual(turn.getDirections()[1]!, moveable["turnQueue"][0]!.direction);
	}

	/**
	 * Test that moveables can check if they can turn at given turns correctly.
	 */
	public canTurnWithMoveDirectionTest(): void {
		const turnWithRightDirection = new Turn("test-right", [MovementDirection.RIGHT]);

		this.assertTrue(Moveable["canTurnWithMoveDirection"](MovementDirection.RIGHT, turnWithRightDirection));

		const turnWithLeftDirection = new Turn("test-left", [MovementDirection.LEFT]);

		this.assertFalse(Moveable["canTurnWithMoveDirection"](MovementDirection.RIGHT, turnWithLeftDirection));
	}

	/**
	 * Test that moveables can have their positions set to a turn's position correctly.
	 */
	public async offsetPositionToTurnTest(): Promise<void> {
		await Board.getInstance()["loadTurnData"]();

		const moveable = new PacMan();
		const turnData = Board.getInstance().getTurns()[0]!;

		moveable["offsetPositionToTurn"](turnData);

		const moveablePosition = moveable.getPosition();
		const turnCenterPosition = turnData.getCenterPosition();

		this.assertStrictlyEqual(turnCenterPosition.x - moveable.getWidth() / 2, moveablePosition.x);
		this.assertStrictlyEqual(turnCenterPosition.y - moveable.getHeight() / 2, moveablePosition.y);
	}

	/**
	 * Test that moveables can find the nearest turn to them correctly.
	 */
	public async findNearestTurnTest(): Promise<void> {
		const moveable = new PacMan();
		let direction = MovementDirection.RIGHT;

		moveable.setPosition({
			x: 300,
			y: 400,
		});
		moveable.startMoving(direction);

		const moveableCenterPosition = moveable.getCenterPosition();
		const turn1 = new Turn("turn-1", [direction]);
		const turn2 = new Turn("turn-2", [direction]);

		turn1.setPosition({
			x: moveableCenterPosition.x + 40,
			y: moveableCenterPosition.y - turn1.getHeight() / 2,
		});
		turn2.setPosition({
			x: moveableCenterPosition.x + 60,
			y: moveableCenterPosition.y - turn2.getHeight() / 2,
		});

		Board.getInstance()["turns"] = [turn1, turn2];

		let nearestTurn = moveable["findNearestTurn"]()!;
		let nearestTurnPosition = nearestTurn.getPosition();
		let actualNearestTurnPosition = Board.getInstance().getTurns()[0]!.getPosition();

		// nearest turn should be one that is least pixels away horizontally
		this.assertStrictlyEqual(nearestTurnPosition.x, actualNearestTurnPosition.x);
		this.assertStrictlyEqual(nearestTurnPosition.y, actualNearestTurnPosition.y);

		direction = MovementDirection.UP;

		moveable.startMoving(direction);

		const turn3 = new Turn("turn-3", [direction]);
		const turn4 = new Turn("turn-4", [direction]);

		turn3.setPosition({
			x: moveableCenterPosition.x - turn3.getWidth() / 2,
			y: moveableCenterPosition.y - 60,
		});
		turn4.setPosition({
			x: moveableCenterPosition.x - turn4.getWidth() / 2,
			y: moveableCenterPosition.y - 40,
		});

		Board.getInstance()["turns"] = [turn3, turn4];

		nearestTurn = moveable["findNearestTurn"]()!;
		nearestTurnPosition = nearestTurn.getPosition();
		actualNearestTurnPosition = Board.getInstance().getTurns()[1]!.getPosition();

		// nearest turn should be one that is least pixels away vertically
		this.assertStrictlyEqual(nearestTurnPosition.x, actualNearestTurnPosition.x);
		this.assertStrictlyEqual(nearestTurnPosition.y, actualNearestTurnPosition.y);
	}

	/**
	 * Test that moveables can find the nearest turn to them where a certain condition is met correctly.
	 */
	public async findNearestTurnWhereTest(): Promise<void> {
		const moveable = new PacMan();
		let direction = MovementDirection.RIGHT;

		moveable.setPosition({
			x: 300,
			y: 400,
		});
		moveable.startMoving(direction);

		const moveableCenterPosition = moveable.getCenterPosition();
		const turn1 = new Turn("turn-1", [direction]);
		const turn2 = new Turn("turn-2", [direction]);

		turn1.setPosition({
			x: moveableCenterPosition.x + 40,
			y: moveableCenterPosition.y - turn1.getHeight() / 2,
		});
		turn2.setPosition({
			x: moveableCenterPosition.x + 60,
			y: moveableCenterPosition.y - turn2.getHeight() / 2,
		});

		Board.getInstance()["turns"] = [turn1, turn2];

		let nearestTurn = moveable["findNearestTurnWhere"](
			(turn) => turn.getPosition().x === moveableCenterPosition.x + 40
		)!;
		let nearestTurnPosition = nearestTurn.getPosition();
		let actualNearestTurnPosition = Board.getInstance().getTurns()[0]!.getPosition();

		// nearest turn should be one that is least pixels away horizontally and fits filter
		this.assertStrictlyEqual(nearestTurnPosition.x, actualNearestTurnPosition.x);
		this.assertStrictlyEqual(nearestTurnPosition.y, actualNearestTurnPosition.y);

		direction = MovementDirection.UP;

		moveable.startMoving(direction);

		const turn3 = new Turn("turn-3", [direction]);
		const turn4 = new Turn("turn-4", [direction]);

		turn3.setPosition({
			x: moveableCenterPosition.x - turn3.getWidth() / 2,
			y: moveableCenterPosition.y - 60,
		});
		turn4.setPosition({
			x: moveableCenterPosition.x - turn4.getWidth() / 2,
			y: moveableCenterPosition.y - 40,
		});

		Board.getInstance()["turns"] = [turn3, turn4];

		nearestTurn = moveable["findNearestTurnWhere"](
			(turn) => turn.getPosition().y === moveableCenterPosition.y - 40
		)!;
		nearestTurnPosition = nearestTurn.getPosition();
		actualNearestTurnPosition = Board.getInstance().getTurns()[1]!.getPosition();

		// nearest turn should be one that is least pixels away vertically and fits filter
		this.assertStrictlyEqual(nearestTurnPosition.x, actualNearestTurnPosition.x);
		this.assertStrictlyEqual(nearestTurnPosition.y, actualNearestTurnPosition.y);
	}

	/**
	 * Test that moveables can check if distances are within their frame-distance correctly.
	 */
	public distanceWithinDistancePerFrameTest(): void {
		const moveable = new PacMan();
		const distancePerFrame = moveable.getDistancePerFrame();

		this.assertFalse(moveable["distanceWithinDistancePerFrame"](0, distancePerFrame + 1));
		this.assertTrue(moveable["distanceWithinDistancePerFrame"](0, distancePerFrame - 1));
		this.assertTrue(moveable["distanceWithinDistancePerFrame"](0, distancePerFrame));
	}

	/**
	 * Test that moveables can dequeue their turns correctly.
	 */
	public dequeueTurnsTest(): void {
		const moveable = new PacMan();
		const queuedTurn = new Turn("test-turn", [MovementDirection.RIGHT]);

		moveable["queueTurn"](MovementDirection.RIGHT, queuedTurn);

		this.assertArrayLength(1, moveable["turnQueue"]);

		moveable["dequeueTurns"]();

		this.assertArrayLength(0, moveable["turnQueue"]);
	}

	/**
	 * Test that moveables can move up correctly.
	 */
	public moveUpTest(): void {
		const moveable = new PacMan();
		const originalPosition: Position = {
			x: 0,
			y: 0,
		};
		const moveAmount = 15;

		moveable["moveUp"](moveAmount);

		this.assertStrictlyEqual(originalPosition.y - moveAmount, moveable.getPosition().y);
	}

	/**
	 * Test that moveables can move down correctly.
	 */
	public moveDownTest(): void {
		const moveable = new PacMan();
		const originalPosition: Position = {
			x: 0,
			y: 0,
		};
		const moveAmount = 15;

		moveable["moveDown"](moveAmount);

		this.assertStrictlyEqual(originalPosition.y + moveAmount, moveable.getPosition().y);
	}

	/**
	 * Test that moveables can move left correctly.
	 */
	public moveLeftTest(): void {
		const moveable = new PacMan();
		const originalPosition: Position = {
			x: 0,
			y: 0,
		};
		const moveAmount = 15;

		moveable["moveLeft"](moveAmount);

		this.assertStrictlyEqual(originalPosition.x - moveAmount, moveable.getPosition().x);
	}

	/**
	 * Test that moveables can move left correctly.
	 */
	public moveRightTest(): void {
		const moveable = new PacMan();
		const originalPosition: Position = {
			x: 0,
			y: 0,
		};
		const moveAmount = 15;

		moveable["moveRight"](moveAmount);

		this.assertStrictlyEqual(originalPosition.x + moveAmount, moveable.getPosition().x);
	}

	/**
	 * Test that moveables can set their current direction correctly.
	 */
	public setCurrentDirectionTest(): void {
		const moveable = new PacMan();
		const direction = MovementDirection.LEFT;

		moveable.setCurrentDirection(direction);

		this.assertStrictlyEqual(direction, moveable.getCurrentDirection());
	}
}
