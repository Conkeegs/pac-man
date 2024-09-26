import Board from "../../src/main/board/Board.js";
import { BODY_BACKGROUND_COLOR, HEIGHT, ROWS, TILESIZE, WIDTH } from "../../src/main/utils/Globals.js";
import { get, px } from "../../src/main/utils/Utils.js";
import Assertion from "../base/Assertion.js";
import Test from "../base/Base.js";
import { tests } from "../base/Decorators.js";

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

		game!.removeAllChildren();
		game!.css({
			backgroundColor: BODY_BACKGROUND_COLOR,
		});
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
	public calcTileXTest(): void {
		Assertion.assertStrictlyEqual(TILESIZE * 3 - TILESIZE, Board.calcTileX(3));
	}

	/**
	 * Test that the game's board can calc vertical offsets.
	 */
	public calcTileYTest(): void {
		const totalTileWidth = TILESIZE * ROWS;
		const tripleTileSize = TILESIZE * 3;

		Assertion.assertStrictlyEqual(totalTileWidth - tripleTileSize - TILESIZE, Board.calcTileY(3));
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
	public calcTileNumYTest(): void {
		const numTiles = 5;
		const pixelOffset = TILESIZE * numTiles;

		// 5 tiles-sizes in means the edge of the object would be at the start of the 6th tile, so we
		// add 1 to "numTiles". also, subtract from "ROWS" since vertical offsets come from the top-down
		Assertion.assertStrictlyEqual(ROWS - (numTiles + 1), Board.calcTileNumY(pixelOffset));
	}
}
