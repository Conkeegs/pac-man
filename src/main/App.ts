"use strict";

import JsonRegistry from "./assets/JsonRegistry.js";
import Board from "./board/Board.js";
import type { TurnData } from "./board/boardobject/children/character/Character.js";
import Character from "./board/boardobject/children/character/Character.js";
import { fetchJSON } from "./utils/Utils.js";

/**
 * This class loads the game before initializing the board.
 */
class App {
	constructor() {
		App.loadGame().then(() => {
			new Board();
		});
	}

	/**
	 * Loads the game's resources before creating the board.
	 *
	 * @returns promise which loads all game resources
	 */
	private static loadGame(): Promise<[void]> {
		return Promise.all([
			// tell all characters where it can turn
			fetchJSON(JsonRegistry.getJson("turns")).then((turnData: TurnData[]) => {
				for (let turn of turnData) {
					turn.x = Board.calcTileX(turn.x + 0.5);
					turn.y = Board.calcTileY(turn.y - 0.5);
				}

				Character.turnData = turnData;
			}),
		]);
	}
}

// run the game
new App();
