/**
 * Indicates that a class will implement logic for serving file names for a character's different animation-related
 * images.
 */
export default interface UpdatesAnimationState {
	/**
	 * The maximum number of different animation states this character can be in.
	 */
	_MAX_ANIMATION_FRAMES: number;
	/**
	 * The current animation frame this character is on.
	 */
	_animationFrame: number;

	/**
	 * Returns the name of an animation-related image for the character.
	 */
	_getAnimationImage(): string;
}
