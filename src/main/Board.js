'use strict';

class Board {
    #boardCreated = false;
    #boardDiv = create('div', 'board');

    constructor(color = '#070200') {
        if (WIDTH % COLUMNS !== 0) {
            DebugWindow.error('Board.js', 'constructor', 'Board width not divisible by 28.');
        } else if (HEIGHT % ROWS !== 0) {
            DebugWindow.error('Board.js', 'constructor', 'Board height not divisible by 36.');
        }

        this.#boardCreated = false;
        this.#boardDiv = create('div', 'board');

        this.#boardDiv.css({
            width: px(WIDTH),
            height: px(HEIGHT),
            backgroundColor: color
        });

        let game = get('game');

        if (!game) {
            DebugWindow.error('Board.js', 'constructor', 'No #game element found.');
        } else {
            game.css({ backgroundColor: color });
            game.appendChild(this.#boardDiv);
        }

        fetchJSON('assets/json/walls.json').then((wallData) => {
            for (let element of wallData) {
                this.#boardDiv.appendChild(create('div', element.id, element.classes).css({
                    width: px(TILESIZE * element.styles.width),
                    height: px(TILESIZE * element.styles.height),
                    top: px(TILESIZE * element.styles.top),
                    left: px(TILESIZE * element.styles.left),
                    borderTopLeftRadius: px(maybe(element.styles.borderTopLeftRadius, TILESIZE * 0.5)),
                    borderTopRightRadius: px(maybe(element.styles.borderTopRightRadius, TILESIZE * 0.5)),
                    borderBottomRightRadius: px(maybe(element.styles.borderBottomRightRadius, TILESIZE * 0.5)),
                    borderBottomLeftRadius: px(maybe(element.styles.borderBottomLeftRadius, TILESIZE * 0.5))
                }));
            }

            get('middle-cover').css({
                backgroundColor: color
            });

            this.#boardCreated = true;

            this.#createMainGameObjects();
            
            this.#createGrid();
            this.#createPaths();
        }).catch((error) => {
            DebugWindow.error('Board.js', 'constructor', `Could not fetch wall data due to '${error.message}'.`);
        });
    }

    getOffsetLeft(tileX) {
        return (TILESIZE * tileX) - (TILESIZE * 0.5);
    }

    getOffsetTop(tileY) {
        return (TILESIZE * ((ROWS - tileY) + 1)) - (TILESIZE * 0.5);
    }

    #placeGameObject(gameObject, tileX, tileY) {
        if (!gameObject instanceof GameObject) {
            DebugWindow.error('Board.js', '#placeGameObject', 'gameObject is not an actual instance of GameObject.');
        }

        if (tileX > 28) {
            DebugWindow.error('Board.js', '#placeGameObject', 'tileX value is above 28.');
        } else if (tileX < 0) {
            DebugWindow.error('Board.js', '#placeGameObject', 'tileX value is below 0.');
        } else if (tileY > 36) {
            DebugWindow.error('Board.js', '#placeGameObject', 'tileY value is above 36.');
        } else if (tileY < 0) {
            DebugWindow.error('Board.js', '#placeGameObject', 'tileY value is below 0.');
        }

        this.#boardDiv.appendChild(gameObject.getElement().css({
            left: px(TILESIZE * tileX - gameObject.getWidth()),
            bottom: px(TILESIZE * tileY - gameObject.getHeight())
        }));
    }

    #createMainGameObjects() {
        this.#placeGameObject(new PacMan('pac-man', 'assets/images/pacman-frame-0.png'), 15, 10.25);
    }

    #createGrid() {
        if (!this.#boardCreated) {
            DebugWindow.error('Board.js', 'grid', 'Board not fully created yet.');
        }
        
        for (let i = COLUMNS, left = 0; i >= 1; i--, left += TILESIZE) {
            this.#placeGameObject(new BoardText(`grid-vert-num-${i}`, i, TILESIZE * 0.75), i, 0);

            this.#boardDiv.appendChild(create('div', null, 'grid-vert board-object').css({
                left: px(left),
                height: px(HEIGHT + TILESIZE)
            }));
        }

        for (let i = ROWS, top = 0; i >= 1; i--, top += TILESIZE) {
            this.#placeGameObject(new BoardText(`grid-horiz-num-${i}`, i, TILESIZE * 0.75), 0, i);
            
            this.#boardDiv.appendChild(create('div', null, 'grid-horiz board-object').css({
                left: px(- TILESIZE),
                top: px(top + TILESIZE),
                width: px(WIDTH + TILESIZE)
            }));
        }
    }

    #createPaths() {
        return fetchJSON('assets/json/paths.json').then((pathData) => {
            let nodePositions = [];
            let pathLineIndex = 0;

            for (let [index, position] of Object.entries(pathData.nodes)) {
                this.#placeGameObject(new PathNode(`pathnode-${index}`), position.x, position.y);
                nodePositions.push([this.getOffsetLeft(position.x), this.getOffsetTop(position.y)]);
            }

            for (let line of pathData.lines) {
                for (let endNode of line.to) {
                    let width = nodePositions[endNode][0] - nodePositions[line.startNode][0];
                    let height = nodePositions[endNode][1] - nodePositions[line.startNode][1];

                    this.#boardDiv.appendChild(create('div', `pathline-${pathLineIndex++}`, 'path-line board-object').css({
                        width: px(width < 1 ? 1 : width),
                        height: px(height < 1 ? 1 : height),
                        top: px(nodePositions[line.startNode][1]),
                        left: px(nodePositions[line.startNode][0])
                    }));
                }
            }
        });
    }
}