import AudioRegistry from "../../../assets/AudioRegistry.js";
import { TILESIZE } from "../../../utils/Globals.js";
import { create, px } from "../../../utils/Utils.js";
import type { Position } from "../../Board.js";
import { BoardObject, type PositionSetOptions } from "../BoardObject.js";
import type Collidable from "../Collidable.js";
import CollidableManager from "../CollidableManager.js";
import PacMan from "./character/PacMan.js";

/**
 * Represents food that PacMan collects.
 */
export default class Food extends BoardObject implements Collidable {
	_collidableManager: CollidableManager;
	/**
	 * Indicates which half of the "food-eat" sound the game is playing at a given moment in time. `true` for the first half,
	 * `false` for the second.
	 */
	private static audioFlag: true | false = false;

	public canBeCollidedByTypes: string[] = [PacMan.name];
	public override readonly width: number = TILESIZE;
	public override readonly height: number = TILESIZE;
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
				width: px(this.width / 4),
				height: px(this.height / 4),
				backgroundColor: Food.BACKGROUND_COLOR,
			});
	}

	public override setPosition(position: Position, options?: PositionSetOptions): void {
		super.setPosition(position, options);

		this._collidableManager.updateTileKeys();
	}

	public override setPositionX(x: number, options?: PositionSetOptions): void {
		super.setPositionX(x, options);

		this._collidableManager.updateTileKeys();
	}

	public override setPositionY(y: number, options?: PositionSetOptions): void {
		super.setPositionY(y, options);

		this._collidableManager.updateTileKeys();
	}

	/**
	 * Deletes this food object and makes sure that it's also removed from the collidables map.
	 */
	public override delete(): void {
		this._collidableManager.checkForCollidableAndRemove();

		super.delete();
	}

	/**
	 * @inheritdoc
	 */
	_onCollision(): void {
		this.delete();

		// each time food is eaten, play the opposite half of the "foot-eat" sound
		const audioFlag = Food.audioFlag;
		const currentAudioElement =
			AudioRegistry.AUDIO_LIST[`food-eat-${Number(audioFlag)}` as "food-eat-0" | "food-eat-1"];

		// play the current sound and then flip back to the opposite half
		currentAudioElement.play().then(() => {
			Food.audioFlag = !audioFlag;
			currentAudioElement.currentTime = 0;
		});
	}
}
