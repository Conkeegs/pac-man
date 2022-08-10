'use strict';

class Character extends GameObject {
    #width = TILESIZE + (TILESIZE * 0.5);
    #height = TILESIZE + (TILESIZE * 0.5);
    #animationFrameId;
    #moving = false;
    #moveDirections = {
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
            width: px(this.#width),
            height: px(this.#height),
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

        lastAnimationTime = timeStamp;
        this.#animationFrameId = requestAnimationFrame((timeStamp) => this.#move(direction, lastAnimationTime, timeStamp));
    }

    stopMoving() {
        cancelAnimationFrame(this.#animationFrameId);
        this.#moving = false;
        this.#lastAnimationTime = null;

        return true;
    }
}