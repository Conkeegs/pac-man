'use strict';

import Board from "src/main/board/Board";
import { TILESIZE } from "src/main/utils/Globals";
import { fetchJSON, px } from "src/main/utils/Utils";
import { BoardObject } from "../../BoardObject";
import type MovementDirection from "./MovementDirection";

interface TurnData {
    x: number;
    y: number,
    directions: number[];
}

export default class Character extends BoardObject {
    public override width: number = TILESIZE + (TILESIZE * 0.5);
    public override height = TILESIZE + (TILESIZE * 0.5);
    private animationFrameId: number | null = null;
    private moving = false;
    // private turnData: object | null = null;

    private moveDirections: (((elapsedTime: number) => string | number | null) | (() => boolean))[] = [
        (elapsedTime) => {
            return px((this.getElement().css({
                left: `calc(${this.getElement().css('left')} - ${px(0.088 * elapsedTime)})`
            } as CSSStyleDeclaration) as HTMLElement).css('left') as string);
        },
        (elapsedTime) => {
            return px((this.getElement().css({
                left: `calc(${this.getElement().css('left')} + ${px(0.088 * elapsedTime)})`
            } as CSSStyleDeclaration) as HTMLElement).css('left') as string);
        },
        (elapsedTime) => {
            return px((this.getElement().css({
                top: `calc(${this.getElement().css('top')} - ${px(0.088 * elapsedTime)})`
            } as CSSStyleDeclaration) as HTMLElement).css('top') as string);
        },
        (elapsedTime) => {
            return px((this.getElement().css({
                top: `calc(${this.getElement().css('top')} + ${px(0.088 * elapsedTime)})`
            } as CSSStyleDeclaration) as HTMLElement).css('top') as string);
        },
        () => {
            return this.stopMoving();
        }
    ];

    constructor(name: string, source: string) {
        super(name);

        this.getElement().css({
            width: px(this.width),
            height: px(this.height),
            backgroundImage: `url(${source})`
        } as CSSStyleDeclaration);

        fetchJSON('assets/json/turns.json').then((turnData: TurnData[]) => {
            for (let turn of turnData) {
                turn.x = Board.calcTileOffset(turn.x) + (TILESIZE / 2);
                turn.y = Board.calcTileOffset(turn.y) + (TILESIZE / 2);
            }

            console.log(turnData);

            // this.turnData = turnData;
        });
    }

    public isMoving() {
        return this.moving;
    }

    public startMoving(direction: MovementDirection) {
        this.stopMoving();

        let lastAnimationTime: null | number = null;

        this.animationFrameId = requestAnimationFrame((timeStamp) => this.move(direction, lastAnimationTime, timeStamp));
        this.moving = true;
    }

    private move(direction: MovementDirection, lastAnimationTime: null | number, timeStamp: number) {
        if (lastAnimationTime === null) {
            lastAnimationTime = timeStamp;
        }

        // let newPosition: string | number | null = (this.moveDirections[direction] as (((elapsedTime: number) => string | number | null)))(timeStamp - lastAnimationTime);

        lastAnimationTime = timeStamp;
        this.animationFrameId = requestAnimationFrame((timeStampNew) => this.move(direction, lastAnimationTime, timeStampNew));
    }

    public stopMoving() {
        cancelAnimationFrame(this.animationFrameId as number);
        this.moving = false;

        return false;
    }
}