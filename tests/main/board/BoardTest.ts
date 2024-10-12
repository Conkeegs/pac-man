import Board from "../../../src/main/board/Board.js";
import PacMan from "../../../src/main/board/boardobject/children/character/PacMan.js";
import {
	BOARDOBJECTS,
	CHARACTERS,
	COLLIDABLES_MAP,
	FOOD_COUNT,
	HEIGHT,
	ROWS,
	TILESIZE,
	WIDTH,
} from "../../../src/main/utils/Globals.js";
import { get, px } from "../../../src/main/utils/Utils.js";
import Assertion from "../../base/Assertion.js";
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
	public createBoardTest(): void {
		const boardColor = "red";
		const board = new Board(boardColor);
		const boardDiv = board.boardDiv;
		const game = get("game");

		Assertion.assertExists(game);
		Assertion.assertStrictlyEqual(boardColor, game!.css("backgroundColor"));
		Assertion.assertStrictlyEqual(game, boardDiv.parentElement);
		Assertion.assertStrictlyEqual(boardColor, boardDiv.css("backgroundColor"));
		Assertion.assertStrictlyEqual(px(WIDTH), boardDiv.css("width"));
		Assertion.assertStrictlyEqual(px(HEIGHT), boardDiv.css("height"));
		Assertion.assertStrictlyEqual(boardColor, boardDiv.css("backgroundColor"));
		Assertion.assertEmpty(COLLIDABLES_MAP);
		Assertion.assertEmpty(BOARDOBJECTS);
		Assertion.assertEmpty(CHARACTERS);
	}

	/**
	 * Test that the game's board can calc tile offsets.
	 */
	public calcTileOffsetTest(): void {
		// triple the tilesize and see if it's equal
		Assertion.assertStrictlyEqual(TILESIZE * 3, Board.calcTileOffset(3));
	}

	/**
	 * Test that the game's board can calc horizontal offsets.
	 */
	public calcTileOffsetXTest(): void {
		Assertion.assertStrictlyEqual(TILESIZE * 3 - TILESIZE, Board.calcTileOffsetX(3));
	}

	/**
	 * Test that the game's board can calc vertical offsets.
	 */
	public calcTileOffsetYTest(): void {
		const totalTileWidth = TILESIZE * ROWS;
		const tripleTileSize = TILESIZE * 3;

		Assertion.assertStrictlyEqual(totalTileWidth - tripleTileSize - TILESIZE, Board.calcTileOffsetY(3));
	}

	/**
	 * Test that the game's board can calc horizontal offsets.
	 */
	public calcTileNumXTest(): void {
		const numTiles = 5;
		const pixelOffset = TILESIZE * numTiles;

		// 5 tiles-sizes in means the edge of the object would be at the start of the 6th tile, so we
		// add 1 to "numTiles"
		Assertion.assertStrictlyEqual(numTiles + 1, Board.calcTileNumX(pixelOffset));
	}

	/**
	 * Test that the game's board can calc vertical offsets.
	 */
	public async calcTileNumYTest(): Promise<void> {
		const numTiles = 5;
		const pixelOffset = TILESIZE * numTiles;

		// 5 tiles-sizes in means the edge of the object would be at the start of the 6th tile, so we
		// add 1 to "numTiles". also, subtract from "ROWS" since vertical offsets come from the top-down
		Assertion.assertStrictlyEqual(ROWS - (numTiles + 1), Board.calcTileNumY(pixelOffset));
	}

	/**
	 * Test that the game's board can create & place the main board objects on itself.
	 */
	public async createMainBoardObjectsTest(): Promise<void> {
		const board = new Board();

		await board.createMainBoardObjects();

		Assertion.assertArrayLength(
			FOOD_COUNT,
			BOARDOBJECTS.filter((boardObject) => boardObject.constructor.name === "Food")
		);
		Assertion.assertArrayLength(
			1,
			BOARDOBJECTS.filter((boardObject) => boardObject.constructor.name === "PacMan")
		);
		Assertion.assertArrayLength(
			1,
			BOARDOBJECTS.filter((boardObject) => boardObject.constructor.name === "Blinky")
		);
		Assertion.assertArrayLength(
			1,
			BOARDOBJECTS.filter((boardObject) => boardObject.constructor.name === "Inky")
		);
		Assertion.assertArrayLength(
			1,
			BOARDOBJECTS.filter((boardObject) => boardObject.constructor.name === "Pinky")
		);
		Assertion.assertArrayLength(
			1,
			BOARDOBJECTS.filter((boardObject) => boardObject.constructor.name === "Clyde")
		);
	}

	/**
	 * Test that the game's board can place `BoardObject` instances on it.
	 */
	public placeBoardObjectTest(): void {
		const board = new Board();
		const pacman = new PacMan();
		const numTiles = 5;

		Reflect.apply(board["placeBoardObject"], board, [pacman, numTiles, numTiles]);

		const pacmanPosition = pacman.getPosition();

		Assertion.assertStrictlyEqual(TILESIZE * numTiles - TILESIZE, pacmanPosition.x);
		Assertion.assertStrictlyEqual(Board.calcTileOffset(ROWS) - TILESIZE * numTiles - TILESIZE, pacmanPosition.y);
		Assertion.assertStrictlyEqual(board.boardDiv, pacman.getElement().parentElement);
	}
}
