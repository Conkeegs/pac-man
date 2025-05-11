import AssetRegistry from "../../../assets/AssetRegistry.js";
import { TILESIZE } from "../../../utils/Globals.js";
import { BoardObject } from "../BoardObject.js";
import MakeCollidable from "../mixins/collidable/Collidable.js";
import PacMan from "./character/PacMan.js";

/**
 * Represents food that PacMan collects.
 */
export default class Food extends MakeCollidable(BoardObject) {
	/**
	 * `Food`s' width and height in pixels.
	 */
	private static readonly FOOD_DIMENSIONS: number = TILESIZE / 4;
	/**
	 * Indicates which half of the "food-eat" sound the game is playing at a given moment in time. `true` for the first half,
	 * `false` for the second.
	 */
	private static audioFlag: true | false = false;

	public override canBeCollidedByTypes: string[] = [PacMan.name];
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

		this.setDimensions(Food.FOOD_DIMENSIONS, Food.FOOD_DIMENSIONS);

		const element = this.getElement();

		element.css({
			backgroundColor: Food.BACKGROUND_COLOR,
		});
	}

	/**
	 * @inheritdoc
	 */
	onCollision(): void {
		this.delete();

		// each time food is eaten, play the opposite half of the "foot-eat" sound
		const audioFlag = Food.audioFlag;
		const currentAudioElement =
			AssetRegistry.ASSET_LIST["audio"][`food-eat-${Number(audioFlag)}` as "food-eat-0" | "food-eat-1"];

		// play the current sound and then flip back to the opposite half
		currentAudioElement.play().then(() => {
			Food.audioFlag = !audioFlag;
			currentAudioElement.currentTime = 0;
		});
	}
}
