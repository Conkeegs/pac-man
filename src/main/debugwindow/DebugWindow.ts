'use strict'

import { DEBUG } from "../utils/Globals";
import { get } from "../utils/Utils";

export default class DebugWindow {
    static error(filename: string, method: string, reason: string) {
        if (DEBUG) {
            console.error(`Error in ${filename} -- ${method}(): ${reason}`);

            get('game')!.innerHTML = "";
            stop();
        }
    }
}