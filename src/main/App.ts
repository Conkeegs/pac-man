"use strict";

import RunTests from "../../tests/RunTests.js";
import JsonRegistry from "./assets/JsonRegistry.js";
import Board, { type WallDataElement } from "./board/Board.js";
import type { Position } from "./board/boardobject/BoardObject.js";
import { State } from "./board/boardobject/children/Button/PausePlayButton.js";
import type { TurnData } from "./board/boardobject/children/character/Character.js";
import Character from "./board/boardobject/children/character/Character.js";
import { BOARD_OBJECT_Z_INDEX, BOARDOBJECTS, CHARACTERS, COLLIDABLES_MAP, TESTING } from "./utils/Globals.js";
import { create, defined, fetchJSON, get, maybe, px } from "./utils/Utils.js";

/**
 * This class loads the game's UI before initializing the board.
 */
export class App {
	/**
	 * The current animation frame requested by the DOM for the game's loop.
	 */
	private animationFrameId: number | undefined;
	/**
	 * Increments by the number of milliseconds it takes to render each frame, every frame.
	 */
	private deltaTimeAccumulator: number = 0;
	/**
	 * The desired frames-per-second that the game should update at.
	 */
	private static readonly DESIRED_FPS: 30 = 30;
	/**
	 * The walls to display in the game.
	 */
	private static readonly loadedWallData: HTMLElement[] = [];
	/**
	 * The last timestamp in the game's animation frame that the fps was displayed.
	 */
	private debug_frameCountTimeStamp: number = 0;
	/**
	 * The number of frames that have passed in about one second.
	 */
	private debug_framesCounted: number = 0;
	/**
	 * The board that the game displays on.
	 */
	private board: Board | undefined;

	/**
	 * The rough amount of milliseconds that should pass before the game updates each frame.
	 */
	public static readonly DESIRED_MS_PER_FRAME: number = 1000 / App.DESIRED_FPS;
	/**
	 * Whether or not the game is currently paused.
	 */
	public static GAME_PAUSED: boolean = false;
	/**
	 * Whether the game is in debug mode or not.
	 */
	public static DEBUG: boolean = true;

	/**
	 * Creates an instance of the app.
	 *
	 */
	constructor() {
		App.loadGame().then(() => {
		App.loadGame().then(async () => {
			this.board = new Board();
			const board = this.board;

			// display the walls of the game
			for (const wall of App.loadedWallData) {
				board.boardDiv.appendChild(wall);
			}

			get("middle-cover")!.css({
				backgroundColor: Board.BACKGROUND_COLOR,
			});

			// place BoardObject instances on board
			await board.createMainBoardObjects();

			// put the game in a "paused" state upon exiting the window
			window.addEventListener("blur", () => {
				// make sure game isn't already paused to prevent overwrite of "pauseplaybutton" behavior
				if (!App.GAME_PAUSED) {
					this.stopGame(true);
				}
			});

			const pausePlayButton = board.debug_pausePlayButton!;

			// put the game in a "unpaused" state upon opening the window
			window.addEventListener("focus", () => {
				// make sure game isn't already paused to prevent overwrite of "pauseplaybutton" behavior
				if (!(pausePlayButton.getState() === State.PAUSED)) {
					this.startGame(true);
				}
			});

			if (App.DEBUG) {
				pausePlayButton.onClick(() => {
					App.GAME_PAUSED = !App.GAME_PAUSED;

					if (App.GAME_PAUSED) {
						this.stopGame(true);
						pausePlayButton.setText("Play");
						pausePlayButton.setPaused();
					} else {
						this.startGame(true);
						pausePlayButton.setText("Pause");
						pausePlayButton.setPlaying();
					}
				});
			}

			// initial start of the game
			this.animationFrameId = this.startGame();
		});
	}

	/**
	 * Removes values from globals that are modified throughout the app. Deletes
	 * all references in the `COLLIDABLES_MAP`, all `BoardObject`s, and all `Character`s, and then
	 * deleted the app's elements.
	 */
	public static destroy(): void {
		Object.removeAllKeys(COLLIDABLES_MAP);

		BOARDOBJECTS.length = 0;
		CHARACTERS.length = 0;

		get("game")!.innerHTML = "";
	}

	/**
	 * Starts the main gameloop.
	 */
	private startGame(fromPause: boolean = false): number {
		App.GAME_PAUSED = false;

		if (fromPause) {
			const movingCharacters = App.findMovingCharacters();

			// play every (moving) character's animations again upon starting the game from a paused state
			for (let i = 0; i < movingCharacters.length; i++) {
				movingCharacters[i]!.playAnimation();
			}
		}

		return requestAnimationFrame((timeStamp) => this.gameLoop(0, timeStamp, 0));
	}

	/**
	 *
	 * @param paused whether or not the game stopped because it paused (defaults to `false`)
	 */
	private stopGame(paused: boolean = false): void {
		// don't reset these variables on pause so the game can properly be un-paused without
		// losing state
		if (!paused) {
			this.deltaTimeAccumulator = 0;
		} else {
			App.GAME_PAUSED = true;
		}

		const movingCharacters = App.findMovingCharacters();

		for (let i = 0; i < movingCharacters.length; i++) {
			movingCharacters[i]!.stopAnimation();
		}

		// reset fpscounter variables
		if (App.DEBUG) {
			this.debug_frameCountTimeStamp = 0;
			this.debug_framesCounted = 0;
		}

		cancelAnimationFrame(this.animationFrameId!);
	}

	/**
	 * The main gameloop of the game. Runs logic every frame and interpolates between updates.
	 *
	 * @param lastAnimationTime the last `timeStamp` value
	 * @param timeStamp the current timestamp of the game in milliseconds
	 * @param frameCount the amount of frames rendered by the game (updated around every `DESIRED_FPS` frames)
	 */
	private gameLoop(lastAnimationTime: number, timeStamp: number, frameCount: number): void {
		if (App.GAME_PAUSED) {
			return;
		}

		let deltaTime = timeStamp - lastAnimationTime;

		// prevent spiral of death
		if (deltaTime > 250) {
			deltaTime = 250;
		}

		// prevents "deltaTime" from being very large at the start, and therefore
		// being very large distance and causing unexpected game behaviors
		if (!lastAnimationTime) {
			deltaTime = 0;
			lastAnimationTime = timeStamp;
		}

		this.deltaTimeAccumulator += deltaTime;

		// update fps counter
		if (App.DEBUG) {
			if (frameCount === 0) {
				this.debug_frameCountTimeStamp = timeStamp;
			}

			if (timeStamp >= this.debug_frameCountTimeStamp + 1000) {
				// Update every second
				this.board!.debug_fpsCounter!.setText(`FPS:${this.debug_framesCounted}`);

				this.debug_framesCounted = 0;
				this.debug_frameCountTimeStamp = timeStamp;
			}
		}

		const MS_PER_FRAME = App.DESIRED_MS_PER_FRAME;
		// keep track of each character's position so we can properly interpolate it every frame
		let oldCharacterPositions: { [key: string]: Position } = {};

		/**
		 * Find an array of characters who are currently moving, and save their current positions in memory.
		 */
		const findMovingCharactersAndMapPosition = (): Character[] =>
			CHARACTERS.filter((character) => {
				oldCharacterPositions[character.getName()] = character.getPosition()!;

				return character.isMoving();
			});

		let movingCharacters: Character[] | undefined;

		while (this.deltaTimeAccumulator >= MS_PER_FRAME) {
			movingCharacters = findMovingCharactersAndMapPosition();

			for (let i = 0; i < movingCharacters.length; i++) {
				movingCharacters[i]!.tick();
			}

			frameCount++;
			this.deltaTimeAccumulator -= MS_PER_FRAME;

			if (App.DEBUG) {
				this.debug_framesCounted++;
			}
		}

		const alpha = this.deltaTimeAccumulator / MS_PER_FRAME;
		// some characters may have stopped/started moving after rendering, so refresh this array
		movingCharacters = App.findMovingCharacters();

		if (movingCharacters.length) {
			for (let i = 0; i < movingCharacters.length; i++) {
				const character = movingCharacters[i];

				if (!defined(character)) {
					continue;
				}

				const oldCharacterPosition = oldCharacterPositions[character.getName()]!;

				if (!defined(oldCharacterPosition)) {
					continue;
				}

				character.interpolate(alpha, oldCharacterPosition);
			}
		}

		lastAnimationTime = timeStamp;

		this.animationFrameId = requestAnimationFrame((timeStampNew) =>
			this.gameLoop(lastAnimationTime, timeStampNew, frameCount)
		);
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
					turn.x = Board.calcTileOffsetX(turn.x + 0.5);
					turn.y = Board.calcTileOffsetY(turn.y - 0.5);
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

	/**
	 * Finds the current moving characters in the game.
	 *
	 * @returns array of moving characters in the game at the current moment
	 */
	private static findMovingCharacters(): Character[] {
		return CHARACTERS.filter((character) => character.isMoving());
	}
}

// run the game if not in testing mode
if (!TESTING) {
	new App();
} else {
	new RunTests();
}
