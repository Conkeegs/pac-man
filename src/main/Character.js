'use strict';

class Character extends GameObject {
    source;
    width = TILESIZE + (TILESIZE * 0.5);
    height = TILESIZE + (TILESIZE * 0.5);
    animationFrameId;
    moving = false;
    moveDirections = {
        left: () => {
            this.getElement().css({
                left: `calc(${this.getElement().css('left')} - 1px)`
            });

            this.animationFrameId = requestAnimationFrame(this.moveDirections['left']);
        },
        right: () => {
            this.getElement().css({
                left: `calc(${this.getElement().css('left')} + 1px)`
            });

            this.animationFrameId = requestAnimationFrame(this.moveDirections['right']);
        },
        up: () => {
            this.getElement().css({
                bottom: `calc(${this.getElement().css('bottom')} + 1px)`
            });

            this.animationFrameId = requestAnimationFrame(this.moveDirections['up']);
        },
        down: () => {
            this.getElement().css({
                bottom: `calc(${this.getElement().css('bottom')} - 1px)`
            });

            this.animationFrameId = requestAnimationFrame(this.moveDirections['down']);
        },
        stop: () => {
            this.stopMoving();
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
        this.animationFrameId = requestAnimationFrame(this.moveDirections[direction]);
        this.moving = true;
    }

    stopMoving() {
        cancelAnimationFrame(this.animationFrameId);
        this.moving = false;

        return true;
    }
}