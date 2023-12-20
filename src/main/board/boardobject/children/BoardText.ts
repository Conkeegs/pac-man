"use strict";

import DebugWindow from "../../../debugwindow/DebugWindow.js";
import { TILESIZE } from "../../../utils/Globals.js";
import { px } from "../../../utils/Utils.js";
import { BoardObject } from "../BoardObject.js";

export default class BoardText extends BoardObject {
	public override width = TILESIZE;
	public override height = TILESIZE;

	constructor(name: string, text: string, fontsize = TILESIZE, color = "white") {
		super(name);

		if (fontsize > 24) {
			DebugWindow.error("BoardText.js", "constructor", `fontsize cannot be greater than ${TILESIZE}.`);
		}

		(
			this.getElement().css({
				width: px(this.width),
				height: px(this.height),
				fontSize: px(fontsize),
				color: color,
			}) as HTMLElement
		).textContent = text;
	}
}
