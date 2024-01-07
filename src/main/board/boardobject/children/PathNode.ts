"use strict";

import { TILESIZE } from "../../../utils/Globals.js";
import { create, px } from "../../../utils/Utils.js";
import { BoardObject } from "../BoardObject.js";

export default class PathNode extends BoardObject {
	public override width = TILESIZE;
	public override height = TILESIZE;

	constructor(name: string, color = "white") {
		super(name);

		const element: HTMLElement = this.getElement();

		element.css({
			width: px(this.width),
			height: px(this.height),
		});

		element.appendChild(
			create({ name: "div", id: `${name}-node-element`, classes: ["node"] }).css({
				width: px(TILESIZE * 0.5),
				height: px(TILESIZE * 0.5),
				backgroundColor: color,
			}) as HTMLElement
		);
	}
}
