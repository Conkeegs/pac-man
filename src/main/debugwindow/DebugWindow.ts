"use strict";

import { DEBUG } from "../utils/Globals.js";
import { get } from "../utils/Utils.js";

export default class DebugWindow {
	static error(filename: string, method: string, reason: string) {
		if (DEBUG) {
			console.error(`Error in ${filename} -- ${method}(): ${reason}`);

			get("game")!.innerHTML = "";
			stop();
		}
	}
}
