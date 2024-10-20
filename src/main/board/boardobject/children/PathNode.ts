"use strict";

import { TILESIZE } from "../../../utils/Globals.js";
import { create, px } from "../../../utils/Utils.js";
import Board from "../../Board.js";
import { BoardObject } from "../BoardObject.js";

/**
 * Represents a circular node at each location on the board where characters can turn.
 */
export default class PathNode extends BoardObject {
	public override readonly _width: number = TILESIZE;
	public override readonly _height: number = TILESIZE;

	/**
	 * Creates a path node.
	 *
	 * @param name
	 * @param color the color of the path node
	 */
	constructor(name: string, color = "white") {
		super(name);

		const element: HTMLElement = this.getElement();

		element.css({
			width: px(this._width),
			height: px(this._height),
		});

		const childDimensionsPixels = px(Board.calcTileOffset(0.5));

		element.appendChild(
			create({ name: "div", id: `${name}-node-element`, classes: ["node"] }).css({
				width: childDimensionsPixels,
				height: childDimensionsPixels,
				backgroundColor: color,
			}) as HTMLElement
		);
	}
}
