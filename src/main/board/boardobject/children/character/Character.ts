"use strict";

import Board from "../../../../board/Board.js";
import { TILESIZE } from "../../../../utils/Globals.js";
import { add, fetchJSON, millisToSeconds, px, subtract } from "../../../../utils/Utils.js";
import { BoardObject, type Position } from "../../BoardObject.js";
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

type MovementOperators = {
	[key in MovementDirection.LEFT | MovementDirection.RIGHT | MovementDirection.UP | MovementDirection.DOWN]: {
		direction: "left" | "top";
		arithmetic: (first: number, second: number) => number;
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
	 * Represents CSS operations that must happen when a given characters moves in a given direction.
	 * For example, when the character moves left, we must subtract from its current css "left" value.
	 */
	private movementOperators: MovementOperators = {
		[MovementDirection.LEFT]: {
			direction: "left",
			arithmetic: subtract,
		},
		[MovementDirection.RIGHT]: {
			direction: "left",
			arithmetic: add,
		},
		[MovementDirection.UP]: {
			direction: "top",
			arithmetic: subtract,
		},
		[MovementDirection.DOWN]: {
			direction: "top",
			arithmetic: add,
		},
	};

	// private positionHandlers: PositionHandler[] = [
	// 	(elapsedTime) => {
	// 		return px(
	// 			(
	// 				this.getElement().css({
	// 					left: `calc(${this.getElement().css("left")} - ${px(
	// 						this.speed! * millisToSeconds(elapsedTime)
	// 					)})`,
	// 				}) as HTMLElement
	// 			).css("left") as string
	// 		);
	// 	},
	// 	(elapsedTime) => {
	// 		return px(
	// 			(
	// 				this.getElement().css({
	// 					left: `calc(${this.getElement().css("left")} + ${px(
	// 						this.speed! * millisToSeconds(elapsedTime)
	// 					)})`,
	// 				}) as HTMLElement
	// 			).css("left") as string
	// 		);
	// 	},
	// 	(elapsedTime) => {
	// 		return px(
	// 			(
	// 				this.getElement().css({
	// 					top: `calc(${this.getElement().css("top")} - ${px(
	// 						this.speed! * millisToSeconds(elapsedTime)
	// 					)})`,
	// 				}) as HTMLElement
	// 			).css("top") as string
	// 		);
	// 	},
	// 	(elapsedTime) => {
	// 		return px(
	// 			(
	// 				this.getElement().css({
	// 					top: `calc(${this.getElement().css("top")} + ${px(
	// 						this.speed! * millisToSeconds(elapsedTime)
	// 					)})`,
	// 				}) as HTMLElement
	// 			).css("top") as string
	// 		);
	// 	},
	// 	() => {
	// 		return this.stopMoving();
	// 	},
	// ];

	// private positionHandlers: PositionHandler[] = [
	// 	(elapsedTime) => {
	// 		const element = this.getElement();
	// 		const newPosition =
	// 			(px(element.css("left") as string) as number) - this.speed! * millisToSeconds(elapsedTime);

	// 		element.css({
	// 			left: newPosition,
	// 		});

	// 		return newPosition;
	// 	},
	// 	(elapsedTime) => {
	// 		return px(
	// 			(
	// 				this.getElement().css({
	// 					left: `calc(${this.getElement().css("left")} + ${px(
	// 						this.speed! * millisToSeconds(elapsedTime)
	// 					)})`,
	// 				}) as HTMLElement
	// 			).css("left") as string
	// 		);
	// 	},
	// 	(elapsedTime) => {
	// 		return px(
	// 			(
	// 				this.getElement().css({
	// 					top: `calc(${this.getElement().css("top")} - ${px(
	// 						this.speed! * millisToSeconds(elapsedTime)
	// 					)})`,
	// 				}) as HTMLElement
	// 			).css("top") as string
	// 		);
	// 	},
	// 	(elapsedTime) => {
	// 		return px(
	// 			(
	// 				this.getElement().css({
	// 					top: `calc(${this.getElement().css("top")} + ${px(
	// 						this.speed! * millisToSeconds(elapsedTime)
	// 					)})`,
	// 				}) as HTMLElement
	// 			).css("top") as string
	// 		);
	// 	},
	// 	() => {
	// 		return this.stopMoving();
	// 	},
	// ];

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
	 *
	 * @param direction
	 * @param elapsedTime
	 * @returns { string | number | boolean | undefined }
	 */
	// private updatePosition(direction: MovementDirection, elapsedTime: number) {
	// 	if (direction === MovementDirection.STOP) {
	// 		return this.stopMoving();
	// 	}

	// const cssOperators = this.movementCssOperators[direction as keyof typeof this.movementCssOperators];
	// const cssDirection = cssOperators.direction;

	// console.log({ newPosition });
	// console.log({ cssMethdType: typeof this.getElement().css });

	// return px(
	// 	(
	// 		this.getElement().css({
	// 			[cssDirection]: `calc(${this.getElement().css(cssDirection)} ${cssOperators.arithmetic} ${px(
	// 				this.speed! * millisToSeconds(elapsedTime)
	// 			)})`,
	// 		}) as HTMLElement
	// 	).css(cssDirection) as string
	// );

	// const newPosition = px(this.getElement().css(cssDirection) as string)

	// return px(
	// 	(
	// 		this.getElement().css({
	// 			[cssDirection]: `calc(${this.getElement().css(cssDirection)} ${cssOperators.arithmetic} ${px(
	// 				this.speed! * millisToSeconds(elapsedTime)
	// 			)})`,
	// 		}) as HTMLElement
	// 	).css(cssDirection) as string
	// );
	// }

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
		const cssDirection = operators.direction;

		// depending on which direction character is moving in, subtract/add from the character's current position
		const newDirectionPosition = operators.arithmetic(
			this.position![cssDirection as keyof Position],
			this.speed! * millisToSeconds(elapsedTime)
		);

		this.getElement().css({
			[cssDirection]: px(newDirectionPosition),
		});

		this.position![cssDirection as keyof Position] = newDirectionPosition;
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
