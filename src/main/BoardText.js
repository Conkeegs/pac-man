'use strict';

class BoardText extends GameObject {
    constructor(text, color = null, fontsize = 24, name) {
        super(name);

        this.element.textContent = text;

        this.element.css({
            fontSize: px(fontsize ? fontsize : 24),
            color: color ? color : 'white',
        });

        this.text = text;
        this.color = color;
    }
}