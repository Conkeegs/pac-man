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
 * Smallest x-tile number that players can regularly play inside of.
 */
export const MIN_PLAYABLE_TILE_X: 2 = 2;
/**
 * Highest x-tile number that players can regularly play inside of.
 */
export const MAX_PLAYABLE_TILE_X: 27 = 27;
/**
 * Smallest y-tile number that players can regularly play inside of.
 */
export const MIN_PLAYABLE_TILE_Y: 3 = 3;
/**
 * Highest y-tile number that players can regularly play inside of.
 */
export const MAX_PLAYABLE_TILE_Y: 31 = 31;
/**
 * The calculated size of the square tiles on the board, based on the `WIDTH` and `COLUMNS` globals.
 */
export const TILESIZE: number = WIDTH / COLUMNS;
/**
 * The original arcade game's tile size in pixels.
 */
export const ORIGINAL_TILE_SIZE: 8 = 8;
