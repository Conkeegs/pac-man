'use strict';

import { exists } from "src/main/utils/Utils";
import Character from "./Character";
import MovementDirection from "./MovementDirection";

export default class PacMan extends Character {
    private lastMoveCode: MovementDirection | null = null;
    private moveCodes = {
        ArrowLeft: MovementDirection.LEFT,
        ArrowRight: MovementDirection.RIGHT,
        ArrowUp: MovementDirection.UP,
        ArrowDown: MovementDirection.DOWN,
        Space: MovementDirection.STOP
    };

    constructor(name: string, source: string) {
        super(name, source);

        this.#createMoveEventListeners();
    }

    #createMoveEventListeners() {
        document.body.addEventListener('keydown', (event) => {
            event.stopImmediatePropagation();

            let moveCode = this.moveCodes[event.code as keyof typeof this.moveCodes];

            if (moveCode == 4 && this.isMoving()) {
                this.stopMoving();
                return;
            }

            if (exists(moveCode) && (!this.isMoving() || this.lastMoveCode !== moveCode)) {
                this.startMoving(moveCode);
                this.lastMoveCode = moveCode;
            }
        });
    }
}