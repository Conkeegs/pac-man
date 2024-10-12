import { App } from "../../../../../src/main/App.js";
import ImageRegistry from "../../../../../src/main/assets/ImageRegistry.js";
import Board, { type Position } from "../../../../../src/main/board/Board.js";
import Character from "../../../../../src/main/board/boardobject/children/character/Character.js";
import PacMan from "../../../../../src/main/board/boardobject/children/character/PacMan.js";
import Food from "../../../../../src/main/board/boardobject/children/Food.js";
import MovementDirection from "../../../../../src/main/board/boardobject/children/moveable/MovementDirection.js";
import { BOARDOBJECTS, CHARACTERS, COLLIDABLES_MAP, TILESIZE } from "../../../../../src/main/utils/Globals.js";
import { millisToSeconds, px } from "../../../../../src/main/utils/Utils.js";
import Assertion from "../../../../base/Assertion.js";
import Test from "../../../../base/Base.js";
import { tests } from "../../../../base/Decorators.js";

/**
 * Tests functionality of `src\main\board\boardobject\children\character\Character.ts` instances.
 */
@tests(Character)
export default class CharacterTest extends Test {
	/**
	 * Test that character instances can be created correctly.
	 */
	public createCharacterTest(): void {
		const pacman = new PacMan();
		const pacmanElement = pacman.getElement();

		Assertion.assertArrayContains(pacman, CHARACTERS);
		Assertion.assertStrictlyEqual(
			pacman["collisionThreshold"],
			Math.ceil(pacman.getSpeed() * millisToSeconds(App.DESIRED_MS_PER_FRAME)) + Character["COLLISION_PADDING"]
		);
		Assertion.assertStrictlyEqual(px(TILESIZE + Board.calcTileOffset(0.5)), pacmanElement.css("width"));
		Assertion.assertStrictlyEqual(px(TILESIZE + Board.calcTileOffset(0.5)), pacmanElement.css("height"));
		Assertion.assertStrictlyEqual(
			`url(\"${ImageRegistry.getImage("pacman-0")}\")`,
			pacmanElement.css("backgroundImage")
		);
	}

	/**
	 * Test that characters can get their speed correctly.
	 */
	public getSpeedTest(): void {
		const pacman = new PacMan();

		Assertion.assertStrictlyEqual(PacMan["PACMAN_SPEED"] * 0.8, pacman.getSpeed());
	}

	/**
	 * Test that characters can get their image source correctly.
	 */
	public getSourceTest(): void {
		const pacman = new PacMan();

		Assertion.assertStrictlyEqual(ImageRegistry.getImage("pacman-0"), pacman.getSource());
	}

	/**
	 * Test that characters can get their current direction correctly.
	 */
	public getCurrentDirectionTest(): void {
		const pacman = new PacMan();

		Assertion.assertDoesntExist(pacman.getCurrentDirection());

		const movementDirection = MovementDirection.UP;

		pacman["currentDirection"] = movementDirection;

		Assertion.assertStrictlyEqual(movementDirection, pacman["currentDirection"]);
	}

	/**
	 * Test that characters can get their last movement code correctly.
	 */
	public getLastMoveCodeTest(): void {
		const pacman = new PacMan();

		Assertion.assertDoesntExist(pacman.getLastMoveCode());

		const movementDirection = MovementDirection.UP;

		pacman["lastMoveCode"] = movementDirection;

		Assertion.assertStrictlyEqual(movementDirection, pacman["lastMoveCode"]);
	}

	/**
	 * Test that characters can get whether or not they are moving correctly.
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
	 * Test that characters can set its position correctly.
	 */
	public setPositionTest(): void {
		const pacman = new PacMan();
		const position: Position = { x: 500, y: 700 };

		pacman.setPosition(position);

		Assertion.assertArrayContains(
			pacman,
			COLLIDABLES_MAP[pacman._collidableManager["getCollidablePositionKey"]()]!
		);

		Assertion.assertStrictlyEqual(position, pacman.getPosition());
	}

	/**
	 * Test that characters can set their x positions correctly.
	 */
	public setPositionXTest(): void {
		const pacman = new PacMan();
		let position: Position = { x: 500, y: 700 };
		const collidableManager = pacman._collidableManager;

		pacman.setPosition(position);

		Assertion.assertArrayContains(pacman, COLLIDABLES_MAP[collidableManager["getCollidablePositionKey"]()]!);
		Assertion.assertStrictlyEqual(position, pacman.getPosition());

		const newPositionX = 800;

		pacman.setPositionX(newPositionX);

		Assertion.assertArrayContains(pacman, COLLIDABLES_MAP[collidableManager["getCollidablePositionKey"]()]!);
		Assertion.assertStrictlyEqual(newPositionX, pacman.getPosition().x);
	}

	/**
	 * Test that characters can set their y positions correctly.
	 */
	public setPositionYTest(): void {
		const pacman = new PacMan();
		let position: Position = { x: 500, y: 700 };
		const collidableManager = pacman._collidableManager;

		pacman.setPosition(position);

		Assertion.assertArrayContains(pacman, COLLIDABLES_MAP[collidableManager["getCollidablePositionKey"]()]!);
		Assertion.assertStrictlyEqual(position, pacman.getPosition());

		const newPositionY = 900;

		pacman.setPositionY(newPositionY);

		Assertion.assertArrayContains(pacman, COLLIDABLES_MAP[collidableManager["getCollidablePositionKey"]()]!);
		Assertion.assertStrictlyEqual(newPositionY, pacman.getPosition().y);
	}

	/**
	 * Test that characters can stop moving correctly.
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
		Assertion.assertArrayDoesntContain(
			pacman,
			COLLIDABLES_MAP[pacman["_collidableManager"]["getCollidablePositionKey"]()]!
		);
		Assertion.assertDoesntExist(pacman["animationIntervalId"]);
		Assertion.assertDoesntExist(pacman.getCurrentDirection());
	}

	/**
	 * Test that characters can start moving correctly.
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
		Assertion.assertOfType("number", pacman["animationIntervalId"]);
		Assertion.assertStrictlyEqual(movementDirection, pacman.getLastMoveCode());

		pacman.stopMoving();
		pacman.startMoving(movementDirection, {
			fromTurn: turn,
		});

		const position = pacman.getPosition();

		Assertion.assertTrue(pacman.isMoving());
		Assertion.assertArrayLength(0, pacman["turnQueue"]);
		Assertion.assertStrictlyEqual(movementDirection, pacman.getCurrentDirection());
		Assertion.assertOfType("number", pacman["animationIntervalId"]);
		Assertion.assertStrictlyEqual(movementDirection, pacman.getLastMoveCode());
		Assertion.assertStrictlyEqual(turn.x - pacman.getWidth()! / 2, position.x);
		Assertion.assertStrictlyEqual(turn.y - pacman.getHeight()! / 2, position.y);

		pacman.stopMoving();
	}

	/**
	 * Test that characters can tick each frame correctly.
	 */
	public async tickTest(): Promise<void> {
		const pacman = new PacMan();

		pacman["currentDirection"] = MovementDirection.STOP;
		pacman.tick();

		Assertion.assertFalse(pacman.isMoving());

		let food = new Food("test-food");
		let position: Position = { x: 100, y: 300 };
		const positionX = position.x;
		const positionY = position.y;
		const quarterPacmanWidth = pacman.getWidth() * 0.25;
		const quarterPacmanHeight = pacman.getHeight() * 0.25;

		pacman.setPosition({
			x: positionX - quarterPacmanWidth,
			y: positionY - quarterPacmanHeight,
		});
		food.setPosition({
			x: positionX,
			y: positionY,
		});

		const pacmanCenterPosition = pacman.getCenterPosition();
		const foodCenterPosition = food.getCenterPosition();
		const positionCollidables = COLLIDABLES_MAP[pacman["_collidableManager"]["getCollidablePositionKey"]()]!;

		// assert both pacman and food are at same location
		Assertion.assertTrue(pacman["distanceWithinThreshold"](pacmanCenterPosition.x, foodCenterPosition.x));
		Assertion.assertTrue(pacman["distanceWithinThreshold"](pacmanCenterPosition.y, foodCenterPosition.y));
		Assertion.assertArrayContains(pacman, positionCollidables);
		Assertion.assertArrayContains(food, positionCollidables);
		Assertion.assertArrayContains(pacman, BOARDOBJECTS);
		Assertion.assertArrayContains(food, BOARDOBJECTS);

		// load turn data since character tick() function uses it
		await App["loadTurnData"]();
		pacman.startMoving(MovementDirection.LEFT);
		// on this tick, pacman and food should collide
		pacman.tick();
		pacman.render();
		food.render();

		Assertion.assertArrayContains(pacman, BOARDOBJECTS);
		// food should be eaten and deleted
		Assertion.assertArrayDoesntContain(food, BOARDOBJECTS);
		Assertion.assertArrayDoesntContain(food, positionCollidables);

		food = new Food("test-food");

		pacman.setPosition({
			x: positionX - quarterPacmanWidth,
			y: positionY - quarterPacmanHeight,
		});
		food.setPosition({
			x: positionX,
			y: positionY,
		});

		pacman.startMoving(MovementDirection.RIGHT);
		// on this tick, pacman and food should collide
		pacman.tick();
		pacman.render();
		food.render();

		// food should be eaten and deleted
		Assertion.assertArrayDoesntContain(food, BOARDOBJECTS);
		Assertion.assertArrayDoesntContain(food, positionCollidables);

		food = new Food("test-food");

		pacman.setPosition({
			x: positionX - quarterPacmanWidth,
			y: positionY - quarterPacmanHeight,
		});
		food.setPosition({
			x: positionX,
			y: positionY,
		});

		pacman.startMoving(MovementDirection.UP);
		// on this tick, pacman and food should collide
		pacman.tick();
		pacman.render();
		food.render();

		// food should be eaten and deleted
		Assertion.assertArrayDoesntContain(food, BOARDOBJECTS);
		Assertion.assertArrayDoesntContain(food, positionCollidables);

		pacman.startMoving(MovementDirection.DOWN);
		// on this tick, pacman and food should collide
		pacman.tick();
		pacman.render();
		food.render();

		// food should be eaten and deleted
		Assertion.assertArrayDoesntContain(food, BOARDOBJECTS);
		Assertion.assertArrayDoesntContain(food, positionCollidables);

		const oldMovementDirection = MovementDirection.UP;
		const newMovementDirection = MovementDirection.DOWN;
		position = { x: 500, y: 700 };

		pacman.setPosition(position);
		pacman.startMoving(oldMovementDirection);
		pacman["turnQueue"].push({
			// queue new direction to go in
			direction: newMovementDirection,
			// make sure turn coordinates same as character's center so that
			// we start moving in queued-turn's direction
			turn: {
				x: position.x + pacman.getWidth()! / 2,
				y: position.y + pacman.getHeight()! / 2,
				directions: [newMovementDirection],
			},
		});
		pacman.tick();

		Assertion.assertTrue(pacman.isMoving());
		Assertion.assertStrictlyEqual(newMovementDirection, pacman.getCurrentDirection());

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
		// set current direction to make character able to use left teleporter
		pacman["currentDirection"] = movementDirection;
		// set position to left teleporter's position
		pacman.setPosition({
			x: leftTeleporterPosition.x,
			y: leftTeleporterPosition.y,
		});
		pacman.startMoving(movementDirection);
		pacman.tick();

		// character should have been teleported to opposite (right) teleporter
		Assertion.assertStrictlyEqual(rightTeleporterPosition.x, pacman.getPosition().x);

		movementDirection = MovementDirection.RIGHT;

		pacman.stopMoving();
		// set current direction to make character able to use right teleporter
		pacman["currentDirection"] = movementDirection;
		// set position to right teleporter's position
		pacman.setPosition({
			x: rightTeleporterPosition.x,
			y: rightTeleporterPosition.y,
		});
		pacman.startMoving(movementDirection);
		pacman.tick();

		// character should have been teleported to opposite (left) teleporter
		Assertion.assertStrictlyEqual(leftTeleporterPosition.x, pacman.getPosition().x);

		pacman.stopMoving();

		Assertion.assertStrictlyEqual(0, pacman["_framesUpdating"]);

		// finally, we want to test that character's move a certain amount every tick(), depending
		// on the direction they are moving and that the frame count increases for the character.
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
}
