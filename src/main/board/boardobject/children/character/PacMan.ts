"use strict";

import { exists } from "../../../../utils/Utils.js";
import Character from "./Character.js";
import MovementDirection from "./MovementDirection.js";

export default class PacMan extends Character {
	private lastMoveCode: MovementDirection | undefined;
	private moveCodes = {
		ArrowLeft: MovementDirection.LEFT,
		KeyA: MovementDirection.LEFT,
		ArrowRight: MovementDirection.RIGHT,
		KeyD: MovementDirection.RIGHT,
		ArrowUp: MovementDirection.UP,
		KeyW: MovementDirection.UP,
		ArrowDown: MovementDirection.DOWN,
		KeyS: MovementDirection.DOWN,
		Space: MovementDirection.STOP,
	};

	constructor(name: string, speed: number, source: string) {
		super(name, speed, source);

		this.createMoveEventListeners();
	}

	private createMoveEventListeners() {
		document.body.addEventListener("keydown", (event) => {
			event.stopImmediatePropagation();

			let moveCode = this.moveCodes[event.code as keyof typeof this.moveCodes];

			if (moveCode == MovementDirection.STOP && this.isMoving()) {
				event.preventDefault();
				this.stopMoving();

				return;
			}

			if (exists(moveCode) && (!this.isMoving() || this.lastMoveCode !== moveCode)) {
				this.startMoving(moveCode);

				this.lastMoveCode = moveCode;
			}
		});
	}
}
