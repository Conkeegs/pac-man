'use strict';

class Character extends GameObject {
    width = TILESIZE + (TILESIZE * 0.5);
    height = TILESIZE + (TILESIZE * 0.5);
    #animationFrameId;
    #moving = false;
    #moveDirections = [
        (elapsedTime) => {
            this.getElement().css({
                left: `calc(${this.getElement().css('left')} - ${px(0.088 * elapsedTime)})`
            });
        },
        (elapsedTime) => {
            this.getElement().css({
                left: `calc(${this.getElement().css('left')} + ${px(0.088 * elapsedTime)})`
            });
        },
        (elapsedTime) => {
            this.getElement().css({
                bottom: `calc(${this.getElement().css('bottom')} + ${px(0.088 * elapsedTime)})`
            });
        },
        (elapsedTime) => {
            this.getElement().css({
                bottom: `calc(${this.getElement().css('bottom')} - ${px(0.088 * elapsedTime)})`
            });
        },
        () => {
            this.stopMoving();
        }
    ];

    constructor(name, source) {
        super(name);

        this.getElement().css({
            width: px(this.width),
            height: px(this.height),
            backgroundImage: `url(${source})`
        });
    }

    isMoving() {
        return this.#moving;
    }

    startMoving(direction) {
        let lastAnimationTime = null;
        this.#animationFrameId = requestAnimationFrame((timeStamp) => this.#move(direction, lastAnimationTime, timeStamp));
        this.#moving = true;
    }

    #move(direction, lastAnimationTime, timeStamp) {
        if (lastAnimationTime === null) {
            lastAnimationTime = timeStamp;
        }

        this.#moveDirections[direction](timeStamp - lastAnimationTime);

        this.#animationFrameId = requestAnimationFrame((timeStampNew) => this.#move(direction, lastAnimationTime, timeStampNew));
        lastAnimationTime = timeStamp;
    }

    stopMoving() {
        cancelAnimationFrame(this.#animationFrameId);
        this.#moving = false;

        return true;
    }
}