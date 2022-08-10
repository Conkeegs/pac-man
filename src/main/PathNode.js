'use strict';

class PathNode extends GameObject {
    width = TILESIZE;
    height = TILESIZE;

    constructor(name, color = 'white') {
        super(name);
        
        this.getElement().css({
            width: px(this.width),
            height: px(this.height),
        });

        let nodeElement = create('div', `${name}-node-element`).css({
            width: px(TILESIZE * 0.5),
            height: px(TILESIZE * 0.5),
            borderRadius: '50%',
            backgroundColor: color
        });

        this.getElement().appendChild(nodeElement);
    }
}