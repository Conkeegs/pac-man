'use strict';

class GameObject {
    constructor(name) {
        if (!name) {
            DebugWindow.error('GameObject.js', 'constructor', 'GameObject must have a name.');
        }

        let [boardWidth, boardHeight] = get('game-board').trueDimensions();
        let width = boardWidth / COLUMNS;
        let height = boardHeight / ROWS;

        this.element = create('div', DEFAULT, 'game-object');
        this.element.id = name;

        this.element.css({
            width: px(width),
            height: px(height)
        });

        if (this.element.css('width') !== this.element.css('height')) {
            DebugWindow.error('GameObject.js', 'constructor', 'GameObject element width and height do not match.');
        }

        this.name = name;
        this.width = width;
        this.height = height;
        this.type = this.element.classList[0];
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    getElement() {
        return this.element;
    }

    getType() {
        return this.type;
    }
}