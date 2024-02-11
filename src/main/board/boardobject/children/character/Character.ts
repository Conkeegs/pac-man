"use strict";

import Board from "../../../../board/Board.js";
import { TILESIZE } from "../../../../utils/Globals.js";
import { add, fetchJSON, millisToSeconds, px, subtract } from "../../../../utils/Utils.js";
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
 * Depending on which direction a character is moving in, this object will return a set of data
 * related to getting the `x` or `y` position key we need (so we can modify it), what position-setter
 * function to call, and whether to subtract/add to the character current `x` or `y` position.
 */
type MovementOperators = {
	[key in MovementDirection.LEFT | MovementDirection.RIGHT | MovementDirection.UP | MovementDirection.DOWN]: {
		/**
		 * Used to index into either the `x` or `y` value of this character's `Position`.
		 */
		positionKey: "x" | "y";
		/**
		 * The `BoardObject` method to call for this character that either sets its `x` or `y` position.
		 *
		 * @param positionKey the `x` or `y` value of this character's `Position`
		 */
		positionSetter: (positionKey: number) => void;
		/**
		 * Adds/subtracts from this character's `x` or `y` position on the board and returns the difference.
		 *
		 * @param xOrYPosition the `x` or `y` value of this character's `Position`
		 * @param speedElapsedTimeProduct this character's speed multiplied by the number of milliseconds between the current frame and the last
		 * @returns the difference between `xOrYPosition` and `speedElapsedTimeProduct`
		 */
		arithmetic: (xOrYPosition: number, speedElapsedTimeProduct: number) => number;
	};
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

	public override width: number = TILESIZE + Board.calcTileOffset(0.5);
	public override height = TILESIZE + Board.calcTileOffset(0.5);

	/**
	 * Represents CSS operations that must happen when this character moves in a given direction.
	 * For example, when the character moves left, we must subtract from its current css `transform: translateX` value.
	 */
	private movementOperators: MovementOperators = {
		[MovementDirection.LEFT]: {
			positionKey: "x",
			positionSetter: this.setPositionX,
			arithmetic: subtract,
		},
		[MovementDirection.RIGHT]: {
			positionKey: "x",
			positionSetter: this.setPositionX,
			arithmetic: add,
		},
		[MovementDirection.UP]: {
			positionKey: "y",
			positionSetter: this.setPositionY,
			arithmetic: subtract,
		},
		[MovementDirection.DOWN]: {
			positionKey: "y",
			positionSetter: this.setPositionY,
			arithmetic: add,
		},
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

		this.getElement().css({
			width: px(this.width),
			height: px(this.height),
			backgroundImage: `url(${source})`,
		});

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
	 * Determines if the character is currently moving.
	 * @returns `boolean` if the character is moving or not
	 */
	public isMoving() {
		return this.moving;
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
			this.updatePosition(direction, timeStamp - lastAnimationTime);
		}

		lastAnimationTime = timeStamp;

		// (this.positionHandlers[direction] as PositionHandler)(timeStamp - lastAnimationTime);

		this.animationFrameId = requestAnimationFrame((timeStampNew) =>
			this.move(direction, lastAnimationTime, timeStampNew)
		);
	}

	/**
	 * Updates this character's position in memory and also updates the character's CSS so that it physically moves on the board
	 * every frame.
	 *
	 * @param direction the direction the character is currently trying to move in
	 * @param elapsedTime the number of milliseconds between this frame and the last
	 * @returns { void }
	 */
	private updatePosition(direction: MovementDirection, elapsedTime: number): void {
		const operators = this.movementOperators[direction as keyof MovementOperators];
		// const cssDirection = operators.direction;
		// const positionKey = operators.positionKey;

		// depending on which direction character is moving in, subtract/add from the character's current position
		const newDirectionPosition = operators.arithmetic(
			this.getPosition()![operators.positionKey],
			this.speed! * millisToSeconds(elapsedTime)
		);

		operators.positionSetter(newDirectionPosition);

		// this.getElement().css({
		// 	[cssDirection]: px(newDirectionPosition),
		// });

		// this.position![cssDirection as keyof Position] = newDirectionPosition;
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
}
