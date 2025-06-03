"use strict";

import { GameElement } from "../../gameelement/GameElement.js";

/**
 * Represents characters/small, generally tile-sized objects on the board.
 */
export abstract class BoardObject extends GameElement {
	/**
	 * `z-index` CSS property of all `BoardObject` instances on the board.
	 */
	public static BOARD_OBJECT_Z_INDEX: 0 = 0;

	/**
	 * Creates a board object.
	 *
	 * @param name the name/HTML id of the board object
	 * @param width the width of this board object
	 * @param height the width of this board object
	 */
	constructor(name: string, width: number, height: number) {
		super(name, width, height);

		const element = this.getElement();

		element.css({
			zIndex: BoardObject.BOARD_OBJECT_Z_INDEX,
		});
		element.classList.add("board-object");
	}
}
