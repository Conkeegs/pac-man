"use strict";

import { App } from "../App.js";

// positionSum = 0;
// positionCount = 0;
// frameSecondsSum = 0;
// frameCount = 0; properties on character class for framerate

// this.positionSum += this.speed! * millisToSeconds(timeStamp - lastAnimationTime);
// this.positionCount++;
// this.frameSecondsSum += millisToSeconds(timeStamp - lastAnimationTime); in if (lastAnimationTime) in Character class and "// this.frameCount++;" after setting lastAnimationTime

// private moveCodeWords = {
// 	[MovementDirection.LEFT]: "LEFT",
// 	[MovementDirection.RIGHT]: "RIGHT",
// 	[MovementDirection.UP]: "UP",
// 	[MovementDirection.DOWN]: "DOWN",
// };

/**
 * Represents the debug window that shows up next to the board when the `DEBUG` app flag is set.
 * It logs important information about the game.
 */
export default class DebugWindow {
	/**
	 * Logs information about a game-breaking error in the game's logic, empties the game's content in the DOM,
	 * and then stops script load in the browser.
	 *
	 * @param filename
	 * @param method
	 * @param reason
	 */
	static error(filename: string, method: string, reason: string) {
		if (App.DEBUG) {
			App.destroy();

			throw new Error(`Error in ${filename} -- ${method}(): ${reason}`);
		}
	}
}
