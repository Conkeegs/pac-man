"use strict";

import { App } from "../App.js";
import JsonRegistry from "../assets/JsonRegistry.js";
import DebugWindow from "../debugwindow/DebugWindow.js";
import { BOARD_OBJECT_Z_INDEX, COLUMNS, HEIGHT, ROWS, TILESIZE, WIDTH } from "../utils/Globals.js";
import { create, exists, fetchJSON, get, px, uniqueId } from "../utils/Utils.js";
import { BoardObject } from "./boardobject/BoardObject.js";
import BoardText from "./boardobject/children/BoardText.js";
import PausePlayButton from "./boardobject/children/Button/PausePlayButton.js";
import Food from "./boardobject/children/Food.js";
import PathNode from "./boardobject/children/PathNode.js";
import Blinky from "./boardobject/children/character/Blinky.js";
import Clyde from "./boardobject/children/character/Clyde.js";
import Inky from "./boardobject/children/character/Inky.js";
import type MovementDirection from "./boardobject/children/character/MovementDirection.js";
import PacMan from "./boardobject/children/character/PacMan.js";
import Pinky from "./boardobject/children/character/Pinky.js";

/**
 * Represents the white lines between each "turn" node when in debug mode.
 */
interface PathData {
	/**
	 * Each circular node involved in connecting each line.
	 */
	nodes: [
		{
			/**
			 * The horizontal number of the tile the node is located at.
			 */
			x: number;
			/**
			 * The vertical number of the tile the node is located at.
			 */
			y: number;
		}
	];
	/**
	 * Each lines that connects to the circular nodes.
	 */
	lines: [
		{
			/**
			 * Indexes into the "nodes" array and represents the starting circular node that this line starts
			 * at.
			 */
			startNode: number;
			/**
			 * Collection of numbers that index into the "nodes" array to represent the ending circular nodes that this
			 * line ends at. Can be more than one since all circular nodes extend out to two other circular nodes.
			 */
			to: number[];
		}
	];
}

/**
 * Represents a board object's horizontal and vertical offsets on the board.
 */
export type Position = {
	/**
	 * The x position of this board object (offset from left side of board).
	 */
	x: number;
	/**
	 * The y position of this board object (offset from top of board)
	 */
	y: number;
};

/**
 * Represents a position on the board where a character is allowed to turn,
 * and also includes an array of `MovementDirection` values to tell the character
 * what directions it can turn when it reaches the given turn coordinates.
 */
export interface TurnData extends Position {
	/**
	 * The `x` position of the turn.
	 */
	x: number;
	/**
	 * The `y` position of the turn.
	 */
	y: number;
	/**
	 * The allowed `MovementDirection`s of the turn.
	 */
	directions: MovementDirection[];
}

/**
 * HTML-specific attribute data about every wall in the game.
 */
export interface WallDataElement {
	id: string;
	classes: string[];
	styles: {
		width: number;
		height: number;
		top: number;
		left?: number;
		borderTopLeftRadius?: number;
		borderTopRightRadius?: number;
		borderBottomRightRadius?: number;
		borderBottomLeftRadius?: number;
	};
}

/**
 * Information about locations of PacMan food on the board.
 */
export type FoodData = {
	/**
	 * The horizontal level of a row of food or the x-locations of multiple food dots.
	 */
	x: number | number[];
	/**
	 * The vertical level of a column of food or the y-locations of multiple food dots.
	 */
	y: number | number[];
};

/**
 * The board contains all the main elements in the game: characters, ghosts, items, etc.
 */
export default class Board {
	private static readonly PACMAN_SPAWN_X: 14.25 = 14.25;
	private static readonly PACMAN_SPAWN_Y: 9.25 = 9.25;
	private static readonly BLINKY_SPAWN_X: 14.25 = 14.25;
	private static readonly BLINKY_SPAWN_Y: 21.25 = 21.25;
	private static readonly INKY_SPAWN_X: 12.25 = 12.25;
	private static readonly INKY_SPAWN_Y: 18.25 = 18.25;
	private static readonly PINKY_SPAWN_X: 14.25 = 14.25;
	private static readonly PINKY_SPAWN_Y: 18.25 = 18.25;
	private static readonly CLYDE_SPAWN_X: 16.25 = 16.25;
	private static readonly CLYDE_SPAWN_Y: 18.25 = 18.25;

	/**
	 * The container of everything that the board holds.
	 */
	public boardDiv: HTMLDivElement = create({
		name: "div",
		id: "board",
	}) as HTMLDivElement;
	/**
	 * The default background color of the board.
	 */
	public static readonly BACKGROUND_COLOR: "#070200" = "#070200";
	/**
	 * Displays the current frames-per-second count of the app, in debug mode.
	 */
	public debug_fpsCounter: BoardText | undefined;
	/**
	 * Button used for playing/pausing the game in debug mode.
	 */
	public debug_pausePlayButton: PausePlayButton | undefined;
	/**
	 * Data telling characters where they are allowed to turn.
	 */
	public static turnData: TurnData[] | undefined;

	/**
	 * Creates the board.s
	 *
	 * @param color the background color of the board
	 */
	constructor(color = "#070200") {
		if (App.isRunning()) {
			App.destroy();
		}

		let game: HTMLElement | null = get("game");

		if (!exists(game)) {
			DebugWindow.error("Board.js", "constructor", "No #game element found.");
		}

		game = game!;

		game.removeAllChildren();

		if (WIDTH % COLUMNS !== 0) {
			DebugWindow.error("Board.js", "constructor", "Board width not divisible by 28.");
		} else if (HEIGHT % ROWS !== 0) {
			DebugWindow.error("Board.js", "constructor", "Board height not divisible by 36.");
		}

		this.boardDiv.css({
			width: px(WIDTH),
			height: px(HEIGHT),
			backgroundColor: color,
		});

		(game.css({ backgroundColor: color }) as HTMLElement).appendChild(this.boardDiv);

		// debugging methods
		// this.debug_createGrid();
		// this.createPaths();
	}

	/**
	 * Calculates an offset (in pixels) for a given number of square tiles by multiplying it by the game's current
	 * tile size.
	 *
	 * @param numTiles the number of square tiles to calculate an offset for
	 * @returns `TILESIZE` * `numTiles`
	 */
	static calcTileOffset(numTiles: number) {
		return TILESIZE * numTiles;
	}

	/**
	 * Takes a horizontal (x) tile number and calculates the offset in pixels (from the left) so that items
	 * can be positioned horizontally on the board correctly. Items get positioned against the
	 * left-most side of the destination tile, so we subtract the tile size from the total offset.
	 * For example, going to the second tile horizontally would look like: [][| ] where the "|" is
	 * the item to be placed and "[]" is a tile.
	 *
	 * @param tileX the horizontal tile number to calculate an offset for
	 * @returns the x position for the given tile number
	 */
	static calcTileOffsetX(tileX: number): number {
		return Board.calcTileOffset(tileX) - TILESIZE;
	}

	/**
	 * Takes a vertical (y) tile number and calculates the offset in pixels so that items
	 * can be positioned vertically on the board correctly. Items get positioned against the
	 * top-most side of the destination tile, so we subtract the tile size from the total offset.
	 *
	 * @param tileX the horizontal tile number to calculate an offset for
	 * @returns the x position for the given tile number
	 */
	static calcTileOffsetY(tileY: number): number {
		return Board.calcTileOffset(ROWS) - Board.calcTileOffset(tileY) - TILESIZE;
	}

	/**
	 * Calculates an integer tile number for a given horizontal offset on the board. Add `TILESIZE` to
	 * `xPixels` since each object on the board's x-position is marked by their left-most side, so for example,
	 * "5" tiles from the left would = 6th tile horizontally.
	 *
	 * @param xPixels the horizontal offset
	 * @returns integer tile number for a given horizontal offset
	 */
	static calcTileNumX(xPixels: number): number {
		return Math.floor((xPixels + TILESIZE) / TILESIZE);
	}

	/**
	 * Calculates an integer tile number for a given vertical offset on the board. Add `TILESIZE` to
	 * `yPixels` since each object on the board's y-position is marked by their top-most side, so for example,
	 * "5" tiles from the top would = 6the tile vertically.
	 *
	 * @param yPixels the vertical offset
	 * @returns integer tile number for a given vertical offset
	 */
	static calcTileNumY(yPixels: number): number {
		return Math.floor((Board.calcTileOffset(ROWS) - (yPixels + TILESIZE)) / TILESIZE);
	}

	/**
	 * Creates main objects on the board. This includes characters, items, and text.
	 */
	public async createMainBoardObjects(): Promise<void> {
		const foodPositions: Position[] = [];
		const foodData: FoodData[] = await fetchJSON(JsonRegistry.getJson("food"));

		// place all food on the board
		for (const data of foodData) {
			const x = data.x;

			if (!Array.isArray(x)) {
				const yValues = data.y as number[];

				for (let i = yValues[0] as number; i <= (yValues[1] as number); i++) {
					// make sure food isn't already at the current position prevent overlaps
					if (foodPositions.findIndex((position) => position.x === x && position.y === i) === -1) {
						this.placeBoardObject(new Food(`food-horiz-${uniqueId()}`), x, i);

						foodPositions.push({
							x,
							y: i,
						});
					}
				}
			} else {
				const xValues = data.x as number[];
				const y = data.y as number;

				for (let i = xValues[0] as number; i <= (xValues[1] as number); i++) {
					// make sure food isn't already at the current position prevent overlaps
					if (foodPositions.findIndex((position) => position.x === i && position.y === y) === -1) {
						this.placeBoardObject(new Food(`food-vert-${uniqueId()}`), i, y);

						foodPositions.push({
							x: i,
							y,
						});
					}
				}
			}
		}

		this.placeBoardObject(new PacMan(), Board.PACMAN_SPAWN_X, Board.PACMAN_SPAWN_Y);

		this.placeBoardObject(
			new Blinky(),
			// Board.BLINKY_SPAWN_X,
			// Board.BLINKY_SPAWN_Y
			Board.PACMAN_SPAWN_X,
			Board.BLINKY_SPAWN_Y
		);

		this.placeBoardObject(
			new Inky(),
			// Board.INKY_SPAWN_X,
			// Board.INKY_SPAWN_Y
			Board.PACMAN_SPAWN_X,
			Board.INKY_SPAWN_Y
		);

		this.placeBoardObject(
			new Pinky(),
			// Board.PINKY_SPAWN_X,
			// Board.PINKY_SPAWN_Y
			Board.PACMAN_SPAWN_X,
			Board.PINKY_SPAWN_Y
		);

		this.placeBoardObject(
			new Clyde(),
			// Board.CLYDE_SPAWN_X,
			// Board.CLYDE_SPAWN_Y
			Board.PACMAN_SPAWN_X,
			Board.CLYDE_SPAWN_Y
		);

		// display fps counter if in debug mode
		if (App.DEBUG) {
			this.debug_fpsCounter = new BoardText({
				name: "fps-counter",
				text: "FPS",
			});

			this.placeBoardObject(this.debug_fpsCounter, -5, 31);

			this.debug_pausePlayButton = new PausePlayButton("pause-play-button", "Pause");

			this.placeBoardObject(this.debug_pausePlayButton, 37, 31);
		}
	}

	/**
	 * Places a board object (characters, items, or text) at the given `x` and `y` tile offset.
	 *
	 * @param boardObject the board object to place
	 * @param tileX the horizontal offset of the board object
	 * @param tileY the vertical offset of the board object
	 */
	private placeBoardObject(boardObject: BoardObject, tileX: number, tileY: number) {
		// if (tileX > 28) {
		// 	DebugWindow.error("Board.js", "placeBoardObject", "tileX value is above 28.");
		// } else if (tileX < -1) {
		// 	DebugWindow.error("Board.js", "placeBoardObject", "tileX value is below -1.");
		// } else if (tileY > 36) {
		// 	DebugWindow.error("Board.js", "placeBoardObject", "tileY value is above 36.");
		// } else if (tileY < 0) {
		// 	DebugWindow.error("Board.js", "placeBoardObject", "tileY value is below 0.");
		// }

		const left = Board.calcTileOffsetX(tileX);
		const top = Board.calcTileOffsetY(tileY);

		boardObject.setPosition(
			{
				x: left,
				y: top,
			},
			{
				modifyCss: true,
				modifyTransform: false,
			}
		);
		boardObject.render();

		this.boardDiv.appendChild(boardObject.getElement());
	}

	/**
	 * Creates horizontal and vertical lines that form squares for each tile in debug mode.
	 */
	private debug_createGrid() {
		for (let i = COLUMNS, left = 0; i >= 1; i--, left += TILESIZE) {
			this.placeBoardObject(
				new BoardText({ name: `grid-vert-num-${i}`, text: i.toString(), vertical: true }),
				i,
				0
			);

			this.boardDiv.appendChild(
				create({ name: "div", classes: ["grid-vert"] }).css({
					left: px(left),
					height: px(HEIGHT + TILESIZE),
					zIndex: BOARD_OBJECT_Z_INDEX + 2,
				}) as HTMLElement
			);
		}

		for (let i = ROWS, top = 0; i >= 1; i--, top += TILESIZE) {
			// store as variable so we can use it to offset the text, based on the number of characters
			this.placeBoardObject(new BoardText({ name: `grid-horiz-num-${i}`, text: i.toString() }), 0, i);

			this.boardDiv.appendChild(
				create({ name: "div", classes: ["grid-horiz"] }).css({
					left: px(-TILESIZE),
					top: px(top + TILESIZE),
					width: px(WIDTH + TILESIZE),
					zIndex: BOARD_OBJECT_Z_INDEX + 2,
				}) as HTMLElement
			);
		}
	}

	/**
	 * Creates circular nodes at each corner where characters can turn and also draws lines that connect these circular nodes, in debug mode.
	 */
	private async debug_createPaths() {
		const pathData: PathData = await fetchJSON(JsonRegistry.getJson("paths"));

		const nodePositions: [number, number][] = [];
		let pathLineIndex = 0;

		for (let [index, position] of Object.entries(pathData.nodes)) {
			this.placeBoardObject(new PathNode(`pathnode-${index}`), position.x, position.y);

			nodePositions.push([
				Board.calcTileOffset(position.x) + Board.calcTileOffset(0.5),
				Board.calcTileOffset(position.y) + Board.calcTileOffset(0.5),
			]);
		}

		for (let line of pathData.lines) {
			const startNode = line.startNode;

			for (let endNode of line.to) {
				let width = Math.abs(nodePositions[endNode]![0] - nodePositions[startNode]![0]);
				let height = Math.abs(nodePositions[endNode]![1] - nodePositions[startNode]![1]);

				const heightLessThan1 = height < 1;

				this.boardDiv.appendChild(
					create({
						name: "div",
						id: `pathline-${pathLineIndex++}`,
						classes: ["path-line"],
					}).css({
						width: px(width < 1 ? 1 : width),
						height: px(heightLessThan1 ? 1 : height),
						bottom: px(nodePositions[startNode]![1] - (heightLessThan1 ? 0 : height)),
						left: px(nodePositions[startNode]![0] - TILESIZE),
					}) as HTMLElement
				);
			}
		}
	}
}
