import { App } from "../../../../App.js";
import { TILESIZE } from "../../../../utils/Globals.js";
import { millisToSeconds } from "../../../../utils/Utils.js";
import type { Position, TurnData } from "../../../Board.js";
import Board from "../../../Board.js";
import { BoardObject } from "../../BoardObject.js";
import MakeTickable from "../../mixins/Tickable.js";
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
	fromTurn?: TurnData;
};

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
	private directionalPositionSetters = {
		[MovementDirection.LEFT]: this.setPositionX,
		[MovementDirection.RIGHT]: this.setPositionX,
		[MovementDirection.UP]: this.setPositionY,
		[MovementDirection.DOWN]: this.setPositionY,
	};
	/**
	 * The directions that this board object must be moving in order to search for the nearest "teleport" position.
	 */
	private readonly TELEPORTER_DIRECTIONS: MovementDirection[] = [MovementDirection.LEFT, MovementDirection.RIGHT];
	/**
	 * Map of directions to teleporter positions on the board.
	 */
	private readonly TELEPORTER_DIRECTION_MAP: { [key: number]: Position } = {
		[MovementDirection.LEFT]: {
			// subtract by board object's width. otherwise, when board object is teleported to this left teleporter's position,
			// it will have its left-hand side placed at the start of the entrance, instead of emerging from it
			x: Board.calcTileOffsetX(1) - (TILESIZE + Board.calcTileOffset(0.5)),
			y: Board.calcTileOffsetY(18.25),
		},
		[MovementDirection.RIGHT]: {
			x: Board.calcTileOffsetX(29),
			y: Board.calcTileOffsetY(18.25),
		},
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
	protected turnQueue: { direction: MovementDirection; turn: TurnData }[] = [];
	/**
	 * Takes a given turn and a position and returns a boolean indicating whether or not the turn is "ahead" of the
	 * direction this board object is currently heading and if it is on the same "row"/"column" as the board object.
	 */
	protected turnValidators = {
		[MovementDirection.LEFT]: (turn: TurnData) => {
			const centerPosition = this.getCenterPosition();

			// only turns to the left of board object and in the same row
			return turn.x <= centerPosition.x && turn.y === centerPosition.y;
		},
		[MovementDirection.RIGHT]: (turn: TurnData) => {
			const centerPosition = this.getCenterPosition();

			// only turns to the right of board object and in the same row
			return turn.x >= centerPosition.x && turn.y === centerPosition.y;
		},
		[MovementDirection.UP]: (turn: TurnData) => {
			const centerPosition = this.getCenterPosition();

			// only turns above board object and in the same column
			return turn.y <= centerPosition.y && turn.x === centerPosition.x;
		},
		[MovementDirection.DOWN]: (turn: TurnData) => {
			const centerPosition = this.getCenterPosition();

			// only turns below board object and in the same column
			return turn.y >= centerPosition.y && turn.x === centerPosition.x;
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
	 * @param speed the speed of the board object (in pixels-per-second)
	 * @param name
	 */
	constructor(name: string, speed: number) {
		super(name);

		this.speed = speed;
		// faster board objects have larger distances per-frame
		this.distancePerFrame = speed * millisToSeconds(App.DESIRED_MS_PER_FRAME);

		App.MOVEABLES.push(this);
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
	}

	/**
	 * @inheritdoc
	 */
	public override tick(): void {
		// sanity check
		if (!this.moving) {
			return;
		}

		// check the turn queue for any queued turns
		if (this.turnQueue.length) {
			const queuedTurnInfo = this.turnQueue[0]!;
			const turn = queuedTurnInfo.turn;

			// every frame, check if the board object is within the queued-turn's threshold, and turn
			// the board object in that direction when it is
			if (this.isWithinTurnDistance(turn)) {
				this.startMoving(queuedTurnInfo.direction, {
					fromTurn: turn,
				});

				return;
			}
		}

		const teleporterPositions = this.TELEPORTER_DIRECTION_MAP;
		const currentDirection = this.currentDirection!;

		// if this board object is moving in any direction that leads to a teleporter, keep checking if it's within range
		// of one, and teleport them when they are
		if (
			this.TELEPORTER_DIRECTIONS.includes(currentDirection) &&
			this.isWithinTeleporterDistance(teleporterPositions[currentDirection as number]!)
		) {
			// set baord object's position to the opposite teleporter
			this.setPositionX(
				teleporterPositions[
					Moveable.directionOpposites[currentDirection as keyof typeof Moveable.directionOpposites] as number
				]!.x,
				{
					modifyCss: false,
					modifyTransform: true,
				}
			);

			// start moving board object in the same direction, again, because if we don't, the board object will still have "stale" data tied to it.
			// for example, an "old" queued-turn, which was valid before the board object teleported, but invalid afterwards. it could also
			// give pacman an invalid "nearestStoppingTurn", etc.
			this.startMoving(currentDirection);

			return;
		}

		this.movementMethods[currentDirection as keyof MovementMethods].bind(this)(this.distancePerFrame);

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
		this.directionalPositionSetters[direction as keyof typeof this.directionalPositionSetters].bind(this)(
			this.getPosition()![directionalPositionKey] * alpha + oldPosition[directionalPositionKey] * (1.0 - alpha),
			{
				modifyCss: false,
				modifyTransform: true,
			}
		);
	}

	/**
	 * Deletes this moveable and makes sure that it's also removed from the moveables array.
	 */
	public override delete(): void {
		super.delete();

		App.MOVEABLES.splice(App.MOVEABLES.indexOf(this), 1);
	}

	/**
	 * Queues a turn for a future point in time so that when the board object reaches the threshold of the turn,
	 * it will turn at it.
	 *
	 * @param direction the direction the board object wants to move at a future point in time
	 * @param turn the turn location the board object wants to turn at in a future point in time
	 */
	protected queueTurn(direction: MovementDirection, turn: TurnData): void {
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
	 * Determines if this board object is within distance of a turn's position.
	 *
	 * @param turn the turn position to check against
	 * @returns boolean indicating if the board object is within the pixel threshold of this turn
	 */
	protected isWithinTurnDistance(turn: TurnData): boolean {
		const centerPosition = this.getCenterPosition();

		// add half of the board object's width/height to the turn's x & y position so that
		// our threshold takes effect when the board object is about "half" way over the turn's
		// position
		return (
			this.distanceWithinDistancePerFrame(centerPosition.x, turn.x) &&
			this.distanceWithinDistancePerFrame(centerPosition.y, turn.y)
		);
	}

	/**
	 * Determines if this board object is within distance of a teleporter.
	 *
	 * @param position the position of the teleporter's collision
	 * @returns boolean indicating if the board object is within the pixel threshold of the teleporter
	 */
	protected isWithinTeleporterDistance(teleporterPosition: Position): boolean {
		const position = this.getPosition();

		return (
			position.y === teleporterPosition.y && this.distanceWithinDistancePerFrame(position.x, teleporterPosition.x)
		);
	}

	/**
	 * Every turn's position only allows a certain set of directions for a board object to move in. This method determines
	 * if the board object can turn in a certain direction at the given `turn`.
	 *
	 * @param direction the direction board object wants to move in
	 * @param turn the turn position object wants to turn at
	 * @returns boolean indicating whether the board object can use a given `direction` to turn at the given `turn`
	 */
	protected static canTurnWithMoveDirection(direction: MovementDirection, turn: TurnData): boolean {
		return turn.directions.includes(direction);
	}

	/**
	 * Given a turn, this function will physically "snap" this board object's position to it. This is
	 * useful since collision detection relies on specific offsets of board object on the board, relative
	 * to each turn.
	 *
	 * @param turn the turn to snap this board object's physical to
	 */
	protected offsetPositionToTurn(turn: TurnData): void {
		const oldPosition = this.getPosition();
		// find the "true" position x & y that the board object should be placed at when performing a turn (since
		// it could be within the turn's threshold, but not perfectly placed at the turn position)
		const boardObjectTurnX = turn.x - this.getWidth()! / 2;
		const boardObjectTurnY = turn.y - this.getHeight()! / 2;

		// we know at this point that we're within this turn's threshold, so correct the board object's position
		// by moving it to the turn's exact location to keep the board object's movement consistent
		if (oldPosition.x !== boardObjectTurnX || oldPosition.y !== boardObjectTurnY) {
			this.setPosition(
				{
					x: boardObjectTurnX,
					y: boardObjectTurnY,
				},
				{
					modifyCss: false,
					modifyTransform: true,
				}
			);
		}
	}

	/**
	 * This method will return the "closest" turn to this board object, based on the current direction it is moving.
	 *
	 * @returns the closest turn to this board object
	 */
	protected findNearestTurn(): TurnData | undefined {
		// find turns "ahead" of board object
		const filteredTurnData = Board.getInstance().turnData!.filter((turn) =>
			this.turnValidators[this.currentDirection as keyof typeof this.turnValidators](turn)
		);

		const currentDirection = this.currentDirection;

		// turns are always ordered from left-to-right, starting from the top-left of the board and ending at the bottom-right, so
		// reverse the array here so that when we call "find()" on "filteredTurnData" in order to find the first turn that allows this
		// board object to turn (given the current direction), we find the closest turn to the board object, instead of a turn that may be at the
		// "start" of the "filteredTurnData" array
		if (currentDirection === MovementDirection.LEFT || currentDirection === MovementDirection.UP) {
			filteredTurnData.reverse();
		}

		return filteredTurnData[0];
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
	protected findNearestTurnWhere(
		filter: (turn: TurnData) => boolean,
		callback?: ((turn: TurnData) => unknown) | undefined
	): TurnData | undefined {
		// find turns "ahead" of board object and that fit the "filter"
		const filteredTurnData = Board.getInstance().turnData!.filter((turn) => {
			if (this.turnValidators[this.currentDirection as keyof typeof this.turnValidators](turn) && filter(turn)) {
				// run callback if our filter passes, and it's defined
				if (callback) {
					callback(turn);
				}

				return true;
			}

			return false;
		});

		const currentDirection = this.currentDirection;

		// turns are always ordered from left-to-right, starting from the top-left of the board and ending at the bottom-right, so
		// reverse the array here so that when we call "find()" on "filteredTurnData" in order to find the first turn that allows this
		// board object to turn (given the current direction), we find the closest turn to the board object, instead of a turn that may be at the
		// "start" of the "filteredTurnData" array
		if (currentDirection === MovementDirection.LEFT || currentDirection === MovementDirection.UP) {
			filteredTurnData.reverse();
		}

		return filteredTurnData[0];
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
		this.setPositionY(this.getPosition().y - amount, {
			modifyCss: false,
			modifyTransform: true,
		});
	}

	/**
	 * Animates this board object downwards using by settings its CSS `transform` value, and also makes sure
	 * to update this board object's `Position` so that it matches the amount of pixels moved.
	 *
	 * @param amount the amount of pixels to move the board object down
	 */
	private moveDown(amount: number): void {
		this.setPositionY(this.getPosition().y + amount, {
			modifyCss: false,
			modifyTransform: true,
		});
	}

	/**
	 * Animates this board object left using by settings its CSS `transform` value, and also makes sure
	 * to update this board object's `Position` so that it matches the amount of pixels moved.
	 *
	 * @param amount the amount of pixels to move the board object left
	 */
	private moveLeft(amount: number): void {
		this.setPositionX(this.getPosition().x - amount, {
			modifyCss: false,
			modifyTransform: true,
		});
	}

	/**
	 * Animates this board object right using by settings its CSS `transform` value, and also makes sure
	 * to update this board object's `Position` so that it matches the amount of pixels moved.
	 *
	 * @param amount the amount of pixels to move the board object right
	 */
	private moveRight(amount: number): void {
		this.setPositionX(this.getPosition().x + amount, {
			modifyCss: false,
			modifyTransform: true,
		});
	}
}
