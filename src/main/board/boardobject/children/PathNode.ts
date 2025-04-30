"use strict";

import { TILESIZE } from "../../../utils/Globals.js";
import { create, px } from "../../../utils/Utils.js";
import Board from "../../Board.js";
import { BoardObject } from "../BoardObject.js";

/**
 * Represents a circular node at each location on the board where characters can turn.
 */
export default class PathNode extends BoardObject {
	/**
	 * `PathNode`s' width and height in pixels.
	 */
	private static readonly PATHNODE_DIMENSIONS: number = TILESIZE;

	/**
	 * Creates a path node.
	 *
	 * @param name
	 * @param color the color of the path node
	 */
	constructor(name: string, color = "white") {
		super(name);

		this.setDimensions(PathNode.PATHNODE_DIMENSIONS, PathNode.PATHNODE_DIMENSIONS);

		const element: HTMLElement = this.getElement();
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
