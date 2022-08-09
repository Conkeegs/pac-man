'use strict';

class BoardText extends GameObject {
    text;
    fontSize;
    color;
    width = TILESIZE;
    height = TILESIZE;

    constructor(name, text, fontsize = TILESIZE, color = 'white') {
        super(name);

        if (fontsize > 24) {
            DebugWindow.error('BoardText.js', 'constructor', `fontsize cannot be greater than ${TILESIZE}.`);
        }

        this.getElement().textContent = text;

        this.getElement().css({
            width: px(TILESIZE),
            height: px(TILESIZE),
            fontSize: px(fontsize),
            color: color,
        });

        this.text = text;
        this.fontSize = fontsize;
        this.color = color;
    }
}