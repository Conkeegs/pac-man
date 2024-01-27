"use strict";

import Board from "../../../../board/Board.js";
import { TILESIZE } from "../../../../utils/Globals.js";
import { add, fetchJSON, millisToSeconds, px, subtract } from "../../../../utils/Utils.js";
import { BoardObject, type Position } from "../../BoardObject.js";
import MovementDirection from "./MovementDirection.js";

interface TurnData {
	x: number;
	y: number;
	directions: number[];
}

// type PositionHandler = ((elapsedTime: number) => string | number | undefined) | (() => boolean);

export default class Character extends BoardObject {
	private speed: number | undefined;
	private source: string | undefined;
	private animationFrameId: number | undefined;
	private moving = false;
	// private turnData: object | undefined;

	public override width: number = TILESIZE + Board.calcTileOffset(0.5);
	public override height = TILESIZE + Board.calcTileOffset(0.5);

	private movementOperators = {
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

	constructor(name: string, speed: number, source: string) {
		super(name);

		this.speed = speed;
		this.source = source;

		this.getElement().css({
			width: px(this.width),
			height: px(this.height),
			backgroundImage: `url(${source})`,
		});

		fetchJSON("src/assets/json/turns.json").then((turnData: TurnData[]) => {
			for (let turn of turnData) {
				turn.x = Board.calcTileOffset(turn.x) + Board.calcTileOffset(0.5);
				turn.y = Board.calcTileOffset(turn.y) + Board.calcTileOffset(0.5);
			}

			// this.turnData = turnData;
		});
	}

	public isMoving() {
		return this.moving;
	}

	public startMoving(direction: MovementDirection) {
		this.stopMoving();

		this.animationFrameId = requestAnimationFrame((timeStamp) => this.move(direction, null, timeStamp));

		this.moving = true;
	}

	private move(direction: MovementDirection, lastAnimationTime: null | number, timeStamp: number) {
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
	 *
	 * @param direction
	 * @param elapsedTime
	 * @returns { void }
	 */
	private updatePosition(direction: MovementDirection, elapsedTime: number): void {
		if (direction === MovementDirection.STOP) {
			this.stopMoving();
		}

		const operators = this.movementOperators[direction as keyof typeof this.movementOperators];
		const cssDirection = operators.direction;

		const newDirectionPosition = operators.arithmetic(
			this.position![cssDirection as keyof Position],
			this.speed! * millisToSeconds(elapsedTime)
		);

		this.getElement().css({
			[cssDirection]: px(newDirectionPosition),
		});

		this.position![cssDirection as keyof Position] = newDirectionPosition;
	}

	public stopMoving() {
		cancelAnimationFrame(this.animationFrameId as number);

		this.moving = false;

		return false;
	}

	public getName() {
		return this.name;
	}

	public getSpeed() {
		return this.speed;
	}

	public getSource() {
		return this.source;
	}
}
