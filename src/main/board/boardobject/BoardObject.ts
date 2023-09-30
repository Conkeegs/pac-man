'use strict';

import DebugWindow from "src/main/debugwindow/DebugWindow";
import { GAMEOBJECTS } from "src/main/utils/Globals";
import { create } from "src/main/utils/Utils";

export class BoardObject {
    private element: HTMLElement;

    protected width: number | null = null;
    protected height: number | null = null;

    constructor(name: string) {
        if (!name) {
            DebugWindow.error('GameObject.js', 'constructor', 'GameObject must have a name.');
        } else if (GAMEOBJECTS.includes(name)) {
            DebugWindow.error('GameObject.js', 'constructor', `A GameObject with the name '${name}' already exists.`);
        }

        GAMEOBJECTS.push(name);

        this.element = create('div', name, ['game-object', 'board-object']);
    }

    public getElement(): HTMLElement {
        return this.element;
    }

    public getWidth(): number | null {
        return this.width;
    }

    public getHeight(): number | null {
        return this.height;
    }
}