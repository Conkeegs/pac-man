import { TILESIZE } from "../../../utils/Globals.js";
import { create, px } from "../../../utils/Utils.js";
import { BoardObject, type Position } from "../BoardObject.js";
import type Collidable from "../Collidable.js";
import CollidableManager from "../CollidableManager.js";
import type HasBoardObjectProperties from "../HasBoardObjectProperties.js";

/**
 * Represents food that PacMan collects
 */
export default class Food extends BoardObject implements Collidable {
	_collidableManager: CollidableManager;

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

		this._collidableManager = new CollidableManager(this);

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

	public override setPosition(position: Position, options?: { modifyCss: boolean; modifyTransform: boolean }): void {
		this._collidableManager.updateTileKeys(position);

		super.setPosition(position, options);
	}

	public override setPositionX(x: number, options?: { modifyCss: boolean; modifyTransform: boolean }): void {
		this._collidableManager.updateTileKeys({
			x,
			y: this.getPosition()!.y,
		});

		super.setPositionX(x, options);
	}

	public override setPositionY(y: number, options?: { modifyCss: boolean; modifyTransform: boolean }): void {
		this._collidableManager.updateTileKeys({
			x: this.getPosition()!.x,
			y,
		});

		super.setPositionY(y, options);
	}

	/**
	 * Deletes this food object and makes sure that it's also removed from the collidables map.
	 */
	public override delete(): void {
		this._collidableManager.checkForCollidableAndRemove();

		super.delete();
	}
}
