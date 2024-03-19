"use strict";

import ImageRegistry from "../../../../assets/ImageRegistry.js";
import JsonRegistry from "../../../../assets/JsonRegistry.js";
import Board from "../../../../board/Board.js";
import { TILESIZE } from "../../../../utils/Globals.js";
import { fetchJSON, millisToSeconds, px } from "../../../../utils/Utils.js";
import { BoardObject, type Position } from "../../BoardObject.js";
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
 * A character is any of the AI or user-controlled objects on the board.
 */
export default abstract class Character extends BoardObject {
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
	 * The minimum number of pixels away from another position on the board that a character must be to be considered "colliding" with it.
	 */
	private static readonly COLLISION_THRESHOLD: 2 = 2;
	/**
	 * How long each animation state for this character lasts.
	 */
	private static readonly ANIMATION_STATE_MILLIS: 30 = 30;
	/**
	 * Determines if the characters is currently moving.
	 */
	private moving: boolean = false;
	/**
	 * The current frame iteration that this character's animation frame is on.
	 */
	private frameCount: number = 0;
	/**
	 * The directions that this character must be moving in order to search for the nearest "teleport" position.
	 */
	private readonly TELEPORTER_DIRECTIONS: MovementDirection[] = [MovementDirection.LEFT, MovementDirection.RIGHT];
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
	 * A queue of turns that a character wants to make in the future. This suggests that the character isn't
	 * within `TURN_THRESHOLD` pixels of the turn yet, and so must queue the turn. The length of this array
	 * must always be `1`.
	 */
	protected turnQueue: { direction: MovementDirection; turn: TurnData }[] = [];
	/**
	 * This character's nearest turn which does not accept its current movement direction, and "stops" the character from moving.
	 */
	protected nearestStoppingTurn: TurnData | undefined;
	/**
	 * The current direction this character is currently moving in.
	 */
	protected currentDirection: MovementDirection | undefined;
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

	/**
	 * Data telling this character where it is allowed to turn
	 */
	public turnData: TurnData[] | undefined;

	public override readonly width: number = TILESIZE + Board.calcTileOffset(0.5);
	public override readonly height = TILESIZE + Board.calcTileOffset(0.5);

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
	 * Creates a character.
	 *
	 * @param name
	 * @param speed the speed of the character (in pixels-per-second)
	 * @param source the path to the character's picture file
	 */
	constructor(name: string, speed: number, source: string) {
		super(name);

		this.speed = speed;
		this.source = source;

		this.element.css({
			width: px(this.width),
			height: px(this.height),
			backgroundImage: `url(${source})`,
		});

		// tell the character where it can turn
		fetchJSON(JsonRegistry.getJson("turns")).then((turnData: TurnData[]) => {
			for (let turn of turnData) {
				turn.x = Board.calcTileX(turn.x + 0.5);
				turn.y = Board.calcTileY(turn.y - 0.5);
			}

			this.turnData = turnData;
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
	 * Determines if the character is currently moving.
	 * @returns `boolean` if the character is moving or not
	 */
	public isMoving() {
		return this.moving;
	}

	/**
	 * Cancels this character's current animation frame so that `this.move()` isn't called anymore.
	 *
	 * @returns
	 */
	public stopMoving() {
		this.dequeueTurns();
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
	 * @param fromTurn optional parameter which tells the location that the character is turning at. This might not
	 * be provided because it's possible that this character is simply "turning around" in the opposite direction of
	 * where it is currently heading, and not making a 90 degree turn.
	 */
	public startMoving(direction: MovementDirection, fromTurn?: TurnData) {
		if (this.turnQueue.length) {
			// reset turn queue each time we head in a new direction
			this.dequeueTurns();
		}

		if (this.moving) {
			// call this so we can reset the animation frame id every time a character moves
			this.stopMoving();
		}

		// set this character's current direction since we now know that it's going to start moving
		this.currentDirection = direction;

		if (fromTurn) {
			// snap to turn-position to keep collision detection consistent
			this.offsetPositionToTurn(fromTurn);
		}

		// start playing this character's animations as they move.
		this.animationIntervalId = window.setInterval(
			this.updateAnimationImage.bind(this),
			Character.ANIMATION_STATE_MILLIS
		);

		this.animationFrameId = requestAnimationFrame((timeStamp) => this.move(direction, null, timeStamp));

		this.moving = true;
	}

	/**
	 * Returns the name of an animation-related image for the character.
	 */
	abstract _getAnimationImage(): string;

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
	 * Determines if a character is within `TURN_THRESHOLD` pixels of a turn's position.
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
			Character.distanceWithinThreshold(position.x + this.width / 2, turn.x) &&
			Character.distanceWithinThreshold(position.y + this.height / 2, turn.y)
		);
	}

	/**
	 * Determines if a character is within `TURN_THRESHOLD` pixels of a teleporter.
	 *
	 * @param position the position of the teleporter's collision
	 * @returns boolean indicating if the character is within the pixel threshold of the teleporter
	 */
	protected isWithinTeleporterDistance(teleporterPosition: Position): boolean {
		const position = this.getPosition()!;
		let positionX = position.x;

		return (
			Character.distanceWithinThreshold(positionX, teleporterPosition.x) && position.y === teleporterPosition.y
		);
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
	 * Determines whether two positions on the board (`x` or `y`) are within `CHaracter.COLLISION_THRESHOLD` pixels of
	 * each other.
	 *
	 * @param offset1 the first `x` or `y` position
	 * @param offset2 the second `x` or `y` position
	 * @returns boolean indicating if they're within the collision threshold
	 */
	private static distanceWithinThreshold(offset1: number, offset2: number): boolean {
		return Math.abs(offset1 - offset2) <= Character.COLLISION_THRESHOLD;
	}

	/**
	 * Empties the turn queue for this character.
	 */
	private dequeueTurns(): void {
		this.turnQueue = [];
	}

	/**
	 * Given a turn, this function will physically "snap" this `Character`'s position to it. This is
	 * useful since collision detection relies on specific offsets of characters on the board, relative
	 * to each turn.
	 *
	 * @param turn the turn to snap this `Character`'s physical to
	 */
	private offsetPositionToTurn(turn: TurnData): void {
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
	 * Recursively calls itself to update the character's position every frame.
	 *
	 * @param direction the direction the character is currently trying to move in
	 * @param lastAnimationTime the number of milliseconds between this animation frame and the last one
	 * @param timeStamp the current number of milliseconds that represents current time
	 */
	private move(direction: MovementDirection, lastAnimationTime: null | number, timeStamp: number) {
		if (direction === MovementDirection.STOP) {
			this.stopMoving();

			return;
		}

		// it's possible that the character has called "stopMoving()", but the animation frame's recursive calls
		// will keep going, so make sure the character stops calls "move()" here
		if (!this.moving) {
			return;
		}

		// check the turn queue for any queued turns
		if (this.turnQueue.length) {
			const queuedTurnInfo = this.turnQueue[0]!;
			const turn = queuedTurnInfo.turn;

			// every frame, check if the character is within the queued-turn's threshold, and turn
			// the character in that direction when it is
			if (this.isWithinTurnDistance(turn)) {
				this.startMoving(queuedTurnInfo.direction, turn);

				// break out of the recursive animation frame calls so we can start moving in another direction
				return;
			}
		}

		const currentDirection = this.currentDirection!;

		// look for a nearest "stopping" turn after we've made sure that we aren't within a queued-turn's range. this way,
		// the character doesn't just stop and cancel valid queued-turns.
		// we only need to look for the nearest stopping position once, so we only check for frame "0" here, and we can accurately
		// track when this character arrives at its "nearestTurn" and stop the character if it hits a wall. this will also prevent
		// characters with queued-turns that are technically "behind" a wall from ever executing the turn
		if (this.frameCount === 0) {
			const filteredTurnData = this.turnData!.filter((turn) => {
				// turns "ahead" of character which do not accept the current direction of movement that this character
				// is currently moving in
				return (
					this.turnValidators[currentDirection as keyof typeof this.turnValidators](
						turn,
						this.getPosition()!
					) && !Character.canTurnWithMoveDirection(currentDirection, turn)
				);
			});

			// turns are always ordered from left-to-right, starting from the top-left of the board and ending at the bottom-right, so
			// reverse the array here so that the nearest turn isn't at the "end" of the array
			if (currentDirection === MovementDirection.LEFT || currentDirection === MovementDirection.UP) {
				filteredTurnData.reverse();
			}

			this.nearestStoppingTurn = filteredTurnData[0];
		}

		const nearestTurn = this.nearestStoppingTurn;

		if (
			nearestTurn &&
			// check if character is within nearest turn's distance (e.g. technically hitting the wall)
			this.isWithinTurnDistance(nearestTurn)
		) {
			this.stopMoving();
			// snap character to "stop" location to keep collision detection consistent
			this.offsetPositionToTurn(nearestTurn);

			// break out of the recursive animation frame calls so we can stop at this Character's nearest turn
			return;
		}

		const teleporterPositions = this.TELEPORTER_POSITIONS;

		// if this character is moving in any direction that leads to a teleporter, keep checking if it's within range
		// of one, and teleport them when they are
		if (
			this.TELEPORTER_DIRECTIONS.includes(currentDirection) &&
			this.isWithinTeleporterDistance(teleporterPositions[currentDirection as keyof typeof teleporterPositions])
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

			// start moving them in the same direction, again, because if we don't, we'll have an old "nearestStoppingTurn"
			// stored in memory, and the character will phase through walls to get to it
			this.startMoving(currentDirection);

			return;
		}

		if (lastAnimationTime) {
			// only updates character's position if we've already called the "move" function before
			this.movementMethods[direction as keyof MovementMethods].bind(this)(
				this.speed! * millisToSeconds(timeStamp - lastAnimationTime)
			);
		}

		lastAnimationTime = timeStamp;

		this.frameCount++;

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
