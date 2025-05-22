import { App } from "../../../../App.js";
import type { Position } from "../../../../gameelement/GameElement.js";
import { millisToSeconds } from "../../../../utils/Utils.js";
import Board from "../../../Board.js";
import { BoardObject } from "../../BoardObject.js";
import MakeTickable from "../../mixins/Tickable.js";
import type Turn from "../Turn.js";
import MovementDirection from "./MovementDirection.js";

/**
 * Depending on which direction a board object is moving in, this object holds methods which
 * will change the board object's CSS `transform` value and also set it in memory.
 */
type MovementMethods = {
	[key in MovementDirection.LEFT | MovementDirection.RIGHT | MovementDirection.UP | MovementDirection.DOWN]: (
		/**
		 * The amount of pixels to change the `translateX` or `translateY` value (negative or positive).
		 */
		amount: number
	) => void;
};

/**
 * Options that modify the way that this board object starts moving
 */
export type StartMoveOptions = {
	/**
	 * Optional parameter which tells the location that the board object is turning at. This might not
	 * be provided because it's possible that this board object is simply "turning around" in the opposite direction of
	 * where it is currently heading, and not making a 90 degree turn.
	 */
	fromTurn?: Turn;
};

/**
 * Represents data present within a moveable's turn queue such as the direction it will turn
 * and the turn object at which it will turn.
 */
type TurnQueue = { direction: MovementDirection; turn: Turn }[];

/**
 * Represents a board object that is capable of moving across the board.
 */
export default abstract class Moveable extends MakeTickable(BoardObject) {
	/**
	 * The speed of the board object (in pixels-per-second).
	 */
	private readonly speed: number;
	/**
	 * The number of pixels this board object moves per-frame.
	 */
	private readonly distancePerFrame: number;
	/**
	 * Determines if the board object is currently moving.
	 */
	private moving: boolean = false;
	/**
	 * Holds methods which will change the board object's CSS `transform` value and also set it in memory.
	 */
	private movementMethods: MovementMethods = {
		[MovementDirection.LEFT]: this.moveLeft,
		[MovementDirection.RIGHT]: this.moveRight,
		[MovementDirection.UP]: this.moveUp,
		[MovementDirection.DOWN]: this.moveDown,
	};
	/**
	 * The key used to index into a given `Position` object, given the direction this board object is moving.
	 */
	private directionalPositionKeys = {
		[MovementDirection.LEFT]: "x",
		[MovementDirection.RIGHT]: "x",
		[MovementDirection.UP]: "y",
		[MovementDirection.DOWN]: "y",
	};
	/**
	 * The proper method to set this board object's position, based on the direction it is moving.
	 */
	private directionalTransformSetters = {
		[MovementDirection.LEFT]: this.setTransformX,
		[MovementDirection.RIGHT]: this.setTransformX,
		[MovementDirection.UP]: this.setTransformY,
		[MovementDirection.DOWN]: this.setTransformY,
	};

	/**
	 * The current direction this board object is moving in.
	 */
	protected currentDirection: MovementDirection | undefined;
	/**
	 * The last direction this board object moved in.
	 */
	protected lastMoveCode: MovementDirection | undefined;
	/**
	 * A queue of turns that a board object wants to make in the future. This suggests that the board object isn't
	 * within distance of the turn yet, and so must queue the turn. The length of this array
	 * must always be `1`.
	 */
	protected turnQueue: TurnQueue = [];
	/**
	 * Takes a given turn and a position and returns a boolean indicating whether or not the turn is "ahead" of the
	 * direction this board object is currently heading and if it is on the same "row"/"column" as the board object.
	 */
	protected turnValidators = {
		[MovementDirection.LEFT]: (turn: Turn) => {
			const turnCenterPosition = turn.getCenterPosition();
			const centerPosition = this.getCenterPosition();

			// only turns to the left of board object and in the same row
			return turnCenterPosition.x <= centerPosition.x && turnCenterPosition.y === centerPosition.y;
		},
		[MovementDirection.RIGHT]: (turn: Turn) => {
			const turnCenterPosition = turn.getCenterPosition();
			const centerPosition = this.getCenterPosition();

			// only turns to the right of board object and in the same row
			return turnCenterPosition.x >= centerPosition.x && turnCenterPosition.y === centerPosition.y;
		},
		[MovementDirection.UP]: (turn: Turn) => {
			const turnCenterPosition = turn.getCenterPosition();
			const centerPosition = this.getCenterPosition();

			// only turns above board object and in the same column
			return turnCenterPosition.y <= centerPosition.y && turnCenterPosition.x === centerPosition.x;
		},
		[MovementDirection.DOWN]: (turn: Turn) => {
			const turnCenterPosition = turn.getCenterPosition();
			const centerPosition = this.getCenterPosition();

			// only turns below board object and in the same column
			return turnCenterPosition.y >= centerPosition.y && turnCenterPosition.x === centerPosition.x;
		},
	};
	/**
	 * Takes a direction that a board object can move and returns the opposite direction of it.
	 */
	protected static readonly directionOpposites = {
		[MovementDirection.LEFT]: MovementDirection.RIGHT,
		[MovementDirection.RIGHT]: MovementDirection.LEFT,
		[MovementDirection.UP]: MovementDirection.DOWN,
		[MovementDirection.DOWN]: MovementDirection.UP,
	};

	/**
	 * Creates a moveable board object.
	 *
	 * @param name
	 * @param width the width of this moveable
	 * @param height the height of this moveable
	 * @param speed the speed of the board object (in pixels-per-second)
	 */
	constructor(name: string, width: number, height: number, speed: number) {
		super(name, width, height);

		this.speed = speed;
		// faster board objects have larger distances per-frame
		this.distancePerFrame = speed * millisToSeconds(App.DESIRED_MS_PER_FRAME);
	}

	/**
	 * Gets this board object's speed in pixels-per-second.
	 *
	 * @returns this board object's speed in pixels-per-second
	 */
	public getSpeed() {
		return this.speed;
	}

	/**
	 * Get what direction this board object is currently moving in.
	 *
	 * @returns the current direction the board object is moving in
	 */
	public getCurrentDirection(): MovementDirection | undefined {
		return this.currentDirection;
	}

	/**
	 * Gets the last direction this board object moved in. This is useful, especially for pausing/unpausing, since
	 * we can use it to re-animate board object after unpausing the game.
	 *
	 * @returns the last `MovementDirection` this board object moved in
	 */
	public getLastMoveCode(): MovementDirection | undefined {
		return this.lastMoveCode;
	}

	/**
	 * Get the number of pixels this moveable moves per-frame.
	 *
	 * @returns number of pixels moved per-frame
	 */
	public getDistancePerFrame(): number {
		return this.distancePerFrame;
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
	 * Determines if the board object is currently moving.
	 * @returns `boolean` if the board object is moving or not
	 */
	public isMoving() {
		return this.moving;
	}

	/**
	 * Sets the current direction this character is moving.
	 */
	public setCurrentDirection(direction: MovementDirection): void {
		this.currentDirection = direction;
	}

	/**
	 * Stops this board object from moving.
	 *
	 */
	public stopMoving(): boolean {
		this.dequeueTurns();
		this.lastMoveCode = undefined;
		this._framesUpdating = 0;
		this.moving = false;
		this.currentDirection = undefined;

		App.getInstance().getMovingMoveableIds().delete(this.getUniqueId());

		return false;
	}

	/**
	 * Marks this board object as "moving", and will start moving in the given `MovementDirection`.
	 *
	 * @param direction the direction the board object is currently trying to move in
	 * @param options options that modify the way that this board object starts moving
	 */
	public startMoving(direction: MovementDirection, options?: StartMoveOptions) {
		if (this.turnQueue.length) {
			// reset turn queue each time we head in a new direction
			this.dequeueTurns();
		}

		if (this.moving) {
			this.stopMoving();
		}

		const fromTurn = options?.fromTurn;

		if (fromTurn) {
			// snap to turn-position to keep collision detection consistent
			this.offsetPositionToTurn(fromTurn);
		}

		// set this board object's current direction since we now know that it's going to start moving
		this.currentDirection = direction;
		this.moving = true;
		this.lastMoveCode = direction;

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

		this.movementMethods[this.currentDirection as keyof MovementMethods].bind(this)(this.distancePerFrame);
		super.tick();
	}

	/**
	 * @inheritdoc
	 */
	public override interpolate(alpha: number, oldPosition: Position): void {
		const direction = this.currentDirection;
		const directionalPositionKey = this.directionalPositionKeys[
			direction as keyof typeof this.directionalPositionKeys
		] as "x" | "y";

		// interpolate to make movement smooth, and to make up for the amount of milliseconds "deltaTimeAccumulator" has
		// exceeded "MS_PER_FRAME"
		this.directionalTransformSetters[direction as keyof typeof this.directionalTransformSetters].bind(this)(
			this.getPosition()![directionalPositionKey] * alpha + oldPosition[directionalPositionKey] * (1.0 - alpha)
		);
	}

	/**
	 * Deletes this moveable and makes sure that it's also removed from the moveables array.
	 */
	public override delete(): void {
		super.delete();

		this.stopMoving();
	}

	/**
	 * This method will return the "closest" turn to this board object, based on the current direction it is moving.
	 * It will return the first turn that is not only "ahead" of where this board object is heading, but that also
	 * passes `filter`'s criteria.
	 *
	 * @param filter given a turn, this function decides whether the turn falls under a specified criteria
	 * @param callback any logic to run when a turn falls under `filter`'s criteria
	 * @returns the closest turn to this board object that falls under `filter`'s criteria
	 */
	public findNearestTurnWhere(
		filter: (turn: Turn) => boolean,
		callback?: ((turn: Turn) => unknown) | undefined
	): Turn | undefined {
		const turnValidators = this.turnValidators;
		const currentDirection = this.currentDirection as keyof typeof turnValidators;
		// find turns "ahead" of board object and that fit the "filter"
		const filteredTurns = Board.getInstance()
			.getTurns()
			.filter((turn) => {
				if (turnValidators[currentDirection](turn) && filter(turn)) {
					// run callback if our filter passes, and it's defined
					if (callback) {
						callback(turn);
					}

					return true;
				}

				return false;
			});

		// turns are always ordered from left-to-right, starting from the top-left of the board and ending at the bottom-right, so
		// reverse the array here so that when we call "find()" on "filteredTurns" in order to find the first turn that allows this
		// board object to turn (given the current direction), we find the closest turn to the board object, instead of a turn that may be at the
		// "start" of the "filteredTurns" array
		if (currentDirection === MovementDirection.LEFT || currentDirection === MovementDirection.UP) {
			filteredTurns.reverse();
		}

		return filteredTurns[0];
	}

	/**
	 * Every turn's position only allows a certain set of directions for a board object to move in. This method determines
	 * if the board object can turn in a certain direction at the given `turn`.
	 *
	 * @param direction the direction board object wants to move in
	 * @param turn the turn position object wants to turn at
	 * @returns boolean indicating whether the board object can use a given `direction` to turn at the given `turn`
	 */
	public static canTurnWithMoveDirection(direction: MovementDirection, turn: Turn): boolean {
		return turn.getDirections().includes(direction);
	}

	/**
	 * Given a turn, this function will physically "snap" this board object's position to it. This is
	 * useful since collision detection relies on specific offsets of board object on the board, relative
	 * to each turn.
	 *
	 * @param turn the turn to snap this board object's physical to
	 */
	public offsetPositionToTurn(turn: Turn): void {
		const oldPosition = this.getPosition();
		const turnCenterPosition = turn.getCenterPosition();
		// find the "true" position x & y that the board object should be placed at when performing a turn (since
		// it could be within the turn's distance, but not perfectly placed at the turn position)
		const boardObjectTurnX = turnCenterPosition.x - this.getWidth() / 2;
		const boardObjectTurnY = turnCenterPosition.y - this.getHeight() / 2;

		// we know at this point that we're within this turn's threshold, so correct the board object's position
		// by moving it to the turn's exact location to keep the board object's movement consistent
		if (oldPosition.x !== boardObjectTurnX || oldPosition.y !== boardObjectTurnY) {
			this.setPosition({
				x: boardObjectTurnX,
				y: boardObjectTurnY,
			});
		}
	}

	/**
	 * Queues a turn for a future point in time so that when the board object reaches the threshold of the turn,
	 * it will turn at it.
	 *
	 * @param direction the direction the board object wants to move at a future point in time
	 * @param turn the turn location the board object wants to turn at in a future point in time
	 */
	protected queueTurn(direction: MovementDirection, turn: Turn): void {
		if (this.turnQueue.length) {
			// clear the queue if we're queueing a separate turn before another ones completes
			this.dequeueTurns();
		}

		this.turnQueue.push({
			direction,
			turn,
		});
	}

	/**
	 * This method will return the "closest" turn to this board object, based on the current direction it is moving.
	 *
	 * @returns the closest turn to this board object
	 */
	protected findNearestTurn(): Turn | undefined {
		// find turns "ahead" of board object
		const filteredTurns = Board.getInstance()
			.getTurns()
			.filter((turn) => this.turnValidators[this.currentDirection as keyof typeof this.turnValidators](turn));

		const currentDirection = this.currentDirection;

		// turns are always ordered from left-to-right, starting from the top-left of the board and ending at the bottom-right, so
		// reverse the array here so that when we call "find()" on "filteredTurns" in order to find the first turn that allows this
		// board object to turn (given the current direction), we find the closest turn to the board object, instead of a turn that may be at the
		// "start" of the "filteredTurns" array
		if (currentDirection === MovementDirection.LEFT || currentDirection === MovementDirection.UP) {
			filteredTurns.reverse();
		}

		return filteredTurns[0];
	}

	/**
	 * Determines whether two positions on the board (`x` or `y`) are within distance of
	 * the amount of pixels this board object moved per-frame.
	 *
	 * @param offset1 the first `x` or `y` position
	 * @param offset2 the second `x` or `y` position
	 * @returns boolean indicating if they're within the collision threshold
	 */
	private distanceWithinDistancePerFrame(offset1: number, offset2: number): boolean {
		return Math.abs(offset1 - offset2) <= this.distancePerFrame;
	}

	/**
	 * Empties the turn queue for this board object.
	 */
	private dequeueTurns(): void {
		this.turnQueue = [];
	}

	/**
	 * Animates this board object upwards using by settings its CSS `transform` value, and also makes sure
	 * to update this board object's `Position` so that it matches the amount of pixels moved.
	 *
	 * @param amount the amount of pixels to move the board object up
	 */
	private moveUp(amount: number): void {
		this.setPositionY(this.getPosition().y - amount);
	}

	/**
	 * Animates this board object downwards using by settings its CSS `transform` value, and also makes sure
	 * to update this board object's `Position` so that it matches the amount of pixels moved.
	 *
	 * @param amount the amount of pixels to move the board object down
	 */
	private moveDown(amount: number): void {
		this.setPositionY(this.getPosition().y + amount);
	}

	/**
	 * Animates this board object left using by settings its CSS `transform` value, and also makes sure
	 * to update this board object's `Position` so that it matches the amount of pixels moved.
	 *
	 * @param amount the amount of pixels to move the board object left
	 */
	private moveLeft(amount: number): void {
		this.setPositionX(this.getPosition().x - amount);
	}

	/**
	 * Animates this board object right using by settings its CSS `transform` value, and also makes sure
	 * to update this board object's `Position` so that it matches the amount of pixels moved.
	 *
	 * @param amount the amount of pixels to move the board object right
	 */
	private moveRight(amount: number): void {
		this.setPositionX(this.getPosition().x + amount);
	}
}
