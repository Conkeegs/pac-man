"use strict";

import type { BoardObject } from "../board/boardobject/BoardObject.js";
import type Character from "../board/boardobject/children/character/Character.js";

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

/**
 * An array of classes that extends the `Character` class so we can add/remove them when needed.
 */
export const CHARACTERS: Character[] = [];

const match = window.matchMedia("(min-width: 720px)");

/**
 * The height of the board.
 */
export const HEIGHT: 864 | 576 = match.matches ? 864 : 576;
/**
 * The width of th board.
 */
export const WIDTH: 672 | 448 = match.matches ? 672 : 448;

/**
 * The size of the square tiles on the board, based on the `WIDTH` and `COLUMNS` globals.
 */
export const TILESIZE: number = WIDTH / COLUMNS;

/**
 * `z-index` CSS property of all `BoardObject` instances on the board.
 */
export const BOARD_OBJECT_Z_INDEX: 0 = 0;
