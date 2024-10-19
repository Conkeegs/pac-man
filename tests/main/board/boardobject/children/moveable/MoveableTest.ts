import { App } from "../../../../../../src/main/App.js";
import type { Position } from "../../../../../../src/main/board/Board.js";
import Board from "../../../../../../src/main/board/Board.js";
import Inky from "../../../../../../src/main/board/boardobject/children/character/Inky.js";
import PacMan from "../../../../../../src/main/board/boardobject/children/character/PacMan.js";
import Pinky from "../../../../../../src/main/board/boardobject/children/character/Pinky.js";
import Moveable from "../../../../../../src/main/board/boardobject/children/moveable/Moveable.js";
import MovementDirection from "../../../../../../src/main/board/boardobject/children/moveable/MovementDirection.js";
import { TILESIZE } from "../../../../../../src/main/utils/Globals.js";
import { millisToSeconds } from "../../../../../../src/main/utils/Utils.js";
import Assertion from "../../../../../base/Assertion.js";
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

		Assertion.assertStrictlyEqual(PacMan["PACMAN_SPEED"] * 0.8, moveable["speed"]);
		Assertion.assertStrictlyEqual(
			PacMan["PACMAN_SPEED"] * 0.8 * millisToSeconds(App.DESIRED_MS_PER_FRAME),
			moveable["distancePerFrame"]
		);
	}

	/**
	 * Test that moveables can get their speed correctly.
	 */
	public getSpeedTest(): void {
		const pacman = new PacMan();

		Assertion.assertStrictlyEqual(PacMan["PACMAN_SPEED"] * 0.8, pacman.getSpeed());
	}

	/**
	 * Test that moveables can get their current direction correctly.
	 */
	public getCurrentDirectionTest(): void {
		const pacman = new PacMan();

		Assertion.assertDoesntExist(pacman.getCurrentDirection());

		const movementDirection = MovementDirection.UP;

		pacman["currentDirection"] = movementDirection;

		Assertion.assertStrictlyEqual(movementDirection, pacman["currentDirection"]);
	}

	/**
	 * Test that moveables can get their last movement code correctly.
	 */
	public getLastMoveCodeTest(): void {
		const pacman = new PacMan();

		Assertion.assertDoesntExist(pacman.getLastMoveCode());

		const movementDirection = MovementDirection.UP;

		pacman["lastMoveCode"] = movementDirection;

		Assertion.assertStrictlyEqual(movementDirection, pacman["lastMoveCode"]);
	}

	/**
	 * Test that moveables can get their last movement code correctly.
	 */
	public getDistancePerFrameTest(): void {
		const moveable = new PacMan();

		Assertion.assertStrictlyEqual(
			PacMan["PACMAN_SPEED"] * 0.8 * millisToSeconds(App.DESIRED_MS_PER_FRAME),
			moveable.getDistancePerFrame()
		);
	}

	/**
	 * Test that moveables can get whether or not they are moving correctly.
	 */
	public isMovingTest(): void {
		const pacman = new PacMan();

		Assertion.assertFalse(pacman.isMoving());

		const movementDirection = MovementDirection.UP;

		pacman.startMoving(movementDirection);

		Assertion.assertTrue(pacman.isMoving());

		pacman.stopMoving();

		Assertion.assertFalse(pacman.isMoving());
	}

	/**
	 * Test that moveables can stop moving correctly.
	 */
	public stopMovingTest(): void {
		const pacman = new PacMan();

		Assertion.assertFalse(pacman.isMoving());

		const movementDirection = MovementDirection.UP;

		pacman.startMoving(movementDirection);

		Assertion.assertTrue(pacman.isMoving());

		pacman.setPosition({ x: 500, y: 700 });
		pacman.stopMoving();

		Assertion.assertFalse(pacman.isMoving());
		Assertion.assertArrayLength(0, pacman["turnQueue"]);
		Assertion.assertDoesntExist(pacman["lastMoveCode"]);
		Assertion.assertStrictlyEqual(0, pacman["_framesUpdating"]);
		Assertion.assertArrayDoesntContain(pacman, App.COLLIDABLES_MAP[pacman["getCollidablePositionKey"]()]!);
		Assertion.assertDoesntExist(pacman["_animationIntervalId"]);
		Assertion.assertDoesntExist(pacman.getCurrentDirection());
	}

	/**
	 * Test that moveables can start moving correctly.
	 */
	public startMovingTest(): void {
		const pacman = new PacMan();

		Assertion.assertFalse(pacman.isMoving());

		const movementDirection = MovementDirection.UP;
		const turn = {
			x: 500,
			y: 700,
			directions: [movementDirection],
		};

		pacman["turnQueue"].push({
			direction: movementDirection,
			turn,
		});
		pacman.startMoving(movementDirection);

		Assertion.assertTrue(pacman.isMoving());
		Assertion.assertArrayLength(0, pacman["turnQueue"]);
		Assertion.assertStrictlyEqual(movementDirection, pacman.getCurrentDirection());
		Assertion.assertOfType("number", pacman["_animationIntervalId"]);
		Assertion.assertStrictlyEqual(movementDirection, pacman.getLastMoveCode());

		pacman.stopMoving();
		pacman.startMoving(movementDirection, {
			fromTurn: turn,
		});

		const position = pacman.getPosition();

		Assertion.assertTrue(pacman.isMoving());
		Assertion.assertArrayLength(0, pacman["turnQueue"]);
		Assertion.assertStrictlyEqual(movementDirection, pacman.getCurrentDirection());
		Assertion.assertOfType("number", pacman["_animationIntervalId"]);
		Assertion.assertStrictlyEqual(movementDirection, pacman.getLastMoveCode());
		Assertion.assertStrictlyEqual(turn.x - pacman.getWidth()! / 2, position.x);
		Assertion.assertStrictlyEqual(turn.y - pacman.getHeight()! / 2, position.y);

		pacman.stopMoving();
	}

	/**
	 * Test that moveables can tick each frame correctly.
	 */
	public async tickTest(): Promise<void> {
		await Board.getInstance()["loadTurnData"]();

		const pacman = new PacMan();
		const turn = Board.getInstance().turnData![0]!;
		const turnFirstDirection = turn.directions[0]!;

		pacman.setPosition({
			x: turn.x - pacman.getWidth() / 2,
			y: turn.y - pacman.getHeight() / 2,
		});
		pacman.startMoving(turnFirstDirection);
		pacman.tick();

		Assertion.assertTrue(pacman.isMoving());
		Assertion.assertStrictlyEqual(turnFirstDirection, pacman.getCurrentDirection());

		const leftTeleporterPosition = pacman["TELEPORTER_DIRECTION_MAP"][MovementDirection.LEFT]!;
		const rightTeleporterPosition = pacman["TELEPORTER_DIRECTION_MAP"][MovementDirection.RIGHT]!;

		Assertion.assertStrictlyEqual(
			Board.calcTileOffsetX(1) - (TILESIZE + Board.calcTileOffset(0.5)),
			leftTeleporterPosition.x
		);
		Assertion.assertStrictlyEqual(Board.calcTileOffsetY(18.25), leftTeleporterPosition.y);
		Assertion.assertStrictlyEqual(Board.calcTileOffsetX(29), rightTeleporterPosition.x);
		Assertion.assertStrictlyEqual(Board.calcTileOffsetY(18.25), rightTeleporterPosition.y);

		let movementDirection = MovementDirection.LEFT;

		pacman.stopMoving();
		// set current direction to make moveables able to use left teleporter
		pacman["currentDirection"] = movementDirection;
		// set position to left teleporter's position
		pacman.setPosition({
			x: leftTeleporterPosition.x,
			y: leftTeleporterPosition.y,
		});
		pacman.startMoving(movementDirection);
		pacman.tick();

		// moveables should have been teleported to opposite (right) teleporter
		Assertion.assertStrictlyEqual(rightTeleporterPosition.x, pacman.getPosition().x);

		movementDirection = MovementDirection.RIGHT;

		pacman.stopMoving();
		// set current direction to make moveable able to use right teleporter
		pacman["currentDirection"] = movementDirection;
		// set position to right teleporter's position
		pacman.setPosition({
			x: rightTeleporterPosition.x,
			y: rightTeleporterPosition.y,
		});
		pacman.startMoving(movementDirection);
		pacman.tick();

		// moveable should have been teleported to opposite (left) teleporter
		Assertion.assertStrictlyEqual(leftTeleporterPosition.x, pacman.getPosition().x);

		pacman.stopMoving();

		Assertion.assertStrictlyEqual(0, pacman["_framesUpdating"]);

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

		Assertion.assertStrictlyEqual(
			originalPosition.y - pacman.getSpeed() * millisToSeconds(App.DESIRED_MS_PER_FRAME),
			pacman.getPosition().y
		);
		Assertion.assertStrictlyEqual(1, pacman["_framesUpdating"]);

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

		Assertion.assertStrictlyEqual(
			originalPosition.y + pacman.getSpeed() * millisToSeconds(App.DESIRED_MS_PER_FRAME),
			pacman.getPosition().y
		);
		Assertion.assertStrictlyEqual(1, pacman["_framesUpdating"]);

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

		Assertion.assertStrictlyEqual(
			originalPosition.x - pacman.getSpeed() * millisToSeconds(App.DESIRED_MS_PER_FRAME),
			pacman.getPosition().x
		);
		Assertion.assertStrictlyEqual(1, pacman["_framesUpdating"]);

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

		Assertion.assertStrictlyEqual(
			originalPosition.x + pacman.getSpeed() * millisToSeconds(App.DESIRED_MS_PER_FRAME),
			pacman.getPosition().x
		);
		Assertion.assertStrictlyEqual(1, pacman["_framesUpdating"]);
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

		Assertion.assertStrictlyEqual(oldPositionX * alpha + oldPositionX * (1.0 - alpha), moveable.getPosition().x);
	}

	/**
	 * Test that moveables can delete themselves correctly.
	 */
	public deleteTest(): void {
		const moveable = new Pinky();

		Assertion.assertArrayContains(moveable, App.MOVEABLES);

		moveable.delete();

		Assertion.assertArrayDoesntContain(moveable, App.MOVEABLES);
	}

	/**
	 * Test that moveables can queue turns correctly.
	 */
	public async queueTurnTest(): Promise<void> {
		await Board.getInstance()["loadTurnData"]();

		const moveable = new PacMan();

		Assertion.assertArrayLength(0, moveable["turnQueue"]);

		const turn = Board.getInstance().turnData![0]!;

		moveable["queueTurn"](turn.directions[0]!, turn);

		Assertion.assertArrayLength(1, moveable["turnQueue"]);
		Assertion.assertStrictlyEqual(turn, moveable["turnQueue"][0]!.turn);
		Assertion.assertStrictlyEqual(turn.directions[0]!, moveable["turnQueue"][0]!.direction);

		moveable["queueTurn"](turn.directions[1]!, turn);

		Assertion.assertArrayLength(1, moveable["turnQueue"]);
		Assertion.assertStrictlyEqual(turn, moveable["turnQueue"][0]!.turn);
		Assertion.assertStrictlyEqual(turn.directions[1]!, moveable["turnQueue"][0]!.direction);
	}

	/**
	 * Test that moveables can check if they can turn at given turns correctly.
	 */
	public canTurnWithMoveDirectionTest(): void {
		Assertion.assertTrue(
			Moveable["canTurnWithMoveDirection"](MovementDirection.RIGHT, {
				x: 300,
				y: 300,
				directions: [MovementDirection.RIGHT],
			})
		);
		Assertion.assertFalse(
			Moveable["canTurnWithMoveDirection"](MovementDirection.RIGHT, {
				x: 300,
				y: 300,
				directions: [MovementDirection.LEFT],
			})
		);
	}

	/**
	 * Test that moveables can have their positions set to a turn's position correctly.
	 */
	public async offsetPositionToTurnTest(): Promise<void> {
		await Board.getInstance()["loadTurnData"]();

		const moveable = new PacMan();
		const turnData = Board.getInstance().turnData![0]!;

		moveable["offsetPositionToTurn"](turnData);

		const moveablePosition = moveable.getPosition();

		Assertion.assertStrictlyEqual(turnData.x - moveable.getWidth() / 2, moveablePosition.x);
		Assertion.assertStrictlyEqual(turnData.y - moveable.getHeight() / 2, moveablePosition.y);
	}

	/**
	 * Test that moveables can find the nearest turn to them correctly.
	 */
	public async findNearestTurnTest(): Promise<void> {
		const moveable = new PacMan();
		const moveablePosition: Position = {
			x: 300,
			y: 400,
		};
		let direction = MovementDirection.RIGHT;

		moveable.setPosition(moveablePosition);
		moveable.startMoving(direction);

		Board.getInstance().turnData = [
			{
				x: moveablePosition.x + 40,
				y: moveablePosition.y + moveable.getHeight() / 2,
				directions: [direction],
			},
			{
				x: moveablePosition.x + 60,
				y: moveablePosition.y + moveable.getHeight() / 2,
				directions: [direction],
			},
		];

		let nearestTurn = moveable["findNearestTurn"]()!;

		// nearest turn should be one that is least pixels away horizontally
		Assertion.assertStrictlyEqual(nearestTurn.x, Board.getInstance().turnData![0]!.x);
		Assertion.assertStrictlyEqual(nearestTurn.y, Board.getInstance().turnData![0]!.y);

		direction = MovementDirection.UP;

		moveable.startMoving(direction);

		Board.getInstance().turnData = [
			{
				x: moveablePosition.x + moveable.getWidth() / 2,
				y: moveablePosition.y - 60,
				directions: [direction],
			},
			{
				x: moveablePosition.x + moveable.getWidth() / 2,
				y: moveablePosition.y - 40,
				directions: [direction],
			},
		];

		nearestTurn = moveable["findNearestTurn"]()!;

		// nearest turn should be one that is least pixels away vertically
		Assertion.assertStrictlyEqual(nearestTurn.x, Board.getInstance().turnData![1]!.x);
		Assertion.assertStrictlyEqual(nearestTurn.y, Board.getInstance().turnData![1]!.y);
	}

	/**
	 * Test that moveables can find the nearest turn to them where a certain condition is met correctly.
	 */
	public async findNearestTurnWhereTest(): Promise<void> {
		const moveable = new PacMan();
		const moveablePosition: Position = {
			x: 300,
			y: 400,
		};
		let direction = MovementDirection.RIGHT;

		moveable.setPosition(moveablePosition);
		moveable.startMoving(direction);

		Board.getInstance().turnData = [
			{
				x: moveablePosition.x + 40,
				y: moveablePosition.y + moveable.getHeight() / 2,
				directions: [direction],
			},
			{
				x: moveablePosition.x + 60,
				y: moveablePosition.y + moveable.getHeight() / 2,
				directions: [direction],
			},
		];

		let nearestTurn = moveable["findNearestTurnWhere"]((turn) => turn.x === moveablePosition.x + 40)!;

		// nearest turn should be one that is least pixels away horizontally and fits filter
		Assertion.assertStrictlyEqual(nearestTurn.x, Board.getInstance().turnData![0]!.x);
		Assertion.assertStrictlyEqual(nearestTurn.y, Board.getInstance().turnData![0]!.y);

		direction = MovementDirection.UP;

		moveable.startMoving(direction);

		Board.getInstance().turnData = [
			{
				x: moveablePosition.x + moveable.getWidth() / 2,
				y: moveablePosition.y - 60,
				directions: [direction],
			},
			{
				x: moveablePosition.x + moveable.getWidth() / 2,
				y: moveablePosition.y - 40,
				directions: [direction],
			},
		];

		nearestTurn = moveable["findNearestTurnWhere"]((turn) => turn.y === moveablePosition.y - 40)!;

		// nearest turn should be one that is least pixels away vertically and fits filter
		Assertion.assertStrictlyEqual(nearestTurn.x, Board.getInstance().turnData![1]!.x);
		Assertion.assertStrictlyEqual(nearestTurn.y, Board.getInstance().turnData![1]!.y);
	}

	/**
	 * Test that moveables can check if distances are within their frame-distance correctly.
	 */
	public distanceWithinDistancePerFrameTest(): void {
		const moveable = new PacMan();
		const distancePerFrame = moveable.getDistancePerFrame();

		Assertion.assertFalse(moveable["distanceWithinDistancePerFrame"](0, distancePerFrame + 1));
		Assertion.assertTrue(moveable["distanceWithinDistancePerFrame"](0, distancePerFrame - 1));
		Assertion.assertTrue(moveable["distanceWithinDistancePerFrame"](0, distancePerFrame));
	}

	/**
	 * Test that moveables can dequeue their turns correctly.
	 */
	public dequeueTurnsTest(): void {
		const moveable = new PacMan();

		moveable["queueTurn"](MovementDirection.RIGHT, {
			x: 300,
			y: 400,
			directions: [MovementDirection.RIGHT],
		});

		Assertion.assertArrayLength(1, moveable["turnQueue"]);

		moveable["dequeueTurns"]();

		Assertion.assertArrayLength(0, moveable["turnQueue"]);
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

		Assertion.assertStrictlyEqual(originalPosition.y - moveAmount, moveable.getPosition().y);
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

		Assertion.assertStrictlyEqual(originalPosition.y + moveAmount, moveable.getPosition().y);
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

		Assertion.assertStrictlyEqual(originalPosition.x - moveAmount, moveable.getPosition().x);
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

		Assertion.assertStrictlyEqual(originalPosition.x + moveAmount, moveable.getPosition().x);
	}
}
