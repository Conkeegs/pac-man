'use strict';

class Board {
    constructor(color = '#070200') {
        let board = create('div', 'game-board').css({ backgroundColor: color });

        if (!get('game')) {
            DebugWindow.error('Board.js', 'constructor', 'No #game element found.');
        } else {
            get('game').css({ backgroundColor: color });
            get('game').appendChild(board);
        }

        this.boardDiv = get('game-board');
        [this.width, this.height] = this.boardDiv.trueDimensions();
        this.boardCreated = false;

        if (this.width % COLUMNS !== 0) {
            DebugWindow.error('Board.js', 'constructor', 'Board width not divisible by 28.');
        } else if (this.height % ROWS !== 0) {
            DebugWindow.error('Board.js', 'constructor', 'Board height not divisible by 36.');
        }

        this.tileSize = this.width / COLUMNS;

        this.fetchBoardData('assets/json/board_data.json').then((boardData) => {
            for (let element of boardData) {
                this.boardDiv.appendChild(create('div', element.id, element.classes).css({
                    width: px(this.tileSize * element.tileOffsets.width),
                    height: px(this.tileSize * element.tileOffsets.height),
                    top: px(this.tileSize * element.tileOffsets.top),
                    left: px(this.tileSize * element.tileOffsets.left)
                }));
            }

            get('middle-cover').css({
                backgroundColor: color
            });

            this.grid();

            this.boardCreated = true;
        }).catch((error) => {
            DebugWindow.error('Board.js', 'constructor', `Could not fetch board data due to ${error.message}.`);
        });
    }

    fetchBoardData(filename) {
        return fetch(filename, { credentials: 'same-origin' }).then((response) => {
            return response.json();
        }).then((body) => {
            if (!body) {
                throw new Error('JSON response body is empty.');
            } else {
                console.log(body);
                return body;
            }
        }).catch((error) => {
            DebugWindow.error('Board.js', 'fetchBoardData', `'${error.message}' while fetching data in ${filename}.`);
        });
    }

    placeGameObject(gameObject, tileNumX, tileNumY) {
        if (!gameObject instanceof GameObject) {
            DebugWindow.error('Board.js', 'placeInTile', 'gameObject is not an actual instance of GameObject.');
        }

        if (tileNumX > 28) {
            DebugWindow.error('Board.js', 'placeInTile', 'tileNumX value is above 28.');
        } else if (tileNumX < 0) {
            DebugWindow.error('Board.js', 'placeInTile', 'tileNumX value is below 0.');
        } else if (tileNumY > 36) {
            DebugWindow.error('Board.js', 'placeInTile', 'tileNumY value is above 36.');
        } else if (tileNumY < 0) {
            DebugWindow.error('Board.js', 'placeInTile', 'tileNumY value is below 0.');
        }

        this.boardDiv.appendChild(gameObject.getElement().css({
            left: px(this.tileSize * tileNumX - gameObject.getWidth()),
            bottom: px(this.tileSize * tileNumY - gameObject.getHeight())
        }));
    }

    grid() {
        if (!this.boardCreated) {
            DebugWindow.error('Board.js', 'grid', 'Board not fully created yet.');
        }
        
        for (let i = COLUMNS, left = 0; i >= 1; i--, left += this.tileSize) {
            this.placeGameObject(new BoardText(i, DEFAULT, 14, `grid-vert-num-${i}`), i, 0);
            this.boardDiv.appendChild(create('div', DEFAULT, 'grid-vert').css({ left: px(left), height: px(this.height + this.tileSize) }));
        }

        for (let i = ROWS, top = 0; i >= 1; i--, top += this.tileSize) {
            this.placeGameObject(new BoardText(i, DEFAULT, 14, `grid-horiz-num-${i}`), 0, i);
            this.boardDiv.appendChild(create('div', DEFAULT, 'grid-horiz').css({ left: px(-this.tileSize), top: px(top + this.tileSize), width: px(this.width + this.tileSize) }));
        }
    }

    toggleDebug() {
        debug = true;
    }
}