'use strict';

import DebugWindow from "../debugwindow/DebugWindow";
import { COLUMNS, HEIGHT, ROWS, TILESIZE, WIDTH } from "../utils/Globals";
import { create, fetchJSON, get, maybe, px } from "../utils/Utils";
import { BoardObject } from "./boardobject/BoardObject";
import BoardText from "./boardobject/children/BoardText";
import PathNode from "./boardobject/children/PathNode";
import PacMan from "./boardobject/children/character/PacMan";

interface PathData {
    nodes: [
        {
            x: number,
            y: number
        }
    ],
    lines: [
        {
            startNode: number,
            to: number[]
        }
    ]
}

interface WallDataElement {
    id: string,
    classes: string[],
    styles: {
        width: number,
        height: number,
        top: number,
        left?: number,
        borderTopLeftRadius?: number,
        borderTopRightRadius?: number,
        borderBottomRightRadius?: number,
        borderBottomLeftRadius?: number
    }
}

export default class Board {
    private boardCreated = false;
    private boardDiv = create('div', 'board');

    constructor(color = '#070200') {
        if (WIDTH % COLUMNS !== 0) {
            DebugWindow.error('Board.js', 'constructor', 'Board width not divisible by 28.');
        } else if (HEIGHT % ROWS !== 0) {
            DebugWindow.error('Board.js', 'constructor', 'Board height not divisible by 36.');
        }

        this.boardDiv.css({
            width: px(WIDTH),
            height: px(HEIGHT),
            backgroundColor: color
        } as CSSStyleDeclaration);

        let game: HTMLElement | null = get('game');

        if (!game) {
            DebugWindow.error('Board.js', 'constructor', 'No #game element found.');
        } else {
            (game.css({ backgroundColor: color } as CSSStyleDeclaration) as HTMLElement).appendChild(this.boardDiv);
        }

        fetchJSON('assets/json/walls.json').then((wallData: WallDataElement[]) => {
            for (let element of wallData) {
                this.boardDiv.appendChild(create('div', element.id, element.classes).css({
                    width: px(Board.calcTileOffset(element.styles.width)),
                    height: px(Board.calcTileOffset(element.styles.height)),
                    top: px(Board.calcTileOffset(element.styles.top)),
                    left: px(Board.calcTileOffset(element.styles.left || 0)),
                    borderTopLeftRadius: px(maybe(element.styles.borderTopLeftRadius, Board.calcTileOffset(0.5)) as number),
                    borderTopRightRadius: px(maybe(element.styles.borderTopRightRadius, Board.calcTileOffset(0.5)) as number),
                    borderBottomRightRadius: px(maybe(element.styles.borderBottomRightRadius, Board.calcTileOffset(0.5)) as number),
                    borderBottomLeftRadius: px(maybe(element.styles.borderBottomLeftRadius, Board.calcTileOffset(0.5)) as number)
                } as CSSStyleDeclaration) as HTMLElement);
            }

            get('middle-cover')!.css({
                backgroundColor: color
            } as CSSStyleDeclaration);

            this.boardCreated = true;

            this.createMainBoardObjects();

            // debugging methods
            this.createGrid();
            this.createPaths();
        }).catch((error) => {
            DebugWindow.error('Board.js', 'constructor', `Could not fetch wall data due to '${error.message}'.`);
        });
    }

    static calcTileOffset(numTiles: number) {
        return (TILESIZE * numTiles);
    }

    #placeBoardObject(boardObject: BoardObject, tileX: number, tileY: number) {
        if (!(boardObject instanceof BoardObject)) {
            DebugWindow.error('Board.js', '#placeBoardObject', 'boardObject is not an actual instance of BoardObject.');
        }

        if (tileX > 28) {
            DebugWindow.error('Board.js', '#placeBoardObject', 'tileX value is above 28.');
        } else if (tileX < -1) {
            DebugWindow.error('Board.js', '#placeBoardObject', 'tileX value is below -1.');
        } else if (tileY > 36) {
            DebugWindow.error('Board.js', '#placeBoardObject', 'tileY value is above 36.');
        } else if (tileY < 0) {
            DebugWindow.error('Board.js', '#placeBoardObject', 'tileY value is below 0.');
        }

        this.boardDiv.appendChild(boardObject.getElement().css({
            left: px(Board.calcTileOffset(tileX) - TILESIZE),
            top: px((Board.calcTileOffset(ROWS) - Board.calcTileOffset(tileY)))
        } as CSSStyleDeclaration) as HTMLElement);
    }

    private createMainBoardObjects() {
        this.#placeBoardObject(new PacMan('pac-man', 'assets/images/pacman-frame-0.png'), 15, 10);
    }

    private createGrid() {
        if (!this.boardCreated) {
            DebugWindow.error('Board.js', 'grid', 'Board not fully created yet.');
        }

        for (let i = COLUMNS, left = 0; i >= 1; i--, left += TILESIZE) {
            this.#placeBoardObject(new BoardText(`grid-vert-num-${i}`, i.toString(), TILESIZE * 0.75), i, 0);

            this.boardDiv.appendChild(create('div', null, ['grid-vert', 'board-object']).css({
                left: px(left),
                height: px(HEIGHT + TILESIZE)
            } as CSSStyleDeclaration) as HTMLElement);
        }

        for (let i = ROWS, top = 0; i >= 1; i--, top += TILESIZE) {
            this.#placeBoardObject(new BoardText(`grid-horiz-num-${i}`, i.toString(), TILESIZE * 0.75), 0, i);

            this.boardDiv.appendChild(create('div', null, ['grid-horiz', 'board-object']).css({
                left: px(- TILESIZE),
                top: px(top + TILESIZE),
                width: px(WIDTH + TILESIZE)
            } as CSSStyleDeclaration) as HTMLElement);
        }
    }

    private createPaths() {
        return fetchJSON('assets/json/paths.json').then((pathData: PathData) => {
            let nodePositions: [number, number][] = [];
            let pathLineIndex = 0;

            for (let [index, position] of Object.entries(pathData.nodes)) {
                this.#placeBoardObject(new PathNode(`pathnode-${index}`), position.x, position.y);
                nodePositions.push([Board.calcTileOffset(position.x) + (TILESIZE / 2), Board.calcTileOffset(position.y) + (TILESIZE / 2)]);
            }

            for (let line of pathData.lines) {
                for (let endNode of line.to) {
                    let width = nodePositions[endNode]![0] - nodePositions[line.startNode]![0];
                    let height = nodePositions[endNode]![1] - nodePositions[line.startNode]![1];

                    this.boardDiv.appendChild(create('div', `pathline-${pathLineIndex++}`, ['path-line', 'board-object']).css({
                        width: px(width < 1 ? 1 : width),
                        height: px(height < 1 ? 1 : height),
                        top: px(nodePositions[line.startNode]![1]),
                        left: px(nodePositions[line.startNode]![0])
                    } as CSSStyleDeclaration) as HTMLElement);
                }
            }
        });
    }
}