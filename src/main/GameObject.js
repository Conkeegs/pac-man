'use strict';

class GameObject {
    element;
    width;
    height;

    constructor(name) {
        if (!name) {
            DebugWindow.error('GameObject.js', 'constructor', 'GameObject must have a name.');
        } else if (gameObjects.includes(name)) {
            DebugWindow.error('GameObject.js', 'constructor', `A GameObject with the name '${name}' already exists.`);
        }

        gameObjects.push(name);

        this.element = create('div', name, 'game-object board-object');
    }

    getElement() {
        return this.element;
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }
}