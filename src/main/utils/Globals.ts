"use strict";

const match = window.matchMedia("(min-width: 720px)");

/**
 * The calculated height of the board.
 */
export const HEIGHT: 864 | 576 = match.matches ? 864 : 576;
/**
 * The calculated width of the board.
 */
export const WIDTH: 672 | 448 = match.matches ? 672 : 448;
/**
 * The number of square columns on the board.
 */
export const COLUMNS: 28 = 28;
/**
 * The number of square rows on the board.
 */
export const ROWS: 36 = 36;
/**
 * The calculated size of the square tiles on the board, based on the `WIDTH` and `COLUMNS` globals.
 */
export const TILESIZE: number = WIDTH / COLUMNS;
/**
 * The original arcade game's tile size in pixels.
 */
export const ORIGINAL_TILE_SIZE: 8 = 8;
