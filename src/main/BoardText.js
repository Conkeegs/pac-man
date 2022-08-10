'use strict';

class BoardText extends GameObject {
    width = TILESIZE;
    height = TILESIZE;

    constructor(name, text, fontsize = TILESIZE, color = 'white') {
        super(name);

        if (fontsize > 24) {
            DebugWindow.error('BoardText.js', 'constructor', `fontsize cannot be greater than ${TILESIZE}.`);
        }

        this.getElement().textContent = text;

        this.getElement().css({
            width: px(this.width),
            height: px(this.height),
            fontSize: px(fontsize),
            color: color,
        });
    }
}