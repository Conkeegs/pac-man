"use strict";

import JsonRegistry from "./assets/JsonRegistry.js";
import Board, { type WallDataElement } from "./board/Board.js";
import type { TurnData } from "./board/boardobject/children/character/Character.js";
import Character from "./board/boardobject/children/character/Character.js";
import { BOARD_OBJECT_Z_INDEX } from "./utils/Globals.js";
import { create, fetchJSON, get, maybe, px } from "./utils/Utils.js";

/**
 * This class loads the game before initializing the board.
 */
class App {
	/**
	 * The walls to display in the game.
	 */
	private static readonly loadedWallData: HTMLElement[] = [];

	constructor() {
		App.loadGame().then(() => {
			const board = new Board();

			// display the walls of the game
			for (const wall of App.loadedWallData) {
				board.boardDiv.appendChild(wall);
			}

			get("middle-cover")!.css({
				backgroundColor: Board.BACKGROUND_COLOR,
			});

			// place BoardObject instances on board
			board.createMainBoardObjects();
		});
	}

	/**
	 * Loads the game's resources before creating the board.
	 *
	 * @returns promise which loads all game resources
	 */
	private static loadGame(): Promise<[void, void]> {
		return Promise.all([
			// tell all characters where it can turn
			fetchJSON(JsonRegistry.getJson("turns")).then((turnData: TurnData[]) => {
				for (let turn of turnData) {
					turn.x = Board.calcTileX(turn.x + 0.5);
					turn.y = Board.calcTileY(turn.y - 0.5);
				}

				Character.turnData = turnData;
			}),
			// setup walls
			fetchJSON(JsonRegistry.getJson("walls")).then((wallData: WallDataElement[]) => {
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
							zIndex: BOARD_OBJECT_Z_INDEX + 1,
						});
					}

					App.loadedWallData.push(wall);
				}
			}),
		]);
	}
}

// run the game
new App();
