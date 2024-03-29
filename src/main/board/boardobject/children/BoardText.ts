"use strict";

import DebugWindow from "../../../debugwindow/DebugWindow.js";
import { BOARD_OBJECT_Z_INDEX, TILESIZE } from "../../../utils/Globals.js";
import { px } from "../../../utils/Utils.js";
import { BoardObject } from "../BoardObject.js";

/**
 * Represents text on the board.
 */
export default class BoardText extends BoardObject {
	public override readonly width: number = TILESIZE;
	public override readonly height: number = TILESIZE;

	/**
	 * Creates a board text object.
	 *
	 * @param name
	 * @param text the text content to be displayed
	 * @param fontsize the size of the text's font
	 * @param color the color of the text
	 */
	constructor(name: string, text: string, fontsize = TILESIZE, color = "white") {
		super(name);

		if (fontsize > 24) {
			DebugWindow.error(
				"BoardText.js",
				"constructor",
				`fontsize cannot be greater than tile size: ${px(TILESIZE)}.`
			);
		}

		(
			this.element.css({
				width: px(this.width),
				height: px(this.height),
				fontSize: px(fontsize),
				color: color,
				zIndex: BOARD_OBJECT_Z_INDEX + 2,
			}) as HTMLElement
		).textContent = text;
	}
}
