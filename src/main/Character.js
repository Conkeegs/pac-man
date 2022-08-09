'use strict';

class Character extends GameObject {
    source;
    width = TILESIZE + (TILESIZE * 0.5);
    height = TILESIZE + (TILESIZE * 0.5);
    moveInterval;
    moving = false;
    moveDirections = {
        left: () => {
            this.moveInterval = setInterval(() => {
                this.getElement().css({
                    left: `calc(${this.getElement().css('left')} - 1px)`
                })
            })
        },
        right: () => {
            this.moveInterval = setInterval(() => {
                this.getElement().css({
                    left: `calc(${this.getElement().css('left')} + 1px)`
                })
            })
        },
        up: () => {
            this.moveInterval = setInterval(() => {
                this.getElement().css({
                    bottom: `calc(${this.getElement().css('bottom')} + 1px)`
                });
            })
        },
        down: () => {
            this.moveInterval = setInterval(() => {
                this.getElement().css({
                    bottom: `calc(${this.getElement().css('bottom')} - 1px)`
                })
            })
        },
        stop: () => {
            this.stopMoving()
        }
    };

    constructor(name, source) {
        super(name);

        this.getElement().css({
            width: px(TILESIZE + (TILESIZE * 0.5)),
            height: px(TILESIZE + (TILESIZE * 0.5)),
            backgroundImage: `url(${source})`
        });

        this.source = source;
    }

    startMoving(direction) {
        this.moving = true;
        this.moveDirections[direction]();
    }

    stopMoving() {
        this.moving = false;
        clearInterval(this.moveInterval);
        return true;
    }
}