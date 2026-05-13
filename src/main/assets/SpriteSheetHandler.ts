import type { GameElement } from "../gameelement/GameElement.ts";
import { px } from "../utils/Utils.ts";
import AssetRegistry from "./AssetRegistry.ts";

/**
 * Information provided to the sprite sheet handler so that it
 * can properly size/set the background image/sprite of a game element.
 */
export type SpriteSheetData = {
	/**
	 * The x offset of the sprite.
	 */
	x: number;
	/**
	 * The y offset of the sprite.
	 */
	y: number;
	/**
	 * The width of the sprite.
	 */
	width: number;
	/**
	 * The height of the sprite.
	 */
	height: number;
};

/**
 * Dimensions of every sprite on the sprite sheet.
 */
export const SPRITE_SHEET_TILE_DIMENSIONS: 16 = 16;

/**
 * Handles the logic behind loading/finding sprites for game elements by
 * taking into account an x and y offset and its width and height.
 */
export default class SpriteSheetHandler {
	/**
	 * The `GameElement` instance that this `SpriteSheetHandler` is handling the sprite sheet for.
	 */
	private gameElement: GameElement;

	/**
	 * Width of game's sprite sheet.
	 */
	private static readonly SPRITE_SHEET_WIDTH: 680 = 680;
	/**
	 * Height of game's sprite sheet.
	 */
	private static readonly SPRITE_SHEET_HEIGHT: 248 = 248;

	constructor(gameElement: GameElement) {
		this.gameElement = gameElement;
	}

	/**
	 * Sets the CSS `background-image` of this `SpriteSheetHandler`'s `GameElement` to the correct sprite.
	 *
	 * @param spriteSheetData data that determines location and dimensions of sprite
	 */
	public setSpriteImage(spriteSheetData: SpriteSheetData): void {
		const gameElement = this.gameElement;
		// calculate scale factor based on varying dimensions of
		// game elements
		const scaleX = gameElement.getWidth() / spriteSheetData.width;
		const scaleY = gameElement.getHeight() / spriteSheetData.width;

		gameElement.getElement().css({
			backgroundImage: `url(${AssetRegistry.getImageSrc("pacman")})`,
			backgroundPosition: `-${px(scaleX * spriteSheetData.x)} -${px(scaleY * spriteSheetData.y)}`,
			backgroundSize: `${px(SpriteSheetHandler.SPRITE_SHEET_WIDTH * scaleX)} ${px(SpriteSheetHandler.SPRITE_SHEET_HEIGHT * scaleY)}`,
		});
	}
}
