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
                top: `calc(${this.getElement().css('top')} - ${px(0.088 * elapsedTime)})`
            }).css('top'));
        },
        (elapsedTime) => {
            return px(this.getElement().css({
                top: `calc(${this.getElement().css('top')} + ${px(0.088 * elapsedTime)})`
            }).css('top'));
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
                turn.x = Board.calcTileOffset(turn.x) + (TILESIZE / 2);
                turn.y = Board.calcTileOffset(turn.y) + (TILESIZE / 2);
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