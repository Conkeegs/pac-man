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
interface TurnData {
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

// type PositionHandler = ((elapsedTime: number) => string | number | undefined) | (() => boolean);

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
	 * Data telling this character where it is allowed to turn
	 */
	private turnData: TurnData[] | undefined;
	/**
	 * This character's CSS `transform` value, holding both its `translateX` and `translateY` values.
	 */
	private transform: Transform;

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
				turn.x = Board.calcTileOffset(turn.x) + Board.calcTileOffset(0.5);
				turn.y = Board.calcTileOffset(turn.y) + Board.calcTileOffset(0.5);
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
	 * Sets this character's `transformX` CSS value and in-memory.
	 *
	 * @param x the amount to change the `transformX` by
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
	 * Starts recursively calling `this.move()` method to move this character.
	 *
	 * @param direction the direction the character is currently trying to move in
	 */
	public startMoving(direction: MovementDirection) {
		// call this so we can reset the animation frame id every time a character moves
		this.stopMoving();

		this.animationFrameId = requestAnimationFrame((timeStamp) => this.move(direction, null, timeStamp));

		this.moving = true;
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

		// only updates character's position if we've already called the "move" function before
		if (lastAnimationTime) {
			this.movementMethods[direction as keyof MovementMethods](
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
