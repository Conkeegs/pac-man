'use strict';

window.COLUMNS = 28;
window.ROWS = 36;

window.debug = false;

window.gameObjects = [];

let match = window.matchMedia('(min-width: 720px)');

if (match.matches) {
    window.WIDTH = 672;
    window.HEIGHT = 864;
} else {
    window.WIDTH = 448;
    window.HEIGHT = 576;
}

window.TILESIZE = WIDTH / COLUMNS;