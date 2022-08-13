'use strict';

class PacMan extends Character {
    #lastMoveCode;
    #moveCodes = {
        ArrowLeft: 0,
        ArrowRight: 1,
        ArrowUp: 2,
        ArrowDown: 3,
        Space: 4
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

            if ((!this.isMoving() || this.#lastMoveCode !== code) && exists(this.#moveCodes[code])) {
                this.stopMoving();
                this.startMoving(this.#moveCodes[code]);
                this.#lastMoveCode = code;
            }
        });
    }
}