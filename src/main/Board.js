'use strict';

class Board {
    constructor(color = '#070200') {
        let board = create('div', 'game-board');

        board.style.backgroundColor = color;
        get('game').appendChild(board);

        this.boardDiv = get('game-board');

        this.#createBoard();
    }

    placeCharacter(character, x, y) {
        character.characterDiv.left = x + 'px';
        character.characterDic.top = y + 'px';

        this.boardDiv.appendChild(character.characterDiv);
    }

    #createBoard() {
        this.boardDiv.appendChild(create('div', 'teleport-wall-1', 'teleport-wall'));
        this.boardDiv.appendChild(create('div', 'teleport-wall-2', 'teleport-wall'));
        this.boardDiv.appendChild(create('div', 'teleport-wall-3', 'teleport-wall'));
        this.boardDiv.appendChild(create('div', 'teleport-wall-4', 'teleport-wall'));
        this.boardDiv.appendChild(create('div', 'main-square-top', 'main-square'));
        this.boardDiv.appendChild(create('div', 'main-square-bottom', 'main-square'));
        this.boardDiv.appendChild(create('div', 'main-square-cover'));
        this.boardDiv.appendChild(create('div', 'inner-wall-1', 'inner-wall inner-wall-square'));
        this.boardDiv.appendChild(create('div', 'inner-wall-2', 'inner-wall inner-wall-square'));
        this.boardDiv.appendChild(create('div', 'inner-wall-3', 'inner-wall inner-wall-tube'));
        this.boardDiv.appendChild(create('div', 'inner-wall-4', 'inner-wall inner-wall-square'));
        this.boardDiv.appendChild(create('div', 'inner-wall-5', 'inner-wall inner-wall-square'));
        this.boardDiv.appendChild(create('div', 'inner-wall-6', 'inner-wall inner-wall-tube'));
        this.boardDiv.appendChild(create('div', 'inner-wall-7', 'inner-wall inner-wall-tube'));
        this.boardDiv.appendChild(create('div', 'inner-wall-8', 'inner-wall inner-wall-tube'));
        this.boardDiv.appendChild(create('div', 'inner-wall-9', 'inner-wall inner-wall-tube'));
        this.boardDiv.appendChild(create('div', 'inner-wall-10', 'inner-wall inner-wall-tube'));

        this.boardDiv.appendChild(create('div', 'middle')); // <------------------------------- GET RID OF THIS
        this.boardDiv.appendChild(create('div', 'measure-up')); // <------------------------------- GET RID OF THIS
        this.boardDiv.appendChild(create('div', 'measure-down')); // <------------------------------- GET RID OF THIS
    }
}