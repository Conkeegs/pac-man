'use strict';

class PathNode extends GameObject {
    width = TILESIZE;
    height = TILESIZE;

    constructor(name, color = 'white') {
        super(name);

        let element = this.getElement();
        
        element.css({
            width: px(this.width),
            height: px(this.height),
        });

        element.appendChild(create('div', `${name}-node-element`, 'node').css({
            width: px(TILESIZE * 0.5),
            height: px(TILESIZE * 0.5),
            backgroundColor: color
        }));
    }
}