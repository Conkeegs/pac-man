'use strict';

class Board {
    constructor(color = '#070200') {
        let board = document.createElement('div');

        board.style.backgroundColor = color;
        board.id = 'game-board';
        
        document.getElementById('game').appendChild(board);

        this.boardDiv = document.getElementById('game-board');
    }

    placeCharacter(character, x, y) {
        this.boardDiv.appendChild(character.characterDiv);
        
        let placedCharacter = document.getElementById(character.characterDiv.id);
    }
}