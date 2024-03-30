import { TILESIZE } from "../../../utils/Globals.js";
import { create, px } from "../../../utils/Utils.js";
import { BoardObject } from "../BoardObject.js";
import type HasBoardObjectProperties from "../HasBoardObjectProperties.js";

/**
 * Represents food that PacMan collects
 */
export default class Food extends BoardObject implements HasBoardObjectProperties {
	public override readonly width: number = TILESIZE / 4;
	public override readonly height: number = TILESIZE / 4;
	/**
	 * The default background color of all food on the board.
	 */
	public static readonly BACKGROUND_COLOR: "#f4b899" = "#f4b899";

	/**
	 * Creates food that pacman eats.
	 *
	 * @param name
	 */
	constructor(name: string) {
		super(name);

		const element = this.element;

		element.css({
			width: px(TILESIZE),
			height: px(TILESIZE),
			backgroundColor: "transparent",
		});

		element
			.appendChild(
				create({
					name: "div",
					id: name,
					classes: ["food"],
				})
			)
			.css({
				width: px(this.width),
				height: px(this.height),
				backgroundColor: Food.BACKGROUND_COLOR,
			});
	}
}
