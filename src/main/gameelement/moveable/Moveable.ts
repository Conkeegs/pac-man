import { App } from "../../app/App.js";
import Board from "../../Board.js";
import {
	MAX_PLAYABLE_TILE_X,
	MAX_PLAYABLE_TILE_Y,
	MIN_PLAYABLE_TILE_X,
	MIN_PLAYABLE_TILE_Y,
} from "../../utils/Globals.js";
import { GameElement, type Position } from "../GameElement.js";
import MakeTickable from "../mixins/Tickable.js";
import type Turn from "../Turn.js";
import MovementDirection from "./MovementDirection.js";

/**
 * Depending on which direction a game element is moving in, this object holds methods which
 * will change the game element's CSS `transform` value and also set it in memory.
 */
type MovementMethods = {
	[key in MovementDirection.LEFT | MovementDirection.RIGHT | MovementDirection.UP | MovementDirection.DOWN]: (
		/**
		 * The amount of pixels to change the `translateX` or `translateY` value (negative or positive).
		 */
		amount: number,
	) => void;
};

/**
 * Represents data present within a moveable's turn queue such as the direction it will turn
 * and the turn object at which it will turn.
 */
type TurnQueue = { direction: MovementDirection; turn: Turn }[];

/**
 * Represents a game element that is capable of moving across the board.
 */
export default abstract class Moveable extends MakeTickable(GameElement) {
	/**
	 * The speed of the game element (in pixels-per-second).
	 */
	private readonly speed: number;
	/**
	 * Determines if the game element is currently moving.
	 */
	private moving: boolean = false;
	/**
	 * Holds methods which will change the game element's CSS `transform` value and also set it in memory.
	 */
	private movementMethods: MovementMethods = {
		[MovementDirection.LEFT]: this.moveLeft,
		[MovementDirection.RIGHT]: this.moveRight,
		[MovementDirection.UP]: this.moveUp,
		[MovementDirection.DOWN]: this.moveDown,
	};
	/**
	 * Initial tile number based on this moveable's direction. Used when searching
	 * for nearest turns to this moveable.
	 */
	private initialTileNumMap = {
		[MovementDirection.LEFT]: () => Board.calcTileNumX(this.getCenterPosition().x),
		[MovementDirection.RIGHT]: () => Board.calcTileNumX(this.getCenterPosition().x),
		[MovementDirection.UP]: () => Board.calcTileNumY(this.getCenterPosition().y),
		[MovementDirection.DOWN]: () => Board.calcTileNumY(this.getCenterPosition().y),
	};
	/**
	 * Compares current tile number to the max/min tile that includes turns. based on this
	 * moveable's direction. Used when searching for nearest turns to this moveable.
	 */
	private tileNumComparatorMap = {
		[MovementDirection.LEFT]: (tileX: number) => tileX >= MIN_PLAYABLE_TILE_X,
		[MovementDirection.RIGHT]: (tileX: number) => tileX <= MAX_PLAYABLE_TILE_X,
		[MovementDirection.UP]: (tileY: number) => tileY <= MAX_PLAYABLE_TILE_Y,
		[MovementDirection.DOWN]: (tileY: number) => tileY > MIN_PLAYABLE_TILE_Y,
	};
	/**
	 * Updates tile number based on this moveable's direction. Used when searching
	 * for nearest turns to this moveable.
	 */
	private tileNumUpdaterMap = {
		[MovementDirection.LEFT]: (tileX: number) => tileX - 1,
		[MovementDirection.RIGHT]: (tileX: number) => tileX + 1,
		[MovementDirection.UP]: (tileY: number) => tileY + 1,
		[MovementDirection.DOWN]: (tileY: number) => tileY - 1,
	};
	/**
	 * Creates a tile key for a turn based on moveable's direction. Used when searching
	 * for nearest turns to this moveable.
	 */
	private turnTileKeyMap = {
		[MovementDirection.LEFT]: (tileX: number) =>
			Board.createTileKey(tileX, Board.calcTileNumY(this.getCenterPosition().y)),
		[MovementDirection.RIGHT]: (tileX: number) =>
			Board.createTileKey(tileX, Board.calcTileNumY(this.getCenterPosition().y)),
		[MovementDirection.UP]: (tileY: number) =>
			Board.createTileKey(Board.calcTileNumX(this.getCenterPosition().x), tileY),
		[MovementDirection.DOWN]: (tileY: number) =>
			Board.createTileKey(Board.calcTileNumX(this.getCenterPosition().x), tileY),
	};

	/**
	 * The position of this moveable just before its last tick.
	 */
	private oldPosition: Position | undefined;

	/**
	 * The current direction this game element is moving in.
	 */
	protected currentDirection: MovementDirection | undefined;
	/**
	 * The last direction this game element moved in.
	 */
	protected lastMovementDirection: MovementDirection | undefined;
	/**
	 * A queue of turns that a game element wants to make in the future. This suggests that the game element isn't
	 * within distance of the turn yet, and so must queue the turn. The length of this array
	 * must always be `1`.
	 */
	protected turnQueue: TurnQueue = [];
	/**
	 * Takes a given turn and a position and returns a boolean indicating whether or not the turn is "ahead" of the
	 * direction this game element is currently heading and if it is on the same "row"/"column" as the game element.
	 */
	protected turnValidators = {
		[MovementDirection.LEFT]: (turn: Turn) => {
			const turnCenterPosition = turn.getCenterPosition();
			const centerPosition = this.getCenterPosition();

			// only turns to the left of game element and in the same row
			return turnCenterPosition.x <= centerPosition.x && turnCenterPosition.y === centerPosition.y;
		},
		[MovementDirection.RIGHT]: (turn: Turn) => {
			const turnCenterPosition = turn.getCenterPosition();
			const centerPosition = this.getCenterPosition();

			// only turns to the right of game element and in the same row
			return turnCenterPosition.x >= centerPosition.x && turnCenterPosition.y === centerPosition.y;
		},
		[MovementDirection.UP]: (turn: Turn) => {
			const turnCenterPosition = turn.getCenterPosition();
			const centerPosition = this.getCenterPosition();

			// only turns above game element and in the same column
			return turnCenterPosition.y <= centerPosition.y && turnCenterPosition.x === centerPosition.x;
		},
		[MovementDirection.DOWN]: (turn: Turn) => {
			const turnCenterPosition = turn.getCenterPosition();
			const centerPosition = this.getCenterPosition();

			// only turns below game element and in the same column
			return turnCenterPosition.y >= centerPosition.y && turnCenterPosition.x === centerPosition.x;
		},
	};
	/**
	 * Takes a direction that a game element can move and returns the opposite direction of it.
	 */
	protected static readonly directionOpposites = {
		[MovementDirection.LEFT]: MovementDirection.RIGHT,
		[MovementDirection.RIGHT]: MovementDirection.LEFT,
		[MovementDirection.UP]: MovementDirection.DOWN,
		[MovementDirection.DOWN]: MovementDirection.UP,
	};

	/**
	 * The key used to index into a given `Position` object, given the direction this game element is moving.
	 */
	public static readonly directionalPositionKeys: {
		[key in Exclude<MovementDirection, MovementDirection.STOP>]: "x" | "y";
	} = {
		[MovementDirection.LEFT]: "x",
		[MovementDirection.RIGHT]: "x",
		[MovementDirection.UP]: "y",
		[MovementDirection.DOWN]: "y",
	};

	/**
	 * Creates a moveable game element.
	 *
	 * @param name
	 * @param width the width of this moveable
	 * @param height the height of this moveable
	 * @param speed the speed of the game element (in pixels-per-tick)
	 */
	constructor(name: string, width: number, height: number, speed: number) {
		super(name, width, height);

		this.speed = speed;
	}

	/**
	 * Gets this game element's speed in pixels-per-second.
	 *
	 * @returns this game element's speed in pixels-per-second
	 */
	public getSpeed() {
		return this.speed;
	}

	/**
	 * Get what direction this game element is currently moving in.
	 *
	 * @returns the current direction the game element is moving in
	 */
	public getCurrentDirection(): MovementDirection | undefined {
		return this.currentDirection;
	}

	/**
	 * Gets the last direction this game element moved in. This is useful, especially for pausing/unpausing, since
	 * we can use it to re-animate game element after unpausing the game.
	 *
	 * @returns the last `MovementDirection` this game element moved in
	 */
	public getLastMovementDirection(): MovementDirection | undefined {
		return this.lastMovementDirection;
	}

	/**
	 * Get this moveable's turn queue data.
	 *
	 * @returns this moveable's turn queue data
	 */
	public getTurnQueue(): TurnQueue {
		return this.turnQueue;
	}

	/**
	 * Determines if the game element is currently moving.
	 * @returns `boolean` if the game element is moving or not
	 */
	public isMoving() {
		return this.moving;
	}

	/**
	 * Sets the current direction this character is moving.
	 */
	public setCurrentDirection(direction: MovementDirection): void {
		this.dequeueTurns();

		this.currentDirection = direction;
	}

	/**
	 * Stops this game element from moving.
	 *
	 */
	public stopMoving(): void {
		this.dequeueTurns();
		this.lastMovementDirection = undefined;
		this._tickCount = 0;
		this.moving = false;

		// this.setShouldInterpolate(false);
		App.getInstance().getMovingMoveableIds().delete(this.getUniqueId());
	}

	/**
	 * Marks this game element as "moving", and will start moving in the given `MovementDirection`.
	 *
	 * @param direction the direction the game element is currently trying to move in
	 * @param options options that modify the way that this game element starts moving
	 */
	public startMoving(direction: MovementDirection) {
		// reset turn queue each time we head in a new direction
		this.dequeueTurns();

		if (this.moving) {
			this.stopMoving();
		}

		// set this game element's current direction since we now know that it's going to start moving
		this.setCurrentDirection(direction);

		this.moving = true;
		this.lastMovementDirection = direction;

		App.getInstance().getMovingMoveableIds().add(this.getUniqueId());
	}

	/**
	 * @inheritdoc
	 */
	public override tick(): void {
		// sanity check
		if (!this.moving) {
			return;
		}

		this.oldPosition = { ...this.getPosition() };
		this.movementMethods[this.currentDirection as keyof MovementMethods].bind(this)(this.speed);
		this.queueRenderUpdate();
		super.tick();
	}

	/**
	 * Renders this moveable with linear interpolation between its last and current position.
	 *
	 * @param alpha fractional time between the last and current physics tick
	 */
	public override render(): void {
		const currentDirectionKey =
			Moveable.directionalPositionKeys[this.currentDirection as keyof typeof Moveable.directionalPositionKeys];
		const oppositeDirectionKey = GameElement.positionKeyOpposites[currentDirectionKey];
		const position = this.position;

		this.setTransform({
			[currentDirectionKey]: this.interpolate(
				App.getInstance().getCurrentAlpha()!,
				this.oldPosition![currentDirectionKey],
				position[currentDirectionKey],
			),
			[oppositeDirectionKey]: position[oppositeDirectionKey],
		} as Position);
	}

	/**
	 * Deletes this moveable and makes sure that it's also removed from the moveables array.
	 */
	public override delete(): void {
		App.getInstance().getMovingMoveableIds().delete(this.getUniqueId());
		super.delete();
		this.stopMoving();
	}

	/**
	 * This method will return the "closest" turn to this game element, based on the current direction it is moving.
	 * It will return the first turn that is not only "ahead" of where this game element is heading, but that also
	 * passes `filter`'s criteria.
	 *
	 * @param filter given a turn, this function decides whether the turn falls under a specified criteria
	 * @param direction direction used to search for relevant turns (i.e. to the "right" of a direction)
	 * @returns the closest turn to this game element that falls under `filter`'s criteria
	 */
	public findNearestTurnForDirectionWhere(
		filter: (turn: Turn) => boolean,
		direction: MovementDirection,
	): Turn | undefined {
		const turnMap = Board.getInstance().getTurnMap();

		// find nearest turn based on the movement direction of this moveable
		for (
			let tile = this.initialTileNumMap[direction as keyof typeof this.initialTileNumMap]();
			this.tileNumComparatorMap[direction as keyof typeof this.tileNumComparatorMap](tile);
			tile = this.tileNumUpdaterMap[direction as keyof typeof this.tileNumUpdaterMap](tile)
		) {
			const turn = turnMap.get(this.turnTileKeyMap[direction as keyof typeof this.turnTileKeyMap](tile));

			if (!turn || !this.turnValidators[direction as keyof typeof this.turnValidators](turn) || !filter(turn)) {
				continue;
			}

			return turn;
		}

		return undefined;
	}

	/**
	 * Every turn's position only allows a certain set of directions for a game element to move in. This method determines
	 * if the game element can turn in a certain direction at the given `turn`.
	 *
	 * @param direction the direction game element wants to move in
	 * @param turn the turn position object wants to turn at
	 * @returns boolean indicating whether the game element can use a given `direction` to turn at the given `turn`
	 */
	public static canTurnWithMoveDirection(direction: MovementDirection, turn: Turn): boolean {
		return turn.getDirections().includes(direction);
	}

	/**
	 * Given a turn, this function will physically "snap" this game element's position to it. This is
	 * useful since collision detection relies on specific offsets of game element on the board, relative
	 * to each turn.
	 *
	 * @param turn the turn to snap this game element's physical to
	 */
	public offsetPositionToTurn(turn: Turn): void {
		this.setShouldInterpolate(false);

		const oldPosition = this.getPosition();
		const turnCenterPosition = turn.getCenterPosition();
		// find the "true" position x & y that the game element should be placed at when performing a turn (since
		// it could be within the turn's distance, but not perfectly placed at the turn position)
		const gameElementTurnX = turnCenterPosition.x - this.getWidth() / 2;
		const gameElementTurnY = turnCenterPosition.y - this.getHeight() / 2;

		// we know at this point that we're within this turn's threshold, so correct the game element's position
		// by moving it to the turn's exact location to keep the game element's movement consistent
		if (oldPosition.x !== gameElementTurnX || oldPosition.y !== gameElementTurnY) {
			this.setPosition({
				x: gameElementTurnX,
				y: gameElementTurnY,
			});
		}
	}

	/**
	 * Empties the turn queue for this game element.
	 */
	public dequeueTurns(): void {
		this.turnQueue = [];
	}

	/**
	 * Queues a turn for a future point in time so that when the game element reaches the threshold of the turn,
	 * it will turn at it.
	 *
	 * @param direction the direction the game element wants to move at a future point in time
	 * @param turn the turn location the game element wants to turn at in a future point in time
	 */
	protected queueTurn(direction: MovementDirection, turn: Turn): void {
		// clear the queue if we're queueing a separate turn before another one completes
		this.dequeueTurns();

		this.turnQueue.push({
			direction,
			turn,
		});
	}

	/**
	 * Animates this game element upwards using by settings its CSS `transform` value, and also makes sure
	 * to update this game element's `Position` so that it matches the amount of pixels moved.
	 *
	 * @param amount the amount of pixels to move the game element up
	 */
	private moveUp(amount: number): void {
		this.setPositionY(this.getPosition().y - amount);
	}

	/**
	 * Animates this game element downwards using by settings its CSS `transform` value, and also makes sure
	 * to update this game element's `Position` so that it matches the amount of pixels moved.
	 *
	 * @param amount the amount of pixels to move the game element down
	 */
	private moveDown(amount: number): void {
		this.setPositionY(this.getPosition().y + amount);
	}

	/**
	 * Animates this game element left using by settings its CSS `transform` value, and also makes sure
	 * to update this game element's `Position` so that it matches the amount of pixels moved.
	 *
	 * @param amount the amount of pixels to move the game element left
	 */
	private moveLeft(amount: number): void {
		this.setPositionX(this.getPosition().x - amount);
	}

	/**
	 * Animates this game element right using by settings its CSS `transform` value, and also makes sure
	 * to update this game element's `Position` so that it matches the amount of pixels moved.
	 *
	 * @param amount the amount of pixels to move the game element right
	 */
	private moveRight(amount: number): void {
		this.setPositionX(this.getPosition().x + amount);
	}
}
