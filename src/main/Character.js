'use strict';

class Character extends GameObject {
    width = TILESIZE + (TILESIZE * 0.5);
    height = TILESIZE + (TILESIZE * 0.5);
    #animationFrameId;
    #moving = false;
    #turnData;
    #moveDirections = [
        (elapsedTime) => {
            return px(this.getElement().css({
                left: `calc(${this.getElement().css('left')} - ${px(0.088 * elapsedTime)})`
            }).css('left'));
        },
        (elapsedTime) => {
            return px(this.getElement().css({
                left: `calc(${this.getElement().css('left')} + ${px(0.088 * elapsedTime)})`
            }).css('left'));
        },
        (elapsedTime) => {
            return px(this.getElement().css({
                bottom: `calc(${this.getElement().css('bottom')} + ${px(0.088 * elapsedTime)})`
            }).css('bottom'));
        },
        (elapsedTime) => {
            return px(this.getElement().css({
                bottom: `calc(${this.getElement().css('bottom')} - ${px(0.088 * elapsedTime)})`
            }).css('bottom'));
        },
        () => {
            return this.stopMoving();
        }
    ];

    constructor(name, source) {
        super(name);

        this.getElement().css({
            width: px(this.width),
            height: px(this.height),
            backgroundImage: `url(${source})`
        });

        fetchJSON('assets/json/turns.json').then((turnData) => {
            for (let turn of turnData) {
                turn.x = Board.getOffsetLeft(turn.x);
                turn.y = Board.getOffsetTop(turn.y);
            }

            console.log(turnData);

            this.#turnData = turnData;
        });
    }

    isMoving() {
        return this.#moving;
    }

    startMoving(direction) {
        this.stopMoving();

        let lastAnimationTime = null;
        this.#animationFrameId = requestAnimationFrame((timeStamp) => this.#move(direction, lastAnimationTime, timeStamp));
        this.#moving = true;
    }

    #move(direction, lastAnimationTime, timeStamp) {
        if (lastAnimationTime === null) {
            lastAnimationTime = timeStamp;
        }

        let newPosition = this.#moveDirections[direction](timeStamp - lastAnimationTime);
        
        lastAnimationTime = timeStamp;
        this.#animationFrameId = requestAnimationFrame((timeStampNew) => this.#move(direction, lastAnimationTime, timeStampNew));
    }

    stopMoving() {
        cancelAnimationFrame(this.#animationFrameId);
        this.#moving = false;

        return false;
    }
}