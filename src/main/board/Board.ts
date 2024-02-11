"use strict";

import DebugWindow from "../debugwindow/DebugWindow.js";
import { COLUMNS, HEIGHT, ROWS, TILESIZE, WIDTH } from "../utils/Globals.js";
import { create, fetchJSON, get, maybe, px } from "../utils/Utils.js";
import { BoardObject } from "./boardobject/BoardObject.js";
import BoardText from "./boardobject/children/BoardText.js";
import PathNode from "./boardobject/children/PathNode.js";
import PacMan from "./boardobject/children/character/PacMan.js";

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
 * HTML-specific attribute data about every wall in the game.
 */
interface WallDataElement {
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
 * The board contains all the main elements in the game: characters, ghosts, items, etc.
 */
export default class Board {
	/**
	 * Whether the board has finished creation or not.
	 */
	private boardCreated = false;

	/**
	 * The container of everything that the board holds.
	 */
	private boardDiv = create({
		name: "div",
		id: "board",
	});

	/**
	 * Creates the board.
	 *
	 * @param color the background color of the board
	 */
	constructor(color = "#070200") {
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

		let game: HTMLElement | null = get("game");

		if (!game) {
			DebugWindow.error("Board.js", "constructor", "No #game element found.");
		} else {
			(game.css({ backgroundColor: color }) as HTMLElement).appendChild(this.boardDiv);
		}

		// setup walls
		fetchJSON("src/assets/json/walls.json")
			.then((wallData: WallDataElement[]) => {
				for (let element of wallData) {
					this.boardDiv.appendChild(
						create({ name: "div", id: element.id, classes: element.classes }).css({
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
						}) as HTMLElement
					);
				}

				get("middle-cover")!.css({
					backgroundColor: color,
				});

				this.boardCreated = true;

				this.createMainBoardObjects();

				// debugging methods
				this.createGrid();
				this.createPaths();
			})
			.catch((error) => {
				DebugWindow.error("Board.js", "constructor", `Could not fetch wall data due to '${error.message}'.`);
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
	 * Places a board object (characters, items, or text) at the given `x` and `y` tile offset.
	 *
	 * @param boardObject the board object to place
	 * @param tileX the horizontal offset of the board object
	 * @param tileY the vertical offset of the board object
	 */
	private placeBoardObject(boardObject: BoardObject, tileX: number, tileY: number) {
		if (!(boardObject instanceof BoardObject)) {
			DebugWindow.error("Board.js", "placeBoardObject", "boardObject is not an actual instance of BoardObject.");
		}

		if (tileX > 28) {
			DebugWindow.error("Board.js", "placeBoardObject", "tileX value is above 28.");
		} else if (tileX < -1) {
			DebugWindow.error("Board.js", "placeBoardObject", "tileX value is below -1.");
		} else if (tileY > 36) {
			DebugWindow.error("Board.js", "placeBoardObject", "tileY value is above 36.");
		} else if (tileY < 0) {
			DebugWindow.error("Board.js", "placeBoardObject", "tileY value is below 0.");
		}

		const left = Board.calcTileOffset(tileX);
		const top = Board.calcTileOffset(ROWS) - Board.calcTileOffset(tileY);

		boardObject.setPosition(
			{
				x: left,
				y: top,
			},
			// stop BoardObject from using "translate" function during initial placement
			false
		);

		// don't use "translate" here yet so we can set initial css position
		this.boardDiv.appendChild(
			boardObject.getElement().css({
				left: px(left),
				top: px(top),
			}) as HTMLElement
		);
	}

	/**
	 * Creates main objects on the board. This includes characters, items, and text.
	 */
	private createMainBoardObjects() {
		const PACMAN_SPEED = 88;
		const PACMAN_SPAWN_X = 15;
		const PACMAN_SPAWN_Y = 10.25;

		this.placeBoardObject(
			new PacMan("pac-man", PACMAN_SPEED, "src/assets/images/pacman-frame-0.png"),
			PACMAN_SPAWN_X,
			PACMAN_SPAWN_Y
		);
	}

	/**
	 * Creates horizontal and vertical lines that form squares for each tile in debug mode.
	 */
	private createGrid() {
		if (!this.boardCreated) {
			DebugWindow.error("Board.js", "grid", "Board not fully created yet.");
		}

		for (let i = COLUMNS, left = 0; i >= 1; i--, left += TILESIZE) {
			this.placeBoardObject(
				new BoardText(`grid-vert-num-${i}`, i.toString(), Board.calcTileOffset(0.75)),
				i - 1,
				0
			);

			this.boardDiv.appendChild(
				create({ name: "div", classes: ["grid-vert", "board-object"] }).css({
					left: px(left),
					height: px(HEIGHT + TILESIZE),
				}) as HTMLElement
			);
		}

		for (let i = ROWS, top = 0; i >= 1; i--, top += TILESIZE) {
			this.placeBoardObject(
				new BoardText(`grid-horiz-num-${i}`, i.toString(), Board.calcTileOffset(0.75)),
				-1,
				i
			);

			this.boardDiv.appendChild(
				create({ name: "div", classes: ["grid-horiz", "board-object"] }).css({
					left: px(-TILESIZE),
					top: px(top + TILESIZE),
					width: px(WIDTH + TILESIZE),
				}) as HTMLElement
			);
		}
	}

	/**
	 * Creates circular nodes at each corner where characters can turn and also draws lines that connect these circular nodes, in debug mode.
	 */
	private async createPaths() {
		const pathData: PathData = await fetchJSON("src/assets/json/paths.json");

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
						classes: ["path-line", "board-object"],
					}).css({
						width: px(width < 1 ? 1 : width),
						height: px(heightLessThan1 ? 1 : height),
						bottom: px(nodePositions[startNode]![1] - TILESIZE - (heightLessThan1 ? 0 : height)),
						left: px(nodePositions[startNode]![0]),
					}) as HTMLElement
				);
			}
		}
	}
}
