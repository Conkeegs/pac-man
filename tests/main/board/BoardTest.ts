import { App } from "../../../src/main/App.js";
import Board from "../../../src/main/board/Board.js";
import PacMan from "../../../src/main/board/boardobject/children/character/PacMan.js";
import { HEIGHT, ROWS, TILESIZE, WIDTH } from "../../../src/main/utils/Globals.js";
import { get, hexToRgb, px } from "../../../src/main/utils/Utils.js";
import Test from "../../base/Base.js";
import { tests } from "../../base/Decorators.js";

/**
 * Tests the `src\main\board\Board.ts` class.
 */
@tests(Board)
export default class BoardTest extends Test {
	/**
	 * Test that the game's board can be created successfully.
	 */
	public async createTest(): Promise<void> {
		const board = Board.getInstance();
		const boardDiv = board.getElement();
		const game = get("game");

		await board.create();

		this.assertExists(game);
		this.assertStrictlyEqual(hexToRgb(Board.BACKGROUND_COLOR), game!.css("backgroundColor"));
		this.assertStrictlyEqual(game, boardDiv.parentElement);
		this.assertStrictlyEqual(hexToRgb(Board.BACKGROUND_COLOR), boardDiv.css("backgroundColor"));
		this.assertStrictlyEqual(px(WIDTH), boardDiv.css("width"));
		this.assertStrictlyEqual(px(HEIGHT), boardDiv.css("height"));
		this.assertStrictlyEqual(hexToRgb(Board.BACKGROUND_COLOR), boardDiv.css("backgroundColor"));
		this.assertNotEmpty(App.COLLIDABLES_MAP);
		this.assertNotEmpty(App.BOARDOBJECTS);
		this.assertNotEmpty(App.CHARACTERS);
		this.assertNotEmpty(board.getTurns());
		this.assertNotEmpty(board["wallElements"]);
		this.assertTrue(boardDiv.childElementCount > 0);
		this.assertStrictlyEqual(hexToRgb(Board.BACKGROUND_COLOR), get("middle-cover")!.css("backgroundColor"));
	}

	/**
	 * Test that the game's board can calc tile offsets.
	 */
	public calcTileOffsetTest(): void {
		// triple the tilesize and see if it's equal
		this.assertStrictlyEqual(TILESIZE * 3, Board.calcTileOffset(3));
	}

	/**
	 * Test that the game's board can calc horizontal offsets.
	 */
	public calcTileOffsetXTest(): void {
		this.assertStrictlyEqual(TILESIZE * 3 - TILESIZE, Board.calcTileOffsetX(3));
	}

	/**
	 * Test that the game's board can calc vertical offsets.
	 */
	public calcTileOffsetYTest(): void {
		const totalTileWidth = TILESIZE * ROWS;
		const tripleTileSize = TILESIZE * 3;

		this.assertStrictlyEqual(totalTileWidth - tripleTileSize - TILESIZE, Board.calcTileOffsetY(3));
	}

	/**
	 * Test that the game's board can calc horizontal offsets.
	 */
	public calcTileNumXTest(): void {
		const numTiles = 5;
		const pixelOffset = TILESIZE * numTiles;

		// 5 tiles-sizes in means the edge of the object would be at the start of the 6th tile, so we
		// add 1 to "numTiles"
		this.assertStrictlyEqual(numTiles + 1, Board.calcTileNumX(pixelOffset));
	}

	/**
	 * Test that the game's board can calc vertical offsets.
	 */
	public async calcTileNumYTest(): Promise<void> {
		const numTiles = 5;
		const pixelOffset = TILESIZE * numTiles;

		// 5 tiles-sizes in means the edge of the object would be at the start of the 6th tile, so we
		// add 1 to "numTiles". also, subtract from "ROWS" since vertical offsets come from the top-down
		this.assertStrictlyEqual(ROWS - (numTiles + 1), Board.calcTileNumY(pixelOffset));
	}

	/**
	 * Test that the game's board can create & place the main board objects on itself.
	 */
	public async createMainBoardObjectsTest(): Promise<void> {
		const board = Board.getInstance();

		await board.createMainBoardObjects();

		this.assertArrayLength(
			Board.FOOD_COUNT,
			App.BOARDOBJECTS.filter((boardObject) => boardObject.constructor.name === "Food")
		);
		this.assertArrayLength(
			1,
			App.BOARDOBJECTS.filter((boardObject) => boardObject.constructor.name === "PacMan")
		);
		this.assertArrayLength(
			1,
			App.BOARDOBJECTS.filter((boardObject) => boardObject.constructor.name === "Blinky")
		);
		this.assertArrayLength(
			1,
			App.BOARDOBJECTS.filter((boardObject) => boardObject.constructor.name === "Inky")
		);
		this.assertArrayLength(
			1,
			App.BOARDOBJECTS.filter((boardObject) => boardObject.constructor.name === "Pinky")
		);
		this.assertArrayLength(
			1,
			App.BOARDOBJECTS.filter((boardObject) => boardObject.constructor.name === "Clyde")
		);
	}

	/**
	 * Test that the game's board can delete itself.
	 */
	public async destroyTest(): Promise<void> {
		const board = Board.getInstance();

		this.assertFalse(board.getElement().childElementCount === 0);
		this.assertNotEmpty(board.getTurns());
		this.assertNotEmpty(board["wallElements"]);
		this.assertTrue(Board["instance"] instanceof Board);

		board.destroy();

		this.assertEmpty(board.getElement());
		this.assertEmpty(board["wallElements"]);
		this.assertOfType("undefined", Board["instance"]);
	}

	/**
	 * Test that the game's board can place `BoardObject` instances on it.
	 */
	public placeBoardObjectTest(): void {
		const board = Board.getInstance();
		const pacman = new PacMan();
		const numTiles = 5;

		Reflect.apply(board["placeBoardObject"], board, [pacman, numTiles, numTiles]);

		const pacmanPosition = pacman.getPosition();

		this.assertStrictlyEqual(TILESIZE * numTiles - TILESIZE, pacmanPosition.x);
		this.assertStrictlyEqual(Board.calcTileOffset(ROWS) - TILESIZE * numTiles - TILESIZE, pacmanPosition.y);
		this.assertStrictlyEqual(board.getElement(), pacman.getElement().parentElement);
	}

	/**
	 * Test that the game's board load its turn data correctly.
	 */
	public async loadTurnDataTest(): Promise<void> {
		const board = Board.getInstance();

		await board["loadTurnData"]();

		this.assertNotEmpty(board.getTurns());
	}

	/**
	 * Test that the game's board load its wall element correctly.
	 */
	public async loadWallElementsTest(): Promise<void> {
		const board = Board.getInstance();

		await board["loadWallElements"]();

		this.assertNotEmpty(board["wallElements"]);
	}
}
