import Character from "./Character.js";
import type UpdatesAnimationState from "./UpdatesAnimationState.js";

/**
 * Represents any of the four ghosts on the board.
 */
export default abstract class Ghost extends Character implements UpdatesAnimationState {
	readonly _MAX_ANIMATION_FRAMES: 2 = 2;
	_animationFrame: number = 0;
	readonly _ANIMATION_STATE_MILLIS: 100 = 100;

	/**
	 * Creates a `Ghost`.
	 *
	 * @param name
	 * @param speed
	 * @param source
	 */
	constructor(name: string, speed: number, source: string) {
		super(name, speed, source);

		this.element.classList.add("ghost");
	}

	/**
	 * Gets the name of the image file relating to this ghost's current animation frame and direction.
	 *
	 * @returns the name of the image file relating to this ghost's current animation frame and direction
	 */
	override _getAnimationImage(): string {
		this._animationFrame++;

		if (this._animationFrame === this._MAX_ANIMATION_FRAMES) {
			this._animationFrame = 0;
		}

		return `${this.name}-${this._animationFrame}-${this.currentDirection}`;
	}
}
