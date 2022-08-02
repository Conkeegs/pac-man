'use strict'

class DebugWindow {
    static error(filename, method, reason) {
        if (debug) {
            console.error(`Error in ${filename} -- ${method}(): ${reason}`);

            stop();
        }
    }
}