"use strict";

import Board from "../../../../board/Board.js";
import { TILESIZE } from "../../../../utils/Globals.js";
import { fetchJSON, millisToSeconds, px } from "../../../../utils/Utils.js";
import { BoardObject } from "../../BoardObject.js";
import type MovementDirection from "./MovementDirection.js";

interface TurnData {
	x: number;
	y: number;
	directions: number[];
}

export default class Character extends BoardObject {
	private name: string | null = null;
	private speed: number | null = null;
	private source: string | null = null;
	public override width: number = TILESIZE + TILESIZE * 0.5;
	public override height = TILESIZE + TILESIZE * 0.5;
	private animationFrameId: number | null = null;
	private moving = false;
	// private turnData: object | null = null;

	private moveDirections: (((elapsedTime: number) => string | number | null) | (() => boolean))[] = [
		(elapsedTime) => {
			return px(
				(
					this.getElement().css({
						left: `calc(${this.getElement().css("left")} - ${px(
							this.speed! * millisToSeconds(elapsedTime)
						)})`,
					}) as HTMLElement
				).css("left") as string
			);
		},
		(elapsedTime) => {
			return px(
				(
					this.getElement().css({
						left: `calc(${this.getElement().css("left")} + ${px(
							this.speed! * millisToSeconds(elapsedTime)
						)})`,
					}) as HTMLElement
				).css("left") as string
			);
		},
		(elapsedTime) => {
			return px(
				(
					this.getElement().css({
						top: `calc(${this.getElement().css("top")} - ${px(
							this.speed! * millisToSeconds(elapsedTime)
						)})`,
					}) as HTMLElement
				).css("top") as string
			);
		},
		(elapsedTime) => {
			return px(
				(
					this.getElement().css({
						top: `calc(${this.getElement().css("top")} + ${px(
							this.speed! * millisToSeconds(elapsedTime)
						)})`,
					}) as HTMLElement
				).css("top") as string
			);
		},
		() => {
			return this.stopMoving();
		},
	];

	constructor(name: string, speed: number, source: string) {
		super(name);

		this.name = name;
		this.speed = speed;
		this.source = source;

		this.getElement().css({
			width: px(this.width),
			height: px(this.height),
			backgroundImage: `url(${source})`,
		});

		fetchJSON("src/assets/json/turns.json").then((turnData: TurnData[]) => {
			for (let turn of turnData) {
				turn.x = Board.calcTileOffset(turn.x) + TILESIZE / 2;
				turn.y = Board.calcTileOffset(turn.y) + TILESIZE / 2;
			}

			console.log(turnData);

			// this.turnData = turnData;
		});
	}

	public isMoving() {
		return this.moving;
	}

	public startMoving(direction: MovementDirection) {
		this.stopMoving();

		let lastAnimationTime: null | number = null;

		this.animationFrameId = requestAnimationFrame((timeStamp) =>
			this.move(direction, lastAnimationTime, timeStamp)
		);

		this.moving = true;
	}

	private move(direction: MovementDirection, lastAnimationTime: null | number, timeStamp: number) {
		lastAnimationTime = timeStamp;

		let newPosition: string | number | null = (
			this.moveDirections[direction] as (elapsedTime: number) => string | number | null
		)(timeStamp - lastAnimationTime);

		this.animationFrameId = requestAnimationFrame((timeStampNew) =>
			this.move(direction, lastAnimationTime, timeStampNew)
		);
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
