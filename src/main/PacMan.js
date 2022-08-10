'use strict';

class PacMan extends Character {
    #lastMoveCode;
    #moveCodes = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
        Space: 'stop'
    };

    constructor(name, source) {
        super(name, source);

        this.#createMoveEventListeners();
    }

    #createMoveEventListeners() {
        document.body.addEventListener('keydown', (event) => {
            event.stopImmediatePropagation();

            let code = event.code;

            if (code === 'Space' && this.isMoving()) {
                this.stopMoving();
                return;
            }

            if ((!this.isMoving() || this.#lastMoveCode !== code) && code in this.#moveCodes) {
                this.stopMoving();
                this.startMoving(this.#moveCodes[code]);
                this.#lastMoveCode = code;
            }
        });
    }
}