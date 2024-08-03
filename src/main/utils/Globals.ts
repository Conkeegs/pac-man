"use strict";

import type { BoardObject } from "../board/boardobject/BoardObject.js";
import type Collidable from "../board/boardobject/Collidable.js";
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
 * An array of classes that extends the `BoardObject` class so we can add/remove them when needed,
 * and also check for duplicates since each of them have unique `name` properties.
 */
export const BOARDOBJECTS: BoardObject[] = [];

/**
 * An array of classes that extends the `Character` class so we can add/remove them when needed.
 */
export const CHARACTERS: Character[] = [];

/**
 * A map of `BoardObject` classes that implement the `Collidable` interface so we can add/remove them when needed,
 * and make sure collision detection for characters is optimized into "groups".
 */
export const COLLIDABLES_MAP: { [key: string]: Collidable[] } = {};

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

/**
 * The original arcade game's tile size in pixels.
 */
export const ORIGINAL_TILE_SIZE: 8 = 8;

export const CLIP_PATH_PIXEL_PADDING: 4 = 4;

export const PACMAN_COLOR: "#ffeb3b" = "#ffeb3b";
