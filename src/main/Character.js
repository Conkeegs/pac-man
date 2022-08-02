'use strict';

class Character extends GameObject {
    constructor(source, name) {
        super(name);

        let characterDiv = create('div', 'game-character-' + name);

        characterDiv.css({ backgroundImage: source });

        this.source = source;
        this.characterDiv = characterDiv;
    }
}