'use strict';

class Character extends GameObject {
    source;
    width = TILESIZE + (TILESIZE * 0.5);
    height = TILESIZE + (TILESIZE * 0.5);
    moveInterval;
    moving = false;

    constructor(name, source) {
        super(name);

        this.getElement().css({
            width: px(TILESIZE + (TILESIZE * 0.5)),
            height: px(TILESIZE + (TILESIZE * 0.5)),
            backgroundImage: `url(${source})`
        });

        this.source = source;
        this.width = TILESIZE + (TILESIZE * 0.5);
        this.height = TILESIZE + (TILESIZE * 0.5);
    }
}