'use strict';

class Board {
    constructor(color = '#070200') {
        this.boardCreated = false;

        this.boardDiv = create('div', 'board').css({
            width: px(WIDTH),
            height: px(HEIGHT),
            backgroundColor: color
        });

        if (WIDTH % COLUMNS !== 0) {
            DebugWindow.error('Board.js', 'constructor', 'Board width not divisible by 28.');
        } else if (HEIGHT % ROWS !== 0) {
            DebugWindow.error('Board.js', 'constructor', 'Board height not divisible by 36.');
        }

        if (!get('game')) {
            DebugWindow.error('Board.js', 'constructor', 'No #game element found.');
        } else {
            get('game').css({ backgroundColor: color });
            get('game').appendChild(this.boardDiv);
        }

        this.fetchBoardData('assets/json/board_walls.json').then((boardData) => {
            for (let element of boardData) {
                this.boardDiv.appendChild(create('div', element.id, element.classes).css({
                    width: px(TILESIZE * element.styles.width),
                    height: px(TILESIZE * element.styles.height),
                    top: px(TILESIZE * element.styles.top),
                    left: px(TILESIZE * element.styles.left),
                    borderTopLeftRadius: px(maybe(element.styles.borderTopLeftRadius, TILESIZE * 0.5)),
                    borderTopRightRadius: px(maybe(element.styles.borderTopRightRadius, TILESIZE * 0.5)),
                    borderBottomRightRadius: px(maybe(element.styles.borderBottomRightRadius, TILESIZE * 0.5)),
                    borderBottomLeftRadius: px(maybe(element.styles.borderBottomLeftRadius, TILESIZE * 0.5)),
                    borderTop: element.styles.borderTop == 'none' ? 'none' : null,
                    borderRight: element.styles.borderRight == 'none' ? 'none' : null,
                    borderBottom: element.styles.borderBottom == 'none' ? 'none' : null,
                    borderLeft: element.styles.borderLeft == 'none' ? 'none' : null
                }));
            }

            get('middle-cover').css({
                backgroundColor: color
            });

            this.boardCreated = true;
        }).then(() => {
            return this.paths();
        }, (reason) => {
            DebugWindow.error('Board.js', 'constructor', `Could not fetch path data due to '${reason}'.`);
        }).then(() => {
            this.createMainGameObjects();
            this.grid();
        }).catch((error) => {
            DebugWindow.error('Board.js', 'constructor', `Could not fetch wall data due to '${error.message}'.`);
        });
    }

    centerX(tileX) {
        return (TILESIZE * tileX) - (TILESIZE * 0.5);
    }

    centerY(tileY) {
        return (TILESIZE * ((ROWS - tileY) + 1)) - (TILESIZE * 0.5);
    }

    fetchBoardData(filename) {
        return fetch(filename).then((response) => {
            return response.json();
        }).then((body) => {
            if (!body) {
                throw new Error('JSON response body is empty.');
            } else {
                return body;
            }
        }).catch((error) => {
            DebugWindow.error('Board.js', 'fetchBoardData', `'${error.message}' while fetching data in ${filename}.`);
        });
    }

    placeGameObject(gameObject, offsetX, offsetY) {
        if (!gameObject instanceof GameObject) {
            DebugWindow.error('Board.js', 'placeGameObject', 'gameObject is not an actual instance of GameObject.');
        }

        if (offsetX > 28) {
            DebugWindow.error('Board.js', 'placeGameObject', 'offsetX value is above 28.');
        } else if (offsetX < 0) {
            DebugWindow.error('Board.js', 'placeGameObject', 'offsetX value is below 0.');
        } else if (offsetY > 36) {
            DebugWindow.error('Board.js', 'placeGameObject', 'offsetY value is above 36.');
        } else if (offsetY < 0) {
            DebugWindow.error('Board.js', 'placeGameObject', 'offsetY value is below 0.');
        }

        this.boardDiv.appendChild(gameObject.getElement().css({
            left: px(TILESIZE * offsetX - gameObject.getWidth()),
            bottom: px(TILESIZE * offsetY - gameObject.getHeight())
        }));
    }

    createMainGameObjects() {
        this.placeGameObject(new PacMan('pac-man', 'assets/images/pacman-frame-1.png'), 15, 10.25);
    }

    grid() {
        if (!this.boardCreated) {
            DebugWindow.error('Board.js', 'grid', 'Board not fully created yet.');
        }
        
        for (let i = COLUMNS, left = 0; i >= 1; i--, left += TILESIZE) {
            this.placeGameObject(new BoardText(`grid-vert-num-${i}`, i, TILESIZE * 0.75), i, 0);

            this.boardDiv.appendChild(create('div', null, 'grid-vert').css({
                left: px(left),
                height: px(HEIGHT + TILESIZE)
            }));
        }

        for (let i = ROWS, top = 0; i >= 1; i--, top += TILESIZE) {
            this.placeGameObject(new BoardText(`grid-horiz-num-${i}`, i, TILESIZE * 0.75), 0, i);
            
            this.boardDiv.appendChild(create('div', null, 'grid-horiz').css({
                left: px(- TILESIZE),
                top: px(top + TILESIZE),
                width: px(WIDTH + TILESIZE)
            }));
        }
    }

    paths() {
        return this.fetchBoardData('assets/json/paths.json').then((boardData) => {
            let nodePositions = [];

            for (let [index, position] of Object.entries(boardData.nodes)) {
                this.placeGameObject(new PathNode(`pathnode-${index}`), position.x, position.y);
                nodePositions.push([this.centerX(position.x), this.centerY(position.y)]);
            }

            for (let [index, line] of Object.entries(boardData.lines)) {
                for (let node of line.to) {
                    let width = nodePositions[node][0] - nodePositions[line.index][0];
                    let height = nodePositions[node][1] - nodePositions[line.index][1];

                    let lineElement = create('div', `pathline-${index}`, 'path-line').css({
                        left: px(nodePositions[line.index][0]),
                        top: px(nodePositions[line.index][1]),
                        width: px(width < 1 ? 1 : width),
                        height: px(height < 1 ? 1 : height),
                    });

                    this.boardDiv.appendChild(lineElement);
                }
            }
        });
    }
}