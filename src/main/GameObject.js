'use strict';

class GameObject {
    constructor(name) {
        if (!name) {
            DebugWindow.error('GameObject.js', 'constructor', 'GameObject must have a name.');
        } else if (gameObjects.includes(name)) {
            DebugWindow.error('GameObject.js', 'constructor', `A GameObject with the name '${name}' already exists.`);
        }

        gameObjects.push(name);

        this.element = create('div', name, 'game-object');
        this.name = name;
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