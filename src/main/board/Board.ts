"use strict";

import { App } from "../App.js";
import { GameElement, type Position } from "../GameElement.js";
import AssetRegistry from "../assets/AssetRegistry.js";
// #!DEBUG
import DebugWindow from "../debugwindow/DebugWindow.js";
import { COLUMNS, HEIGHT, ROWS, TILESIZE, WIDTH } from "../utils/Globals.js";
// #!END_DEBUG
import { create, exists, fetchJSON, get, maybe, px, uniqueId } from "../utils/Utils.js";
import { BoardObject } from "./boardobject/BoardObject.js";
import BoardText from "./boardobject/children/BoardText.js";
// #!DEBUG
import PausePlayButton from "./boardobject/children/Button/PausePlayButton.js";
import Food from "./boardobject/children/Food.js";
// #!END_DEBUG
import PathNode from "./boardobject/children/PathNode.js";
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
interface TurnData extends Position {
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
export default class Board extends GameElement {
	protected override readonly _width: number = WIDTH;
	protected override readonly _height: number = HEIGHT;

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
	 * The walls to display in the game.
	 */
	private wallElements: HTMLElement[] = [];
	/**
	 * The turns on the board.
	 */
	private turns: Turn[] = [];

	/**
	 * The default background color of the board.
	 */
	public static readonly BACKGROUND_COLOR: "#070200" = "#070200";
	/**
	 * Total amount of food on the board.
	 */
	public static FOOD_COUNT: 244 = 244;

	// #!DEBUG
	/**
	 * Displays the current frames-per-second count of the app, in debug mode.
	 */
	public debug_fpsCounter: BoardText | undefined;
	/**
	 * Button used for playing/pausing the game in debug mode.
	 */
	public debug_pausePlayButton: PausePlayButton | undefined;
	// #!END_DEBUG

	/**
	 * Creates the singleton board instance.
	 */
	private constructor() {
		super("board");

		if (App.isRunning()) {
			App.destroy();
		}
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
	 * Get all of the board's turns.
	 *
	 * @returns this board's turns
	 */
	public getTurns(): Turn[] {
		return Board.getInstance().turns;
	}

	/**
	 * Creates the board and places the board's objects on it.
	 */
	public async create(): Promise<void> {
		let game: HTMLElement | null = get("game");

		// #!DEBUG
		if (!exists(game)) {
			DebugWindow.error("Board.js", "constructor", "No #game element found.");
		}
		// #!END_DEBUG

		game = game!;

		game.removeAllChildren();

		// #!DEBUG
		if (WIDTH % COLUMNS !== 0) {
			DebugWindow.error("Board.js", "constructor", "Board width not divisible by 28.");
		} else if (HEIGHT % ROWS !== 0) {
			DebugWindow.error("Board.js", "constructor", "Board height not divisible by 36.");
		}
		// #!END_DEBUG

		const DEFAULT_COLOR = Board.DEFAULT_COLOR;
		const element = this.getElement();

		element.css({
			width: px(this.getWidth()),
			height: px(this.getHeight()),
			backgroundColor: DEFAULT_COLOR,
		});

		(game.css({ backgroundColor: DEFAULT_COLOR }) as HTMLElement).appendChild(element);

		// #!DEBUG
		// debugging methods
		this.debug_createGrid();
		// this.createPaths();
		// #!END_DEBUG

		await this.loadTurnData();
		await this.loadWallElements();

		// display the walls of the game
		for (const wallElement of this.wallElements) {
			element.appendChild(wallElement);
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
		const foodData: FoodData[] = await fetchJSON(AssetRegistry.getJsonSrc("food"));

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

		const leftTeleporter = new Teleporter("left-teleporter", MovementDirection.RIGHT);
		const rightTeleporter = new Teleporter("right-teleporter", MovementDirection.LEFT);

		leftTeleporter.link(rightTeleporter);
		rightTeleporter.link(leftTeleporter);
		this.placeBoardObject(leftTeleporter, -1.5, 18.25);
		this.placeBoardObject(rightTeleporter, 30.5, 18.25);

		// #!DEBUG
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
		// #!END_DEBUG
	}

	/**
	 * Destroys the board and the resources it's using.
	 */
	public override delete(): void {
		if (Board.instance) {
			Board.getInstance().getElement().remove();
		}

		this.turns = [];
		this.wallElements = [];
		Board.instance = undefined;

		super.delete();
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

		this.getElement().appendChild(boardObject.getElement());
	}

	/**
	 * Load all board's turns into memory.
	 */
	private async loadTurnData(): Promise<void> {
		// tell all moveables where they can turn
		return fetchJSON(AssetRegistry.getJsonSrc("turns")).then((turnData: TurnData[]) => {
			for (let turn of turnData) {
				const turnBoardObject = new Turn(`turn-${uniqueId()}`, turn.directions);

				this.turns.push(turnBoardObject);
				this.placeBoardObject(turnBoardObject, turn.x, turn.y);

				const turnPosition = turnBoardObject.getPosition();

				turnBoardObject.setPosition(
					{
						x: turnPosition.x + TILESIZE / 2 - turnBoardObject.getWidth() / 2,
						y: turnPosition.y + TILESIZE / 2 - turnBoardObject.getHeight() / 2,
					},
					{
						modifyTransform: true,
					}
				);
			}
		});
	}

	/**
	 * Load all board's walls into memory.
	 */
	private async loadWallElements(): Promise<void> {
		return fetchJSON(AssetRegistry.getJsonSrc("walls")).then((wallData: WallDataElement[]) => {
			for (let element of wallData) {
				const wall = create({ name: "div", id: element.id, classes: element.classes }).css({
					width: px(Board.calcTileOffset(element.styles.width)),
					height: px(Board.calcTileOffset(element.styles.height)),
					top: px(Board.calcTileOffset(element.styles.top)),
					left: px(Board.calcTileOffset(element.styles.left || 0)),
					borderTopLeftRadius: px(
						maybe(element.styles.borderTopLeftRadius, Board.calcTileOffset(0.5)) as number
					),
					borderTopRightRadius: px(
						maybe(element.styles.borderTopRightRadius, Board.calcTileOffset(0.5)) as number
					),
					borderBottomRightRadius: px(
						maybe(element.styles.borderBottomRightRadius, Board.calcTileOffset(0.5)) as number
					),
					borderBottomLeftRadius: px(
						maybe(element.styles.borderBottomLeftRadius, Board.calcTileOffset(0.5)) as number
					),
				}) as HTMLElement;

				// make sure invisible walls that are outside of teleports display over characters so that it looks
				// like the character's "disappear" through them
				if (wall.classList.contains("teleport-cover")) {
					wall.css({
						zIndex: BoardObject.BOARD_OBJECT_Z_INDEX + 1,
					});
				}

				this.wallElements.push(wall);
			}
		});
	}

	// #!DEBUG
	/**
	 * Creates horizontal and vertical lines that form squares for each tile in debug mode.
	 */
	private debug_createGrid() {
		const element = this.getElement();

		for (let i = COLUMNS, left = 0; i >= 1; i--, left += TILESIZE) {
			this.placeBoardObject(
				new BoardText({ name: `grid-vert-num-${i}`, text: i.toString(), vertical: true }),
				i,
				0
			);

			element.appendChild(
				create({ name: "div", classes: ["grid-vert"] }).css({
					left: px(left),
					height: px(HEIGHT + TILESIZE),
					zIndex: BoardObject.BOARD_OBJECT_Z_INDEX + 2,
				}) as HTMLElement
			);
		}

		for (let i = ROWS, top = 0; i >= 1; i--, top += TILESIZE) {
			// store as variable so we can use it to offset the text, based on the number of characters
			this.placeBoardObject(new BoardText({ name: `grid-horiz-num-${i}`, text: i.toString() }), 0, i);

			element.appendChild(
				create({ name: "div", classes: ["grid-horiz"] }).css({
					left: px(-TILESIZE),
					top: px(top + TILESIZE),
					width: px(WIDTH + TILESIZE),
					zIndex: BoardObject.BOARD_OBJECT_Z_INDEX + 2,
				}) as HTMLElement
			);
		}
	}
	// #!END_DEBUG

	// #!DEBUG
	/**
	 * Creates circular nodes at each corner where characters can turn and also draws lines that connect these circular nodes, in debug mode.
	 */
	private async debug_createPaths() {
		const pathData: PathData = await fetchJSON(AssetRegistry.getJsonSrc("paths"));

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

				this.getElement().appendChild(
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
	// #!END_DEBUG
}
