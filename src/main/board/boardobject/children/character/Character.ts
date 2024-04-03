"use strict";

import ImageRegistry from "../../../../assets/ImageRegistry.js";
import Board from "../../../../board/Board.js";
import { CHARACTERS, COLLIDABLES_MAP, TILESIZE } from "../../../../utils/Globals.js";
import { defined, millisToSeconds, px } from "../../../../utils/Utils.js";
import { BoardObject, type Position } from "../../BoardObject.js";
import type Collidable from "../../Collidable.js";
import CollidableManager from "../../CollidableManager.js";
import MovementDirection from "./MovementDirection.js";

/**
 * Represents a position on the board where a character is allowed to turn,
 * and also includes an array of `MovementDirection` values to tell the character
 * what directions it can turn when it reaches the given turn coordinates.
 */
export interface TurnData extends Position {
	/**
	 * The `x` position of the turn.
	 */
	x: number;
	/**
	 * The `y` position of the turn.
	 */
	y: number;
	/**
	 * The allowed `MovementDirection`s of the turn.
	 */
	directions: MovementDirection[];
}

/**
 * Depending on which direction a character is moving in, this object holds methods which
 * will change the character's CSS `transform` value and also set it in memory.
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
 * Options that modify the way that this character starts moving
 */
export type StartMoveOptions = {
	/**
	 * Optional parameter which tells the location that the character is turning at. This might not
	 * be provided because it's possible that this character is simply "turning around" in the opposite direction of
	 * where it is currently heading, and not making a 90 degree turn.
	 */
	fromTurn?: TurnData;
	/**
	 * Whether or not this character will start moving after having been in a "paused" state.
	 */
	wasPaused?: boolean;
};

/**
 * A character is any of the AI or user-controlled objects on the board.
 */
export default abstract class Character extends BoardObject implements Collidable {
	/**
	 * The speed of the character (in pixels-per-second)
	 */
	private readonly speed: number;
	/**
	 * The path to the character's picture file.
	 */
	private readonly source: string;
	/**
	 * The current animation frame requested by the DOM for this character.
	 */
	private animationFrameId: number | undefined;
	/**
	 * The id of the `setInterval()` call made for animating this character.
	 */
	private animationIntervalId: number | undefined;
	/**
	 * The minimum number of pixels away from another position on the board that this character must be to be considered "colliding".
	 */
	private collisionThreshold: number;
	/**
	 * How long each animation state for this character lasts.
	 */
	abstract readonly _ANIMATION_STATE_MILLIS: number;
	/**
	 * How many milliseconds have passed since the last time `Character.move()` was called.
	 */
	private deltaTimeSum: number = 0;
	/**
	 * Determines if the characters is currently moving.
	 */
	private moving: boolean = false;
	/**
	 * The directions that this character must be moving in order to search for the nearest "teleport" position.
	 */
	private readonly TELEPORTER_DIRECTIONS: MovementDirection[] = [MovementDirection.LEFT, MovementDirection.RIGHT];
	/**
	 * Extra amount of pixels added to each character's collision threshold to account for differing pixels a character
	 * moves on each frame.
	 */
	private static readonly COLLISION_PADDING: 0.5 = 0.5;
	/**
	 * The `x` and `y` positions on the board of each teleporter's collision.
	 */
	private readonly TELEPORTER_POSITIONS = {
		[MovementDirection.LEFT]: {
			// subtract by character's width. otherwise, when character is teleported to this left teleporter's position,
			// it will have its left-hand side placed at the start of the entrance, instead of emerging from it
			x: Board.calcTileX(1) - (TILESIZE + Board.calcTileOffset(0.5)),
			y: Board.calcTileY(18.25),
		},
		[MovementDirection.RIGHT]: {
			x: Board.calcTileX(29),
			y: Board.calcTileY(18.25),
		},
	};
	/**
	 * Holds methods which will change the character's CSS `transform` value and also set it in memory.
	 */
	private movementMethods: MovementMethods = {
		[MovementDirection.LEFT]: this.moveLeft,
		[MovementDirection.RIGHT]: this.moveRight,
		[MovementDirection.UP]: this.moveUp,
		[MovementDirection.DOWN]: this.moveDown,
	};
	/**
	 * Methods called for this character, depending on which direction they're moving, which deal with detecting collisions
	 * between other `BoardObject`s. Divide width/heights by 2 since we want `BoardObject`s to collide when they're about "half"
	 * way over each other.
	 */
	private directionalCollisionHandlers = {
		[MovementDirection.LEFT]: (collidable: Collidable) => {
			// collision with "left" side of this character
			return this.distanceWithinThreshold(
				this.getPosition()!.x,
				collidable.getPosition()!.x + collidable.getWidth()! / 2
			);
		},
		[MovementDirection.RIGHT]: (collidable: Collidable) => {
			// collision with "right" side of this character
			return this.distanceWithinThreshold(this.getPosition()!.x + this.width / 2, collidable.getPosition()!.x);
		},
		[MovementDirection.UP]: (collidable: Collidable) => {
			// collision with "top" side of this character
			return this.distanceWithinThreshold(
				this.getPosition()!.y,
				collidable.getPosition()!.y + collidable.getHeight()! / 2
			);
		},
		[MovementDirection.DOWN]: (collidable: Collidable) => {
			// collision with "bottom" side of this character
			return this.distanceWithinThreshold(this.getPosition()!.y + this.height / 2, collidable.getPosition()!.y);
		},
	};
	/**
	 * The desired frames-per-second that a character should update at.
	 */
	private static readonly DESIRED_FPS: 30 = 30;
	/**
	 * The rough amount of milliseconds that should pass before a character updates on a frame.
	 */
	private static readonly MS_PER_FRAME: number = 1000 / Character.DESIRED_FPS;
	readonly _collidableManager: CollidableManager;

	/**
	 * A queue of turns that a character wants to make in the future. This suggests that the character isn't
	 * within `this.collisionThreshold` pixels of the turn yet, and so must queue the turn. The length of this array
	 * must always be `1`.
	 */
	protected turnQueue: { direction: MovementDirection; turn: TurnData }[] = [];
	/**
	 * The current direction this character is currently moving in.
	 */
	protected currentDirection: MovementDirection | undefined;
	/**
	 * The current frame iteration that this character's animation frame is on.
	 */
	protected frameCount: number = 0;
	/**
	 * The last direction the user moved in.
	 */
	protected lastMoveCode: MovementDirection | undefined;
	/**
	 * Takes a given turn and a position and returns a boolean indicating whether or not the turn is "ahead" of the
	 * direction this `Character` is currently heading and if it is on the same "row"/"column" as the `Character`.
	 */
	protected turnValidators = {
		[MovementDirection.LEFT]: (turn: TurnData, position: Position) => {
			// only turns to the left of Character and in the same row
			return turn.x <= position.x + this.getWidth()! / 2 && turn.y - this.getHeight()! / 2 === position.y;
		},
		[MovementDirection.RIGHT]: (turn: TurnData, position: Position) => {
			// only turns to the right of Character and in the same row
			return turn.x >= position.x + this.getWidth()! / 2 && turn.y - this.getHeight()! / 2 === position.y;
		},
		[MovementDirection.UP]: (turn: TurnData, position: Position) => {
			// only turns above Character and in the same column
			return turn.y <= position.y + this.getHeight()! / 2 && turn.x - this.getWidth()! / 2 === position.x;
		},
		[MovementDirection.DOWN]: (turn: TurnData, position: Position) => {
			// only turns below Character and in the same column
			return turn.y >= position.y + this.getHeight()! / 2 && turn.x - this.getWidth()! / 2 === position.x;
		},
	};
	/**
	 * Takes a direction that a Character can move and returns the opposite direction of it.
	 */
	protected static readonly directionOpposites = {
		[MovementDirection.LEFT]: MovementDirection.RIGHT,
		[MovementDirection.RIGHT]: MovementDirection.LEFT,
		[MovementDirection.UP]: MovementDirection.DOWN,
		[MovementDirection.DOWN]: MovementDirection.UP,
	};

	public override readonly width: number = TILESIZE + Board.calcTileOffset(0.5);
	public override readonly height = TILESIZE + Board.calcTileOffset(0.5);
	/**
	 * Data telling characters where they are allowed to turn.
	 */
	public static turnData: TurnData[] | undefined;

	frameCountTimeStamp = 0;
	framesCounted = 0;

	/**
	 * Creates a character.
	 *
	 * @param name
	 * @param speed the speed of the character (in pixels-per-second)
	 * @param source the path to the character's picture file
	 */
	constructor(name: string, speed: number, source: string) {
		super(name);

		// keep track of every character created for convenience
		CHARACTERS.push(this);

		this.speed = speed;
		this.source = source;
		// faster character need larger collision thresholds, otherwise, their collision may never be detected since
		// their position might update "past" any colliders
		this.collisionThreshold =
			Math.ceil(speed * millisToSeconds(Character.MS_PER_FRAME)) + Character.COLLISION_PADDING;
		this._collidableManager = new CollidableManager(this);

		this.element.css({
			width: px(this.width),
			height: px(this.height),
			backgroundImage: `url(${source})`,
		});
	}

	/**
	 * Gets this character's speed in pixels-per-second.
	 *
	 * @returns this character's speed in pixels-per-second
	 */
	public getSpeed() {
		return this.speed;
	}

	/**
	 * Gets the path to the character's picture file.
	 *
	 * @returns the path to the character's picture file
	 */
	public getSource() {
		return this.source;
	}

	/**
	 * Get what direction this character is currently moving in.
	 *
	 * @returns the current direction the character is moving in
	 */
	public getCurrentDirection(): MovementDirection | undefined {
		return this.currentDirection;
	}

	/**
	 * Gets the last direction this character moved in. This is useful, especially for pausing/unpausing, since
	 * we can use it to re-animate characters after unpausing the game.
	 *
	 * @returns the last `MovementDirection` this character moved in
	 */
	public getLastMoveCode(): MovementDirection | undefined {
		return this.lastMoveCode;
	}

	/**
	 * Determines if the character is currently moving.
	 * @returns `boolean` if the character is moving or not
	 */
	public isMoving() {
		return this.moving;
	}

	public override setPosition(position: Position, options?: { modifyCss: boolean; modifyTransform: boolean }): void {
		this._collidableManager.updateTileKeys(position);

		super.setPosition(position, options);
	}

	public override setPositionX(x: number, options?: { modifyCss: boolean; modifyTransform: boolean }): void {
		this._collidableManager.updateTileKeys({
			x,
			y: this.getPosition()!.y,
		});

		super.setPositionX(x, options);
	}

	public override setPositionY(y: number, options?: { modifyCss: boolean; modifyTransform: boolean }): void {
		this._collidableManager.updateTileKeys({
			x: this.getPosition()!.x,
			y,
		});

		super.setPositionY(y, options);
	}

	/**
	 * Cancels this character's current animation frame so that `this.move()` isn't called anymore.
	 *
	 * @param paused whether or not this character is stopping due to the game pausing
	 * @returns
	 */
	public stopMoving(paused: boolean = false) {
		// only forget this data if this character didn't just "stop" because the game paused. otherwise, we
		// can't re-animate them after unpausing/know where they were heading, etc.
		if (!paused) {
			this.dequeueTurns();
			this.lastMoveCode = undefined;
			this.deltaTimeSum = 0;

			this._collidableManager.checkForCollidableAndRemove();
		}

		cancelAnimationFrame(this.animationFrameId as number);
		clearInterval(this.animationIntervalId);

		this.moving = false;
		// make sure we reset the frame count and nearest turn every time this character stops so that we can
		// accurately track characters colliding with walls down the movement pipeline
		this.frameCount = 0;
		this.currentDirection = undefined;

		return false;
	}

	/**
	 * Sets up initial request for animation frame and then starts recursively calling `Character.move()` method to move this character.
	 *
	 * @param direction the direction the character is currently trying to move in
	 * @param options options that modify the way that this character starts moving
	 */
	public startMoving(direction: MovementDirection, options?: StartMoveOptions) {
		const wasPaused = options?.wasPaused;

		if (!wasPaused) {
			if (this.turnQueue.length) {
				// reset turn queue each time we head in a new direction
				this.dequeueTurns();
			}

			if (this.moving) {
				// call this so we can reset the animation frame id every time a character moves
				this.stopMoving();
			}
		}

		const fromTurn = options?.fromTurn;

		if (fromTurn) {
			// snap to turn-position to keep collision detection consistent
			this.offsetPositionToTurn(fromTurn);
		}

		// set this character's current direction since we now know that it's going to start moving
		this.currentDirection = direction;

		// start playing this character's animations as they move.
		this.animationIntervalId = window.setInterval(
			this.updateAnimationImage.bind(this),
			this._ANIMATION_STATE_MILLIS
		);

		this.animationFrameId = requestAnimationFrame((timeStamp) => this.move(direction, 0, timeStamp));

		this.moving = true;
		this.lastMoveCode = direction;
	}

	/**
	 * Returns the name of an animation-related image for the character.
	 */
	abstract _getAnimationImage(): string;

	/**
	 * Updates the character in a given frame. Returning `true` will break a character out of
	 * recursive `Character.move()` method calls.
	 */
	abstract _runFrameUpdate(): boolean;

	/**
	 * Queues a turn for a future point in time so that when the character reaches the threshold of the turn,
	 * they will turn at it.
	 *
	 * @param direction the direction the character wants to move at a future point in time
	 * @param turn the turn location the character wants to turn at in a future point in time
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
	 * Determines if a character is within `this.collisionThreshold` pixels of a turn's position.
	 *
	 * @param turn the turn position to check against
	 * @returns boolean indicating if the character is within the pixel threshold of this turn
	 */
	protected isWithinTurnDistance(turn: TurnData): boolean {
		const position = this.getPosition()!;

		// add half of the character's width/height to the turn's x & y position so that
		// our threshold takes effect when the character is about "half" way over the turn's
		// position
		return (
			this.distanceWithinThreshold(position.x + this.width / 2, turn.x) &&
			this.distanceWithinThreshold(position.y + this.height / 2, turn.y)
		);
	}

	/**
	 * Determines if a character is within `this.collisionThreshold` pixels of a teleporter.
	 *
	 * @param position the position of the teleporter's collision
	 * @returns boolean indicating if the character is within the pixel threshold of the teleporter
	 */
	protected isWithinTeleporterDistance(teleporterPosition: Position): boolean {
		const position = this.getPosition()!;

		return this.distanceWithinThreshold(position.x, teleporterPosition.x) && position.y === teleporterPosition.y;
	}

	/**
	 * Every turn's position only allows a certain set of directions for a `Character` to move in. This method determines
	 * if the `Character` can turn in a certain direction at the given `turn`.
	 *
	 * @param direction the direction `Character` wants to move in
	 * @param turn the turn position `Character` wants to turn at
	 * @returns boolean indicating whether the `Character` can use a given `direction` to turn at the given `turn`
	 */
	protected static canTurnWithMoveDirection(direction: MovementDirection, turn: TurnData): boolean {
		return turn.directions.includes(direction);
	}

	/**
	 * Given a turn, this function will physically "snap" this `Character`'s position to it. This is
	 * useful since collision detection relies on specific offsets of characters on the board, relative
	 * to each turn.
	 *
	 * @param turn the turn to snap this `Character`'s physical to
	 */
	protected offsetPositionToTurn(turn: TurnData): void {
		const oldPosition = this.getPosition()!;
		// find the "true" position x & y that the Character should be placed at when performing a turn (since
		// it could be within the turn's threshold, but not perfectly placed at the turn position)
		const characterTurnX = turn.x - this.getWidth()! / 2;
		const characterTurnY = turn.y - this.getHeight()! / 2;

		// we know at this point that we're within this turn's threshold, so correct the character's position
		// by moving it to the turn's exact location to keep the character's movement consistent
		if (oldPosition.x !== characterTurnX || oldPosition.y !== characterTurnY) {
			this.setPosition(
				{
					x: characterTurnX,
					y: characterTurnY,
				},
				{
					modifyCss: false,
					modifyTransform: true,
				}
			);
		}
	}

	/**
	 * This method will return the "closest" turn to a `Character`, based on the current direction it is moving.
	 *
	 * @returns the closest turn to this character
	 */
	protected findNearestTurn(): TurnData | undefined {
		// find turns "ahead" of character
		const filteredTurnData = Character.turnData!.filter((turn) =>
			this.turnValidators[this.currentDirection as keyof typeof this.turnValidators](turn, this.getPosition()!)
		);

		const currentDirection = this.currentDirection;

		// turns are always ordered from left-to-right, starting from the top-left of the board and ending at the bottom-right, so
		// reverse the array here so that when we call "find()" on "filteredTurnData" in order to find the first turn that allows PacMan
		// to turn (given the input moveCode), we find the closest turn to PacMan, instead of a turn that may be at the "start" of the
		// "filteredTurnData" array
		if (currentDirection === MovementDirection.LEFT || currentDirection === MovementDirection.UP) {
			filteredTurnData.reverse();
		}

		return filteredTurnData[0];
	}

	/**
	 * Given a criteria, this method will return the "closest" turn to a `Character`, based on the current direction it is moving.
	 *
	 * @param filter given a turn, this function decides whether the turn falls under a specified criteria
	 * @param callback any logic to run when a turn falls under `filter`'s criteria
	 * @returns the closest turn to this character that falls under `filter`'s criteria
	 */
	protected findNearestTurnWhere(
		filter: (turn: TurnData) => boolean,
		callback?: ((turn: TurnData) => unknown) | undefined
	): TurnData | undefined {
		// find turns "ahead" of character and that fit the "filter"
		const filteredTurnData = Character.turnData!.filter((turn) => {
			if (
				this.turnValidators[this.currentDirection as keyof typeof this.turnValidators](
					turn,
					this.getPosition()!
				) &&
				filter(turn)
			) {
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
		// reverse the array here so that when we call "find()" on "filteredTurnData" in order to find the first turn that allows PacMan
		// to turn (given the input moveCode), we find the closest turn to PacMan, instead of a turn that may be at the "start" of the
		// "filteredTurnData" array
		if (currentDirection === MovementDirection.LEFT || currentDirection === MovementDirection.UP) {
			filteredTurnData.reverse();
		}

		return filteredTurnData[0];
	}

	/**
	 * Determines if this character is colliding with another `BoardObject`.
	 *
	 * @param collidable the board object this character might be colliding with
	 * @returns boolean indicating if the two are colliding
	 */
	protected isCollidingWithCollidable(collidable: Collidable): boolean {
		const thisPosition = this.getPosition()!;
		const thisPositionX = thisPosition.x;
		const thisPositionY = thisPosition.y;
		const collidablePosition = collidable.getPosition()!;
		const collidableX = collidablePosition.x;
		const collidableY = collidablePosition.y;
		const currentDirection = this.currentDirection;

		// don't bother testing against board objects that aren't in the same row/column as this character
		if (
			((currentDirection === MovementDirection.LEFT || currentDirection === MovementDirection.RIGHT) &&
				Board.calcTileNumY(thisPositionY + this.height / 2) !==
					Board.calcTileNumY(collidableY + collidable.getHeight()! / 2)) ||
			((currentDirection === MovementDirection.UP || currentDirection === MovementDirection.DOWN) &&
				Board.calcTileNumX(thisPositionX + this.width / 2) !==
					Board.calcTileNumX(collidableX + collidable.getWidth()! / 2))
		) {
			return false;
		}

		return this.directionalCollisionHandlers[
			currentDirection as keyof typeof this.directionalCollisionHandlers
		].bind(this)(collidable);
	}

	/**
	 * Updates this character's animation state while it moves. This method uses the child's implementation of the `_getAnimationImage()`
	 * method, since each `Character` child should implement the `UpdatesAnimationState` interface.
	 */
	private updateAnimationImage(): void {
		this.element.css({
			backgroundImage: `url(${ImageRegistry.getImage(
				this._getAnimationImage() as keyof typeof ImageRegistry.IMAGE_LIST
			)})`,
		});
	}

	/**
	 * Determines whether two positions on the board (`x` or `y`) are within `this.collisionThreshold` pixels of
	 * each other.
	 *
	 * @param offset1 the first `x` or `y` position
	 * @param offset2 the second `x` or `y` position
	 * @returns boolean indicating if they're within the collision threshold
	 */
	private distanceWithinThreshold(offset1: number, offset2: number): boolean {
		return Math.abs(offset1 - offset2) <= this.collisionThreshold;
	}

	/**
	 * Empties the turn queue for this character.
	 */
	private dequeueTurns(): void {
		this.turnQueue = [];
	}

	/**
	 * Recursively calls itself to update the character's position every frame.
	 *
	 * @param direction the direction the character is currently trying to move in
	 * @param lastAnimationTime the number of milliseconds between this animation frame and the last one
	 * @param timeStamp the current number of milliseconds that represents current time
	 */
	private move(direction: MovementDirection, lastAnimationTime: number, timeStamp: number) {
		const deltaTime = timeStamp - lastAnimationTime;

		this.deltaTimeSum += deltaTime;

		// prevents "deltaTimeSum" from being very large at the start of this character's movement, and therefore
		// moving the character a very large distance (even through walls) when it first starts moving
		if (!lastAnimationTime) {
			this.deltaTimeSum = 0;
		}

		// if (this.frameCount === 0) {
		// 	this.frameCountTimeStamp = timeStamp;
		// }

		// if (timeStamp >= this.frameCountTimeStamp + 1000) {
		// 	// Update every second
		// 	console.log({ fps: this.framesCounted });
		// 	this.framesCounted = 0;
		// 	this.frameCountTimeStamp = timeStamp;
		// }

		const deltaTimeSum = this.deltaTimeSum;

		// we only want to update this character at about "Character.MS_PER_FRAME" milliseconds
		if (deltaTimeSum >= Character.MS_PER_FRAME) {
			if (direction === MovementDirection.STOP) {
				this.stopMoving();

				return;
			}

			// if the game pauses, we want this character to stop moving, but preserve data that is important for unpausing
			// this character
			if (Board.GAME_PAUSED) {
				this.stopMoving(true);

				return;
			}

			// it's possible that the character has called "stopMoving()", but the animation frame's recursive calls
			// will keep going, so make sure the character stops calling "move()" here
			if (!this.moving) {
				return;
			}

			const position = this.getPosition()!;
			const tileX = Board.calcTileNumX(position.x + this.width / 2);
			const tileY = Board.calcTileNumY(position.y + this.height / 2);
			let positionCollidables = COLLIDABLES_MAP[`${tileX}-${tileY}`] || [];

			// index into the collidables map, and make sure that we also look to the "left/right" and "top/bottom" of
			// this character. so, in total we look "three" tiles horizontally and vertically, depending on the direction
			// this character is moving
			if (direction === MovementDirection.LEFT || direction === MovementDirection.RIGHT) {
				const positionCollidablesRight = COLLIDABLES_MAP[`${tileX + 1}-${tileY}`];
				const positionCollidablesLeft = COLLIDABLES_MAP[`${tileX - 1}-${tileY}`];

				if (positionCollidablesRight) {
					positionCollidables = positionCollidables.concat(positionCollidablesRight);
				}

				if (positionCollidablesLeft) {
					positionCollidables = positionCollidables.concat(positionCollidablesLeft);
				}
			} else {
				const positionCollidablesUp = COLLIDABLES_MAP[`${tileX}-${tileY + 1}`];
				const positionCollidablesDown = COLLIDABLES_MAP[`${tileX}-${tileY - 1}`];

				if (positionCollidablesUp) {
					positionCollidables = positionCollidables.concat(positionCollidablesUp);
				}

				if (positionCollidablesDown) {
					positionCollidables = positionCollidables.concat(positionCollidablesDown);
				}
			}

			if (defined(positionCollidables) && (positionCollidables as Collidable[]).length) {
				// check for collisions between this character and other collidables
				for (let i = 0; i < (positionCollidables as Collidable[]).length; i++) {
					const collidable = positionCollidables![i]! as Collidable;

					// filter out the current board object we're operating on
					if (collidable.getName() === this.name) {
						continue;
					}

					if (this.isCollidingWithCollidable(collidable)) {
					}
				}
			}

			// check the turn queue for any queued turns
			if (this.turnQueue.length) {
				const queuedTurnInfo = this.turnQueue[0]!;
				const turn = queuedTurnInfo.turn;

				// every frame, check if the character is within the queued-turn's threshold, and turn
				// the character in that direction when it is
				if (this.isWithinTurnDistance(turn)) {
					this.startMoving(queuedTurnInfo.direction, {
						fromTurn: turn,
					});

					// break out of the recursive animation frame calls so we can start moving in another direction
					return;
				}
			}

			// run any custom frame-based logic that each child class implements, per-frame. make sure to check if the frame
			// update returns "true", so we can optionally break out of the recursive "move()" calls
			if (this._runFrameUpdate()) {
				return;
			}

			const teleporterPositions = this.TELEPORTER_POSITIONS;
			const currentDirection = this.currentDirection!;

			// if this character is moving in any direction that leads to a teleporter, keep checking if it's within range
			// of one, and teleport them when they are
			if (
				this.TELEPORTER_DIRECTIONS.includes(currentDirection) &&
				this.isWithinTeleporterDistance(
					teleporterPositions[currentDirection as keyof typeof teleporterPositions]
				)
			) {
				// set character's position to the opposite teleporter
				this.setPositionX(
					teleporterPositions[
						Character.directionOpposites[
							currentDirection as keyof typeof Character.directionOpposites
						] as keyof typeof teleporterPositions
					].x,
					{
						modifyCss: false,
						modifyTransform: true,
					}
				);

				// start moving character in the same direction, again, because if we don't, the character will still have "stale" data tied to it.
				// for example, an "old" queued-turn, which was valid before the character teleported, but invalid afterwards. it could also
				// give pacman an invalid "nearestStoppingTurn", etc.
				this.startMoving(currentDirection);

				return;
			}

			this.movementMethods[direction as keyof MovementMethods].bind(this)(
				this.speed! * millisToSeconds(Character.MS_PER_FRAME)
			);

			this.frameCount++;
			// this.framesCounted++;
			this.deltaTimeSum = 0;
		}

		lastAnimationTime = timeStamp;

		this.animationFrameId = requestAnimationFrame((timeStampNew) =>
			this.move(direction, lastAnimationTime, timeStampNew)
		);
	}

	/**
	 * Animates this character upwards using by settings its CSS `transform` value, and also makes sure
	 * to update this character's `Position` so that it matches the amount of pixels moved.
	 *
	 * @param amount the amount of pixels to move the character up
	 */
	private moveUp(amount: number): void {
		this.setPositionY(this.getPosition()!.y - amount, {
			modifyCss: false,
			modifyTransform: true,
		});
	}

	/**
	 * Animates this character downwards using by settings its CSS `transform` value, and also makes sure
	 * to update this character's `Position` so that it matches the amount of pixels moved.
	 *
	 * @param amount the amount of pixels to move the character down
	 */
	private moveDown(amount: number): void {
		this.setPositionY(this.getPosition()!.y + amount, {
			modifyCss: false,
			modifyTransform: true,
		});
	}

	/**
	 * Animates this character left using by settings its CSS `transform` value, and also makes sure
	 * to update this character's `Position` so that it matches the amount of pixels moved.
	 *
	 * @param amount the amount of pixels to move the character left
	 */
	private moveLeft(amount: number): void {
		this.setPositionX(this.getPosition()!.x - amount, {
			modifyCss: false,
			modifyTransform: true,
		});
	}

	/**
	 * Animates this character right using by settings its CSS `transform` value, and also makes sure
	 * to update this character's `Position` so that it matches the amount of pixels moved.
	 *
	 * @param amount the amount of pixels to move the character right
	 */
	private moveRight(amount: number): void {
		this.setPositionX(this.getPosition()!.x + amount, {
			modifyCss: false,
			modifyTransform: true,
		});
	}
}
