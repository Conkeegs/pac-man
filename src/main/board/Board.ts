"use strict";

import Debugging from "../Debugging.js";
import AssetRegistry from "../assets/AssetRegistry.js";
import DebugWindow from "../debugwindow/DebugWindow.js";
import { GameElement, type Position } from "../gameelement/GameElement.js";
import { COLUMNS, HEIGHT, ROWS, TILESIZE, WIDTH } from "../utils/Globals.js";
import { create, exists, fetchJSON, get, maybe, px } from "../utils/Utils.js";
import { BoardObject } from "./boardobject/BoardObject.js";
import Teleporter from "./boardobject/children/Teleporter.js";
import Turn from "./boardobject/children/Turn.js";
import Blinky from "./boardobject/children/character/Blinky.js";
import Clyde from "./boardobject/children/character/Clyde.js";
import Inky from "./boardobject/children/character/Inky.js";
import PacMan from "./boardobject/children/character/PacMan.js";
import Pinky from "./boardobject/children/character/Pinky.js";
import MovementDirection from "./boardobject/children/moveable/MovementDirection.js";

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
 * Represents raw turn data from the `turns.json` file.
 */
interface TurnData {
	/**
	 * The `x` tile number of the turn.
	 */
	tileX: number;
	/**
	 * The `y` tile number of the turn.
	 */
	tileY: number;
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
export default class Board extends GameElement {
	/**
	 * The singleton-instance of the board.
	 */
	private static instance: Board | undefined;
	private static readonly DEFAULT_COLOR: "#070200" = "#070200";
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
	 * The turns on the board.
	 */
	private turnMap: Map<string, Turn> = new Map();

	/**
	 * The default background color of the board.
	 */
	public static readonly BACKGROUND_COLOR: "#070200" = "#070200";
	/**
	 * Total amount of food on the board.
	 */
	public static FOOD_COUNT: 244 = 244;

	/**
	 * Creates the singleton board instance.
	 */
	private constructor() {
		super("board", WIDTH, HEIGHT);

		// const app = App.getInstance();

		// if (app.isRunning()) {
		// 	app.destroy();
		// }
	}

	/**
	 * Get the singleton board instance.
	 *
	 * @returns the singleton board instance
	 */
	public static getInstance(): Board {
		return Board.instance || (Board.instance = new this());
	}

	/**
	 * Get the map of the board's turns.
	 *
	 * @returns map of the board's turns
	 */
	public getTurnMap(): Map<string, Turn> {
		return this.turnMap;
	}

	/**
	 * Creates the board and places the board's objects on it.
	 */
	public async create(): Promise<void> {
		let game: HTMLElement | null = get("game");

		// #!DEBUG
		if (Debugging.isEnabled()) {
			if (!exists(game)) {
				DebugWindow.error("Board.js", "constructor", "No #game element found.");
			}

			if (WIDTH % COLUMNS !== 0) {
				DebugWindow.error("Board.js", "constructor", "Board width not divisible by 28.");
			} else if (HEIGHT % ROWS !== 0) {
				DebugWindow.error("Board.js", "constructor", "Board height not divisible by 36.");
			}
		}
		// #!END_DEBUG

		game = game!;

		game.removeAllChildren();

		const DEFAULT_COLOR = Board.DEFAULT_COLOR;
		const element = this.getElement();

		element.css({
			backgroundColor: DEFAULT_COLOR,
		});
		(game.css({ backgroundColor: DEFAULT_COLOR }) as HTMLElement).appendChild(element);

		const wallDataElements = await this.loadWallElements();

		for (const wallDataElement of wallDataElements) {
			const wall = create({ name: "div", id: wallDataElement.id, classes: wallDataElement.classes }).css({
				width: px(Board.calcTileOffset(wallDataElement.styles.width)),
				height: px(Board.calcTileOffset(wallDataElement.styles.height)),
				top: px(Board.calcTileOffset(wallDataElement.styles.top)),
				left: px(Board.calcTileOffset(wallDataElement.styles.left || 0)),
				borderTopLeftRadius: px(
					maybe(wallDataElement.styles.borderTopLeftRadius, Board.calcTileOffset(0.5)) as number
				),
				borderTopRightRadius: px(
					maybe(wallDataElement.styles.borderTopRightRadius, Board.calcTileOffset(0.5)) as number
				),
				borderBottomRightRadius: px(
					maybe(wallDataElement.styles.borderBottomRightRadius, Board.calcTileOffset(0.5)) as number
				),
				borderBottomLeftRadius: px(
					maybe(wallDataElement.styles.borderBottomLeftRadius, Board.calcTileOffset(0.5)) as number
				),
			}) as HTMLElement;

			// make sure invisible walls that are outside of teleports display over characters so that it looks
			// like the character's "disappear" through them
			if (wall.classList.contains("teleport-cover")) {
				wall.css({
					zIndex: BoardObject.BOARD_OBJECT_Z_INDEX + 1,
				});
			}

			// display the walls of the game
			element.appendChild(wall);
		}

		// place BoardObject instances on board
		await this.createMainBoardObjects();

		get("middle-cover")!.css({
			backgroundColor: Board.BACKGROUND_COLOR,
		});
	}

	/**
	 * Calculates an offset (in pixels) for a given number of square tiles by multiplying it by the game's current
	 * tile size.
	 *
	 * @param numTiles the number of square tiles to calculate an offset for
	 * @returns `TILESIZE` * `numTiles`
	 */
	public static calcTileOffset(numTiles: number) {
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
	public static calcTileOffsetX(tileX: number): number {
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
	public static calcTileOffsetY(tileY: number): number {
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
	public static calcTileNumX(xPixels: number): number {
		return Math.floor((xPixels + TILESIZE) / TILESIZE);
	}

	/**
	 * Calculates an integer tile number for a given vertical offset on the board. Add `TILESIZE` to
	 * `yPixels` since each object on the board's y-position is marked by their top-most side, so for example,
	 * "5" tiles from the top would = 6th tile vertically.
	 *
	 * @param yPixels the vertical offset
	 * @returns integer tile number for a given vertical offset
	 */
	public static calcTileNumY(yPixels: number): number {
		return Math.ceil((Board.calcTileOffset(ROWS) - (yPixels + TILESIZE)) / TILESIZE);
	}

	/**
	 * Create a tile key for a `Position`. Useful for indexing into `Collidable` mapping.
	 *
	 * @returns formatted string of form `"x-y"` for the passed-in `position`
	 */
	public static tileKeyFromPosition(position: Position): string {
		return Board.createTileKey(Board.calcTileNumX(position.x), Board.calcTileNumY(position.y));
	}

	/**
	 * Returns a formatted string of form `"x-y"` for the passed-in x and y tile numbers.
	 *
	 * @param tileX horizontal x tile
	 * @param tileY vertical y tile
	 * @returns
	 */
	public static createTileKey(tileX: number, tileY: number): string {
		return `${tileX}-${tileY}`;
	}

	/**
	 * Given a position `position` and the two positions of the start and end of a line
	 * segment (`segmentPointA` and `segmentPointB` respectively), this will find the closest
	 * point along the line `[segmentPointA, segmentPointB]` to the reference point `position`.
	 *
	 * @param position reference point/position to measure distance from
	 * @param segmentPointA start of line segment
	 * @param segmentPointB end of line segment
	 * @returns closest point along the line `[segmentPointA, segmentPointB]` to the reference point `position`
	 */
	public static positionDistanceToLineSegment(
		position: Position,
		segmentPointA: Position,
		segmentPointB: Position
	): number {
		const positionX = position.x;
		const positionY = position.y;
		const segmentPointAX = segmentPointA.x;
		const segmentPointAY = segmentPointA.y;
		const segmentPointBX = segmentPointB.x;
		const segmentPointBY = segmentPointB.y;
		const vectorToPositionX = positionX - segmentPointAX;
		const vectorToPositionY = positionY - segmentPointAY;
		const deltaX = segmentPointBX - segmentPointAX;
		const deltaY = segmentPointBY - segmentPointAY;
		const dotProduct = vectorToPositionX * deltaX + vectorToPositionY * deltaY;
		const segmentLengthSquared = deltaX * deltaX + deltaY * deltaY;
		let projectionFactor = -1;

		// in case of 0 length line
		if (segmentLengthSquared != 0) {
			projectionFactor = dotProduct / segmentLengthSquared;
		}

		let closestX;
		let closestY;

		if (projectionFactor < 0) {
			closestX = segmentPointAX;
			closestY = segmentPointAY;
		} else if (projectionFactor > 1) {
			closestX = segmentPointBX;
			closestY = segmentPointBY;
		} else {
			closestX = segmentPointAX + projectionFactor * deltaX;
			closestY = segmentPointAY + projectionFactor * deltaY;
		}

		const distanceX = positionX - closestX;
		const distanceY = positionY - closestY;

		return Math.sqrt(distanceX * distanceX + distanceY * distanceY);
	}

	/**
	 * Creates main objects on the board. This includes characters, items, and text.
	 */
	public async createMainBoardObjects(): Promise<void> {
		await this.placeTurnBoardObjects();

		// const foodPositions: Position[] = [];
		// const foodData: FoodData[] = await fetchJSON(AssetRegistry.getJsonSrc("food"));

		// // place all food on the board
		// for (const data of foodData) {
		// 	const x = data.x;

		// 	if (!Array.isArray(x)) {
		// 		const yValues = data.y as number[];

		// 		for (let i = yValues[0] as number; i <= (yValues[1] as number); i++) {
		// 			// make sure food isn't already at the current position prevent overlaps
		// 			if (foodPositions.findIndex((position) => position.x === x && position.y === i) === -1) {
		// 				this.placeBoardObject(new Food(`food-horiz-${uniqueId()}`), x, i, true);

		// 				foodPositions.push({
		// 					x,
		// 					y: i,
		// 				});
		// 			}
		// 		}
		// 	} else {
		// 		const xValues = data.x as number[];
		// 		const y = data.y as number;

		// 		for (let i = xValues[0] as number; i <= (xValues[1] as number); i++) {
		// 			// make sure food isn't already at the current position prevent overlaps
		// 			if (foodPositions.findIndex((position) => position.x === i && position.y === y) === -1) {
		// 				this.placeBoardObject(new Food(`food-vert-${uniqueId()}`), i, y, true);

		// 				foodPositions.push({
		// 					x: i,
		// 					y,
		// 				});
		// 			}
		// 		}
		// 	}
		// }

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
			9,
			Board.PACMAN_SPAWN_Y
		);

		this.placeBoardObject(
			new Clyde(),
			// Board.CLYDE_SPAWN_X,
			// Board.CLYDE_SPAWN_Y
			Board.PACMAN_SPAWN_X,
			Board.CLYDE_SPAWN_Y
		);

		const leftTeleporter = new Teleporter("left-teleporter", MovementDirection.RIGHT);
		const rightTeleporter = new Teleporter("right-teleporter", MovementDirection.LEFT);

		leftTeleporter.link(rightTeleporter);
		rightTeleporter.link(leftTeleporter);
		this.placeBoardObject(leftTeleporter, -1.5, 18.25);
		this.placeBoardObject(rightTeleporter, 30.5, 18.25);
	}

	/**
	 * Destroys the board and the resources it's using.
	 */
	public override delete(): void {
		this.turnMap.clear();

		super.delete();
	}

	/**
	 * Places a board object (characters, items, or text) at the given `x` and `y` tile offset.
	 *
	 * @param boardObject the board object to place
	 * @param tileX the horizontal offset of the board object
	 * @param tileY the vertical offset of the board object
	 * @param center whether not not to center the board object in the tiles
	 */
	private placeBoardObject(boardObject: BoardObject, tileX: number, tileY: number, center?: boolean) {
		let left = Board.calcTileOffsetX(tileX);
		let top = Board.calcTileOffsetY(tileY);

		if (center) {
			const offset = TILESIZE / 2 - boardObject.getWidth() / 2;

			left += offset;
			top += offset;
		}

		boardObject.setPosition({
			x: left,
			y: top,
		});
		boardObject.render();

		this.getElement().appendChild(boardObject.getElement());
	}

	/**
	 * Create and store board's `Food` board objects.
	 */
	private async placeTurnBoardObjects(): Promise<void> {
		const turnData = await this.loadTurnData();

		for (let i = 0; i < turnData.length; i++) {
			const turn = turnData[i]!;
			const turnBoardObject = new Turn(`turn-${i}`, turn.directions);
			const tileX = turn.tileX;
			const tileY = turn.tileY;

			this.turnMap.set(Board.createTileKey(tileX, tileY), turnBoardObject);
			this.placeBoardObject(turnBoardObject, tileX, tileY, true);
		}
	}

	/**
	 * Load all board's turns into memory.
	 */
	private async loadTurnData(): Promise<TurnData[]> {
		// tell all moveables where they can turn
		return fetchJSON(AssetRegistry.getJsonSrc("turns"));
	}

	/**
	 * Load all board's walls into memory.
	 */
	private async loadWallElements(): Promise<WallDataElement[]> {
		return fetchJSON(AssetRegistry.getJsonSrc("walls"));
	}
}
