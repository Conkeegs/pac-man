"use strict";

export const COLUMNS: 28 = 28;
export const ROWS: 36 = 36;

export const DEBUG: boolean = false;

export const GAMEOBJECTS: string[] = [];

let match = window.matchMedia("(min-width: 720px)");

export const HEIGHT: number = match.matches ? 864 : 576;
export const WIDTH: number = match.matches ? 672 : 448;

export const TILESIZE: number = WIDTH / COLUMNS;
