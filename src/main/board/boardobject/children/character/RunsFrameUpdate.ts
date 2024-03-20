/**
 * Indicates that a class will update a `Character`'s state, every time its internal `requestAnimationFrame()` call updates.
 */
export default interface RunsFrameUpdate {
	/**
	 * Updates the character in a given frame. Returning `true` will break a character out of
	 * recursive `Character.move()` method calls.
	 */
	_runFrameUpdate(): boolean;
}
