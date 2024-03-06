"use strict";

import { TILESIZE } from "../../../utils/Globals.js";
import { create, px } from "../../../utils/Utils.js";
import Board from "../../Board.js";
import { BoardObject } from "../BoardObject.js";

/**
 * Represents a circular node at each location on the board where characters can turn.
 */
export default class PathNode extends BoardObject {
	public override readonly width = TILESIZE;
	public override readonly height = TILESIZE;

	/**
	 * Creates a path node.
	 *
	 * @param name
	 * @param color the color of the path node
	 */
	constructor(name: string, color = "white") {
		super(name);

		const element: HTMLElement = this.element;

		element.css({
			width: px(this.width),
			height: px(this.height),
		});

		element.appendChild(
			create({ name: "div", id: `${name}-node-element`, classes: ["node"] }).css({
				width: px(Board.calcTileOffset(0.5)),
				height: px(Board.calcTileOffset(0.5)),
				backgroundColor: color,
			}) as HTMLElement
		);
	}
}
