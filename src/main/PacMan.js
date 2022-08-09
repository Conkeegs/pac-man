'use strict';

class PacMan extends Character {
    moveCodes = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
        Space: 'stop'
    };
    lastMoveCode;

    constructor(name, source) {
        super(name, source);

        this.createMoveEventListeners();
    }

    createMoveEventListeners() {
        document.body.addEventListener('keydown', (event) => {
            event.stopImmediatePropagation();

            let code = event.code;

            if (code === 'Space' && this.moving) {
                this.stopMoving();
                return;
            }

            if (!this.moving || this.lastMoveCode !== code) {
                this.stopMoving();
                this.startMoving(this.moveCodes[code]);
                this.lastMoveCode = code;
            }
        });
    }
}