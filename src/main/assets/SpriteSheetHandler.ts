import type { GameElement } from "../gameelement/GameElement.js";
import { px } from "../utils/Utils.js";
import AssetRegistry from "./AssetRegistry.js";

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
	public static readonly SPRITE_SHEET_WIDTH: 680 = 680;
	/**
	 * Height of game's sprite sheet.
	 */
	public static readonly SPRITE_SHEET_HEIGHT: 248 = 248;

	constructor(gameElement: GameElement) {
		this.gameElement = gameElement;
	}

	/**
	 * Sets the CSS `background-image` of this `SpriteSheetHandler`'s `GameElement` to the correct sprite.
	 *
	 * @param spriteSheetData data that determines location and dimensions of sprite
	 * @param options extra settings for how sprite image is rendered
	 */
	public setSpriteImage(
		spriteSheetData: SpriteSheetData,
		options?: {
			/**
			 * Pixel number to scale sprite's width by.
			 */
			scaleByWidth?: number;
			/**
			 * Pixel number to scale sprite's height by.
			 */
			scaleByHeight?: number;
			/**
			 * Pixels (from left) sprite's image should be offset.
			 */
			offsetX?: number;
			/**
			 * Pixels (from top) sprite's image should be offset.
			 */
			offsetY?: number;
		},
	): void {
		const gameElement = this.gameElement;
		// calculate scale factor based on varying dimensions of
		// game elements
		const scaleX = (options?.scaleByWidth ?? gameElement.getWidth()) / spriteSheetData.width;
		const scaleY = (options?.scaleByHeight ?? gameElement.getHeight()) / spriteSheetData.width;

		gameElement.getElement().css({
			backgroundImage: `url(${AssetRegistry.getImageSrc("pacman")})`,
			backgroundPosition: `${px((options?.offsetX ?? 0) - scaleX * spriteSheetData.x)} ${px((options?.offsetY ?? 0) - scaleY * spriteSheetData.y)}`,
			backgroundSize: `${px(SpriteSheetHandler.SPRITE_SHEET_WIDTH * scaleX)} ${px(SpriteSheetHandler.SPRITE_SHEET_HEIGHT * scaleY)}`,
		});
	}
}
