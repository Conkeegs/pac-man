"use strict";

import { exists } from "../../../../utils/Utils.js";
import Character from "./Character.js";
import MovementDirection from "./MovementDirection.js";

/**
 * Represents the PacMan character on the board.
 */
export default class PacMan extends Character {
	/**
	 * The last direction the user moved in.
	 */
	private lastMoveCode: MovementDirection | undefined;

	/**
	 * All supported keyboard keys for moving PacMan.
	 */
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

	/**
	 * Creates PacMan.
	 *
	 * @param name
	 * @param speed
	 * @param source
	 */
	constructor(name: string, speed: number, source: string) {
		super(name, speed, source);

		this.createMoveEventListeners();
	}

	/**
	 * DOM event listeners that allow the user to control PacMan.
	 */
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
