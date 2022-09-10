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

            let moveCode = this.#moveCodes[event.code];

            if (moveCode == 4 && this.isMoving()) {
                this.stopMoving();
                return;
            }

            if (exists(moveCode) && (!this.isMoving() || this.#lastMoveCode !== moveCode)) {
                this.startMoving(moveCode);
                this.#lastMoveCode = moveCode;
            }
        });
    }
}