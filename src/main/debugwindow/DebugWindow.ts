"use strict";

import { DEBUG } from "../utils/Globals.js";
import { get } from "../utils/Utils.js";

/**
 * Represents the debug window that shows up next to the board when the `DEBUG` global flag is set.
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
		if (DEBUG) {
			console.error(`Error in ${filename} -- ${method}(): ${reason}`);

			get("game")!.innerHTML = "";

			stop();
		}
	}
}
