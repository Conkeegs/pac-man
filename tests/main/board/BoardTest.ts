import { App } from "../../../src/main/App.js";
import Board from "../../../src/main/board/Board.js";
import PacMan from "../../../src/main/board/boardobject/children/character/PacMan.js";
import Food from "../../../src/main/board/boardobject/children/Food.js";
import type { Position } from "../../../src/main/gameelement/GameElement.js";
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
		this.assertTrue(App.getInstance().getCollidablesMap().size > 0);
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
	 * Test that the board can form tile keys for positions.
	 */
	public tileKeyFromPositionTest(): void {
		const position1: Position = {
			x: 500,
			y: 750,
		};

		this.assertStrictlyEqual(
			`${Board.calcTileNumX(position1.x)}-${Board.calcTileNumY(position1.y)}`,
			Board.tileKeyFromPosition(position1)
		);

		const position2: Position = {
			x: 450,
			y: 900,
		};

		this.assertStrictlyEqual(
			`${Board.calcTileNumX(position2.x)}-${Board.calcTileNumY(position2.y)}`,
			Board.tileKeyFromPosition(position2)
		);
	}

	/**
	 * Test that the board can form tile keys.
	 */
	public createTileKeyTest(): void {
		const position1: Position = {
			x: 500,
			y: 750,
		};

		this.assertStrictlyEqual(`${position1.x}-${position1.y}`, Board.createTileKey(position1.x, position1.y));

		const position2: Position = {
			x: 450,
			y: 900,
		};

		this.assertStrictlyEqual(`${position2.x}-${position2.y}`, Board.createTileKey(position2.x, position2.y));
	}

	/**
	 * Test that the board can find the closest point on a line segment to a given position.
	 */
	public positionDistanceToLineSegmentTest(): void {
		/*
			In this case, point/position is perfectly between
			line segment on y-axis, so closest point is in the center
			of the line.

			      │
			*     │
				  │
		*/
		const pointX = 10;
		const pointY = 10;
		const offset = 5;
		const position: Position = {
			x: pointX,
			y: pointY,
		};
		let lineStart: Position = {
			x: pointX + offset,
			y: pointY - offset,
		};
		let lineEnd: Position = {
			x: pointX + offset,
			y: pointY + offset,
		};

		this.assertStrictlyEqual(offset, Board.positionDistanceToLineSegment(position, lineStart, lineEnd));

		/*
			Point/position is perfectly between line segment
			on y-axis again, so closest point is in the center
			of the line again.

			│
			│     *
			│
		*/
		lineStart = {
			x: pointX - offset,
			y: pointY - offset,
		};
		lineEnd = {
			x: pointX - offset,
			y: pointY + offset,
		};

		this.assertStrictlyEqual(offset, Board.positionDistanceToLineSegment(position, lineStart, lineEnd));

		/*
			In this case, point/position is at top of line
			segment on its left side, so closest point is
			the top of the line.

			*     │
				  │
				  │
		*/
		lineStart = {
			x: pointX + offset,
			y: pointY,
		};
		lineEnd = {
			x: pointX + offset,
			y: pointY + offset,
		};

		this.assertStrictlyEqual(offset, Board.positionDistanceToLineSegment(position, lineStart, lineEnd));

		/*
			In this case, point/position is at top of line
			segment on its left side, so closest point is
			the top of the line.

			│     *
			│
			│
		*/
		lineStart = {
			x: pointX - offset,
			y: pointY,
		};
		lineEnd = {
			x: pointX - offset,
			y: pointY + offset,
		};

		this.assertStrictlyEqual(offset, Board.positionDistanceToLineSegment(position, lineStart, lineEnd));
	}

	/**
	 * Test that the game's board can create & place the main board objects on itself.
	 */
	public async createMainBoardObjectsTest(): Promise<void> {
		const board = Board.getInstance();

		await board.createMainBoardObjects();

		let foodCount = 0;
		let pacmanCount = 0;
		let blinkyCount = 0;
		let inkyCount = 0;
		let pinkyCount = 0;
		let clydeCount = 0;

		const gameElementsMap = App.getInstance().getGameElementsMap().values();

		for (const gameElement of gameElementsMap) {
			switch (gameElement.constructor.name) {
				case "Food":
					foodCount++;
					break;
				case "PacMan":
					pacmanCount++;
					break;
				case "Blinky":
					blinkyCount++;
					break;
				case "Inky":
					inkyCount++;
					break;
				case "Pinky":
					pinkyCount++;
					break;
				case "Clyde":
					clydeCount++;
					break;
			}
		}

		this.assertStrictlyEqual(Board.FOOD_COUNT, foodCount);
		this.assertStrictlyEqual(1, pacmanCount);
		this.assertStrictlyEqual(1, blinkyCount);
		this.assertStrictlyEqual(1, inkyCount);
		this.assertStrictlyEqual(1, pinkyCount);
		this.assertStrictlyEqual(1, clydeCount);
		this.assertNotEmpty(board.getTurns());
	}

	/**
	 * Test that the game's board can delete itself.
	 */
	public async deleteTest(): Promise<void> {
		const board = Board.getInstance();

		await board.create();

		this.assertFalse(board.getElement().childElementCount === 0);
		this.assertNotEmpty(board.getTurns());
		this.assertTrue(Board["instance"] instanceof Board);

		board.delete();

		this.assertEmpty(board.getElement());
		this.assertEmpty(board["turns"]);
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

		const food = new Food("testing food");
		const foodTileX = 2;
		const foodTileY = 19;

		// test board object centering in tiles
		board["placeBoardObject"](food, foodTileX, foodTileY, true);

		const foodPosition = food.getPosition();

		this.assertStrictlyEqual(
			Board.calcTileOffsetX(foodTileX) + (TILESIZE / 2 - food.getWidth() / 2),
			foodPosition.x
		);
		this.assertStrictlyEqual(
			Board.calcTileOffsetY(foodTileY) + (TILESIZE / 2 - food.getWidth() / 2),
			foodPosition.y
		);
	}

	/**
	 * Test that the board can place its turns.
	 */
	public async placeTurnBoardObjectsTest(): Promise<void> {
		const board = Board.getInstance();
		const turns = board.getTurns();

		this.assertEmpty(turns);

		await board["placeTurnBoardObjects"]();

		const turnData = await board["loadTurnData"]();

		this.assertNotEmpty(turns);
		this.assertStrictlyEqual(turnData.length, turnData.length);
	}

	/**
	 * Test that the game's board load its turn data correctly.
	 */
	public async loadTurnDataTest(): Promise<void> {
		const board = Board.getInstance();

		const turnData = await board["loadTurnData"]();

		this.assertNotEmpty(turnData);
	}

	/**
	 * Test that the game's board load its wall element correctly.
	 */
	public async loadWallElementsTest(): Promise<void> {
		const board = Board.getInstance();

		const wallElements = await board["loadWallElements"]();

		this.assertNotEmpty(wallElements);
	}

	/**
	 * Test that the board can get its turns correctly.
	 */
	public async getTurnsTest(): Promise<void> {
		const board = Board.getInstance();

		this.assertEmpty(board.getTurns());

		await board["placeTurnBoardObjects"]();

		this.assertNotEmpty(board.getTurns());
	}
}
