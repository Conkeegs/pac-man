'use strict';

class PathNode extends GameObject {
    constructor(name, color = 'white') {
        super(name);
        
        this.getElement().css({
            width: px(TILESIZE),
            height: px(TILESIZE),
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