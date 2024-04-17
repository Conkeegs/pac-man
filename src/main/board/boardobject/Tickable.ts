/**
 * Indicates that a `BoardObject` will "tick" each frame of the game and update therefore itself every frame.
 */
export default interface Tickable {
	/**
	 * The number of frames this boardobject has been updating (separate from the total frames that
	 * the game has been running).
	 */
	_frameCount: number;

	/**
	 * Logic to call every frame for this boardobject.
	 *
	 * @param params 0 or more optional parameters to pass each tick
	 */
	tick(...params: any[]): void;
	/**
	 * Logic to call to make up for lost milliseconds each frame due to differing system deltaTimes.
	 *
	 * @param alpha used to perform a linear interpolation between this boardobject's last state and current
	 * state to get the current state to render
	 * @param extraParams 0 or more optional parameters to pass each interpolation
	 */
	interpolate(alpha: number, ...extraParams: any[]): void;
}
