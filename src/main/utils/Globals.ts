"use strict";

import type { BoardObject } from "../board/boardobject/BoardObject.js";

/**
 * The number of square columns on the board.
 */
export const COLUMNS: 28 = 28;
/**
 * The number of square rows on the board.
 */
export const ROWS: 36 = 36;

/**
 * Whether the game is in debug mode or not.
 */
export const DEBUG: boolean = false;

/**
 * An array of classes that extends the `BoardObject` class so we can add/remove them when needed,
 * and also check for duplicates since each of them have unique `name` properties.
 */
export const BOARDOBJECTS: BoardObject[] = [];

let match = window.matchMedia("(min-width: 720px)");

/**
 * The height of the board.
 */
export const HEIGHT: number = match.matches ? 864 : 576;
/**
 * The width of th board.
 */
export const WIDTH: number = match.matches ? 672 : 448;

/**
 * The size of the square tiles on the board, based on the `WIDTH` and `COLUMNS` globals.
 */
export const TILESIZE: number = WIDTH / COLUMNS;

export const CHARACTER_Z_INDEX: number = 0;
