import type { Animateable } from "../gameelement/mixins/Animateable.ts";
import { defined, px } from "../utils/Utils.ts";
import AssetRegistry from "./AssetRegistry.ts";

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
	 * The `Animateable` instance that this `SpriteSheetHandler` is handling the sprite sheet for.
	 */
	private animateable: Animateable;

	/**
	 * Width of game's sprite sheet.
	 */
	private readonly SPRITE_SHEET_WIDTH: 680 = 680;
	/**
	 * Height of game's sprite sheet.
	 */
	private readonly SPRITE_SHEET_HEIGHT: 248 = 248;

	constructor(animateable: Animateable) {
		this.animateable = animateable;
	}

	/**
	 * Sets the CSS `background-image` of this `SpriteSheetHandler`'s `Animateable` to the correct sprite, based on the
	 * given animation state index and the offsets and dimensions of the corresponding animation frame. If the given animation
	 * state index doesn't exist, it will set the CSS `background-image` to the "not-found" image.
	 *
	 * @param stateIndex the index of the animation state that we want to set the CSS `background-image` to
	 */
	public setSpriteImage(stateIndex: number): void {
		const animateable = this.animateable;
		const animationState = animateable._ANIMATION_STATE_SETS[animateable._currentAnimationSet]![stateIndex];
		const element = animateable.getElement();

		if (!defined(animationState)) {
			element.css({
				backgroundImage: `url(${AssetRegistry.getImageSrc("not-found")})`,
			});

			return;
		}

		const width = animationState.width;
		const height = animationState.height;
		// calculate scale factor based on varying dimensions of
		// game elements
		const scaleX = animateable.getWidth() / width;
		const scaleY = animateable.getHeight() / height;

		element.css({
			backgroundImage: `url(${AssetRegistry.getImageSrc("pacman")})`,
			backgroundPosition: `-${px(scaleX * animationState.x)} -${px(scaleY * animationState.y)}`,
			backgroundSize: `${px(this.SPRITE_SHEET_WIDTH * scaleX)} ${px(this.SPRITE_SHEET_HEIGHT * scaleY)}`,
		});
	}
}
