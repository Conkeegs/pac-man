'use strict';

class Character extends GameObject {
    source;
    width = TILESIZE + (TILESIZE * 0.5);
    height = TILESIZE + (TILESIZE * 0.5);
    animationFrameId;
    moving = false;
    lastAnimationTime = null;
    elapsedAnimationTime = 0;
    moveDirections = {
        left: (elapsedTime) => {
            this.getElement().css({
                left: `calc(${this.getElement().css('left')} - ${px(0.088 * elapsedTime)})`
            });
        },
        right: (elapsedTime) => {
            this.getElement().css({
                left: `calc(${this.getElement().css('left')} + ${px(0.088 * elapsedTime)})`
            });
        },
        up: (elapsedTime) => {
            this.getElement().css({
                bottom: `calc(${this.getElement().css('bottom')} + ${px(0.088 * elapsedTime)})`
            });
        },
        down: (elapsedTime) => {
            this.getElement().css({
                bottom: `calc(${this.getElement().css('bottom')} - ${px(0.088 * elapsedTime)})`
            });
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
        this.animationFrameId = requestAnimationFrame((timeStamp) => this.#move(direction, timeStamp));

        this.moving = true;
    }

    #move(direction, timeStamp) {
        if (this.lastAnimationTime === null) {
            this.lastAnimationTime = timeStamp;
        }

        this.elapsedAnimationTime = timeStamp - this.lastAnimationTime;

        this.moveDirections[direction](this.elapsedAnimationTime);

        this.lastAnimationTime = timeStamp;
        this.animationFrameId = requestAnimationFrame((timeStamp) => this.#move(direction, timeStamp));
    }

    stopMoving() {
        cancelAnimationFrame(this.animationFrameId);
        this.moving = false;
        this.lastAnimationTime = null;

        return true;
    }
}