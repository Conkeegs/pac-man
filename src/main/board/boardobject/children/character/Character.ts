"use strict";

import Board from "../../../../board/Board.js";
import { TILESIZE } from "../../../../utils/Globals.js";
import { fetchJSON, millisToSeconds, px } from "../../../../utils/Utils.js";
import { BoardObject } from "../../BoardObject.js";
import MovementDirection from "./MovementDirection.js";

/**
 * Represents a position on the board where a character is allowed to turn,
 * and also includes an array of `MovementDirection` values to tell the character
 * what directions it can turn when it reaches the given turn coordinates.
 */
export interface TurnData {
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
 * Represents this character's CSS `transform` `x` and `y` values.
 */
type Transform = {
	/**
	 * The character's `translateX` value in pixels.
	 */
	x: number;
	/**
	 * The character's `translateY` value in pixels.
	 */
	y: number;
};

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
 * The minimum number of pixels away from a turn location that a character must be in order to turn on it.
 */
export const TURN_THRESHOLD = 2;

/**
 * A character is any of the AI or user-controlled objects on the board.
 */
export default class Character extends BoardObject {
	/**
	 * The speed of the character (in pixels-per-second)
	 */
	private speed: number | undefined;
	/**
	 * The path to the character's picture file.
	 */
	private source: string | undefined;
	/**
	 * The current animation frame requested by the DOM for this character.
	 */
	private animationFrameId: number | undefined;
	/**
	 * Determines if the characters is currently moving.
	 */
	private moving = false;
	/**
	 * This character's CSS `transform` value, holding both its `translateX` and `translateY` values.
	 */
	private transform: Transform;
	/**
	 * A queue of turns that a character wants to make in the future. This suggests that the character isn't
	 * within `TURN_THRESHOLD` pixels of the turn yet, and so must queue the turn. The length of this array
	 * must always be `1`.
	 */
	private turnQueue: { direction: MovementDirection; turn: TurnData }[] = [];

	/**
	 * Data telling this character where it is allowed to turn
	 */
	protected turnData: TurnData[] | undefined;

	public override width: number = TILESIZE + Board.calcTileOffset(0.5);
	public override height = TILESIZE + Board.calcTileOffset(0.5);

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

		this.transform = {
			x: 0,
			y: 0,
		};

		// tell the character where it can turn
		fetchJSON("src/assets/json/turns.json").then((turnData: TurnData[]) => {
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
	 * Sets this character's `transformX` and `translateY` CSS values and in-memory.
	 *
	 * @param transform the amounts to change the `translateX` and `translateY` values by
	 */
	public setTransform(transform: Transform): void {
		this.element.css({
			transform: `translate(${px(transform.x)}, ${px(transform.y)})`,
		});

		this.transform = transform;
	}

	/**
	 * Sets this character's `translateX` CSS value and in-memory.
	 *
	 * @param x the amount to change the `translateX` by
	 */
	public setTransformX(x: number): void {
		this.element.css({
			transform: `translate(${px(x)}, ${px(this.transform.y)})`,
		});

		this.transform.x = x;
	}

	/**
	 * Sets this character's `transformY` CSS value and in-memory.
	 *
	 * @param y the amount to change the `transformY` by
	 */
	public setTransformY(y: number): void {
		this.element.css({
			transform: `translate(${px(this.transform.x)}, ${px(y)})`,
		});

		this.transform.y = y;
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
		cancelAnimationFrame(this.animationFrameId as number);

		this.moving = false;

		return false;
	}

	/**
	 * Sets up initial request for animation frame and then starts recursively calling `this.move()` method to move this character.
	 *
	 * @param direction the direction the character is currently trying to move in
	 * @param fromTurn optional parameter which tells the location that the character is turning at. This might not
	 * be provided because it's possible that this character is simply "turning around" in the opposite direction of
	 * where it is currently heading, and not making a 90 degree turn.
	 */
	public startMoving(direction: MovementDirection, fromTurn?: TurnData) {
		// call this so we can reset the animation frame id every time a character moves
		this.stopMoving();

		if (fromTurn) {
			const oldPosition = this.getPosition()!;
			// find the "true" position x & y that the Character should be placed at when performing a turn (since
			// it could be within the turn's threshold, but not perfectly placed at the turn position)
			const characterTurnX = fromTurn.x - this.getWidth()! / 2;
			const characterTurnY = fromTurn.y - this.getHeight()! / 2;

			// we know at this point that we're within this turn's threshold, so correct the character's position
			// by moving it to the turn's exact location to keep the character's movement consistent
			if (oldPosition.x !== characterTurnX || oldPosition.y !== characterTurnY) {
				this.setPosition(
					{
						x: characterTurnX,
						y: characterTurnY,
					},
					false
				);

				// get the character's new position in order to compare it to its old one, since it moved a small distance
				// to "correct" its position
				const newPosition = this.getPosition()!;
				const transform = this.transform;

				// add to character's transform since we've "corrected" its position by a little bit
				this.setTransform({
					x: transform.x + (newPosition.x - oldPosition.x),
					y: transform.y + (newPosition.y - oldPosition.y),
				});
			}
		}

		this.animationFrameId = requestAnimationFrame((timeStamp) => this.move(direction, null, timeStamp));

		this.moving = true;
	}

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
			Math.abs(position.x + this.width / 2 - turn.x) <= TURN_THRESHOLD &&
			Math.abs(position.y + this.height / 2 - turn.y) <= TURN_THRESHOLD
		);
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

		// check the turn queue for any queued turns
		if (this.turnQueue.length) {
			const queuedTurnInfo = this.turnQueue[0]!;
			const turn = queuedTurnInfo.turn;

			// every frame, check if the character is within the queued-turn's threshold, and turn
			// the character in that direction when it is
			if (this.isWithinTurnDistance(turn)) {
				this.startMoving(queuedTurnInfo.direction, turn);
				this.dequeueTurns();

				// break out of the recursive animation frame calls so we can start moving in another direction
				return;
			}
		}

		// only updates character's position if we've already called the "move" function before
		if (lastAnimationTime) {
			this.movementMethods[direction as keyof MovementMethods].bind(this)(
				this.speed! * millisToSeconds(timeStamp - lastAnimationTime)
			);
		}

		lastAnimationTime = timeStamp;

		// (this.positionHandlers[direction] as PositionHandler)(timeStamp - lastAnimationTime);

		this.animationFrameId = requestAnimationFrame((timeStampNew) =>
			this.move(direction, lastAnimationTime, timeStampNew)
		);
	}

	/**
	 * Empties the turn queue for this character.
	 */
	private dequeueTurns(): void {
		this.turnQueue = [];
	}

	/**
	 * Animates this character upwards using by settings its CSS `transform` value, and also makes sure
	 * to update this character's `Position` so that it matches the amount of pixels moved.
	 *
	 * @param amount the amount of pixels to move the character up
	 */
	private moveUp(amount: number): void {
		this.setTransformY(this.transform.y - amount);
		this.setPositionY(this.getPosition()!.y - amount, false);
	}

	/**
	 * Animates this character downwards using by settings its CSS `transform` value, and also makes sure
	 * to update this character's `Position` so that it matches the amount of pixels moved.
	 *
	 * @param amount the amount of pixels to move the character down
	 */
	private moveDown(amount: number): void {
		this.setTransformY(this.transform.y + amount);
		this.setPositionY(this.getPosition()!.y + amount, false);
	}

	/**
	 * Animates this character left using by settings its CSS `transform` value, and also makes sure
	 * to update this character's `Position` so that it matches the amount of pixels moved.
	 *
	 * @param amount the amount of pixels to move the character left
	 */
	private moveLeft(amount: number): void {
		this.setTransformX(this.transform.x - amount);
		this.setPositionX(this.getPosition()!.x - amount, false);
	}

	/**
	 * Animates this character right using by settings its CSS `transform` value, and also makes sure
	 * to update this character's `Position` so that it matches the amount of pixels moved.
	 *
	 * @param amount the amount of pixels to move the character right
	 */
	private moveRight(amount: number): void {
		this.setTransformX(this.transform.x + amount);
		this.setPositionX(this.getPosition()!.x + amount, false);
	}
}
