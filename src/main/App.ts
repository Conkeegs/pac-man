"use strict";

// #!DEBUG
import RunTests from "../../tests/RunTests.js";
// #!END_DEBUG
import Board from "./board/Board.js";
import { BoardObject } from "./board/boardobject/BoardObject.js";
// #!DEBUG
import { State } from "./board/boardobject/children/Button/PausePlayButton.js";
import type Character from "./board/boardobject/children/character/Character.js";
// #!END_DEBUG
import Moveable from "./board/boardobject/children/moveable/Moveable.js";
import type { Animateable } from "./board/boardobject/mixins/Animateable.js";
import type { Collidable } from "./board/boardobject/mixins/Collidable.js";
import { makeCollidablePositionKey } from "./board/boardobject/mixins/Collidable.js";
import type { Tickable } from "./board/boardobject/mixins/Tickable.js";
import type { GameElement, Position } from "./GameElement.js";
import { TILESIZE } from "./utils/Globals.js";
import { create, defined, get } from "./utils/Utils.js";

/**
 * This class loads the game's UI before initializing the board.
 */
export class App {
	/**
	 * The current animation frame requested by the DOM for the game's loop.
	 */
	private static animationFrameId: number | undefined;
	/**
	 * Increments by the number of milliseconds it takes to render each frame, every frame.
	 */
	private static deltaTimeAccumulator: number = 0;
	/**
	 * The desired frames-per-second that the game should update at.
	 */
	private static readonly DESIRED_FPS: 30 = 30;
	/**
	 * The board that the game displays on.
	 */
	private static board: Board | undefined;
	/**
	 * Whether or not the app is currently running.
	 */
	private static running: boolean = false;

	/**
	 * The rough amount of milliseconds that should pass before the game updates each frame.
	 */
	public static readonly DESIRED_MS_PER_FRAME: number = 1000 / App.DESIRED_FPS;
	/**
	 * Whether or not the game is currently paused.
	 */
	public static GAME_PAUSED: boolean = false;
	/**
	 * An array of classes that extends the `GameElement` class so we can add/remove them when needed,
	 * and also check for duplicates since each of them have unique `name` properties.
	 */
	public static GAME_ELEMENTS: GameElement[] = [];
	/**
	 * An array of classes that extends the `BoardObject` class so we can add/remove them when needed.
	 */
	public static BOARDOBJECTS: BoardObject[] = [];
	/**
	 * An array of classes that extends the `Character` class so we can add/remove them when needed.
	 */
	public static CHARACTERS: Character[] = [];
	/**
	 * An array of classes that extend the `Moveable` class so we can add/remove them when needed.
	 */
	public static MOVEABLES: Moveable[] = [];
	/**
	 * An array of classes that extend the `Animateable` class so we can add/remove them when needed.
	 */
	public static ANIMATEABLES: Animateable[] = [];
	/**
	 * An array of classes that use the `Tickable` mixin..
	 */
	public static TICKABLES: Tickable[] = [];
	/**
	 * An array of `BoardObject`s objects to render CSS changes to the screen for.
	 */
	public static BOARDOBJECTS_TO_RENDER: BoardObject[] = [];
	/**
	 * Event listeners registered in the app.
	 */
	public static EVENT_LISTENERS: {
		/**
		 * Name of the event.
		 */
		eventName: keyof HTMLElementEventMap;
		/**
		 * HTMLElement or window object that the event is registered on.
		 */
		element: HTMLElement | Window;
		/**
		 * Callback registered for the event.
		 *
		 * @param event DOM event to be fired
		 * @returns
		 */
		callback: (event: Event) => void;
	}[] = [];
	/**
	 * A map of `BoardObject` classes that implement the `Collidable` interface so we can add/remove them when needed,
	 * and make sure collision detection for characters is optimized into "groups".
	 */
	public static COLLIDABLES_MAP: { [key: string]: Collidable[] } = {};

	// #!DEBUG
	/**
	 * Whether the game is in debug mode or not.
	 */
	public static DEBUG: boolean = true;
	/**
	 * Whether or not the app is in testing mode.
	 */
	public static TESTING: boolean = true;
	/**
	 * The last timestamp in the game's animation frame that the fps was displayed.
	 */
	private static debug_frameCountTimeStamp: number = 0;
	/**
	 * The number of frames that have passed in about one second.
	 */
	private static debug_framesCounted: number = 0;
	// #!END_DEBUG

	/**
	 * Loads app's resources, loads the board, and starts running the game.
	 */
	public static async run(): Promise<void> {
		if (App.running) {
			return;
		}

		App.board = Board.getInstance();
		const board = App.board;

		await board.create();

		// put the game in a "paused" state upon exiting the window
		App.addEventListenerToElement("blur", window, () => {
			// make sure game isn't already paused to prevent overwrite of "pauseplaybutton" behavior
			if (!App.GAME_PAUSED) {
				App.stopGame(true);
			}
		});

		// #!DEBUG
		const pausePlayButton = board.debug_pausePlayButton!;
		// #!END_DEBUG

		// put the game in a "unpaused" state upon opening the window
		App.addEventListenerToElement("focus", window, () => {
			// #!DEBUG
			// make sure game isn't already paused to prevent overwrite of "pauseplaybutton" behavior
			if (!(pausePlayButton.getState() === State.PAUSED)) {
				// #!END_DEBUG
				App.animationFrameId = App.startGame();
				// #!DEBUG
			}
			// #!END_DEBUG
		});

		// #!DEBUG
		if (App.DEBUG) {
			pausePlayButton.onClick(() => {
				App.GAME_PAUSED = !App.GAME_PAUSED;

				if (App.GAME_PAUSED) {
					App.stopGame(true);
					pausePlayButton.setText("Play");
					pausePlayButton.setPaused();

					return;
				}

				App.startGame();
				pausePlayButton.setText("Pause");
				pausePlayButton.setPlaying();
			});
		}
		// #!END_DEBUG

		// initial start of the game
		App.animationFrameId = App.startGame();
		App.running = true;
	}

	/**
	 * Destroys the application and the resources it's using.
	 */
	public static destroy(): void {
		App.stopGame();

		Object.removeAllKeys(App.COLLIDABLES_MAP);

		for (let i = 0; i < App.EVENT_LISTENERS.length; i++) {
			const eventListenerInfo = App.EVENT_LISTENERS[i]!;

			eventListenerInfo.element.removeEventListener(eventListenerInfo.eventName, eventListenerInfo.callback);
		}

		App.EVENT_LISTENERS.length = 0;
		App.ANIMATEABLES.length = 0;
		App.GAME_ELEMENTS = [];
		App.BOARDOBJECTS.length = 0;
		App.CHARACTERS.length = 0;
		App.MOVEABLES.length = 0;
		App.TICKABLES.length = 0;
		App.BOARDOBJECTS_TO_RENDER.length = 0;
		App.running = false;
		App.GAME_PAUSED = false;

		// #!DEBUG
		App.debug_frameCountTimeStamp = 0;
		App.debug_framesCounted = 0;
		// #!END_DEBUG

		App.board?.destroy();
		App.board = undefined;

		get("game")!.removeAllChildren();
	}

	/**
	 * Starts the main gameloop.
	 */
	private static startGame(): number {
		if (App.GAME_PAUSED) {
			App.GAME_PAUSED = false;

			// play every animateable's animations again upon starting the game from a paused state
			for (let i = 0; i < App.ANIMATEABLES.length; i++) {
				const animateable = App.ANIMATEABLES[i]!;

				// moveables base their animation states on their current direction, so errors
				// will happen if we try and play their animations while they are "stopped"
				if (animateable instanceof Moveable && !animateable.isMoving()) {
					continue;
				}

				animateable.playAnimation();
			}
		}

		return requestAnimationFrame((timeStamp) => App.gameLoop(0, timeStamp, 0));
	}

	/**
	 * Stop the game loop from running.
	 *
	 * @param paused whether or not the game stopped because it paused (defaults to `false`)
	 */
	private static stopGame(paused: boolean = false): void {
		cancelAnimationFrame(App.animationFrameId!);

		App.animationFrameId = undefined;

		// don't reset these variables on pause so the game can properly be un-paused without
		// losing state
		if (!paused) {
			App.deltaTimeAccumulator = 0;
		} else {
			App.GAME_PAUSED = true;
		}

		for (let i = 0; i < App.ANIMATEABLES.length; i++) {
			App.ANIMATEABLES[i]!.stopAnimation();
		}

		// #!DEBUG
		// reset fpscounter variables
		if (App.DEBUG) {
			App.debug_frameCountTimeStamp = 0;
			App.debug_framesCounted = 0;
		}
		// #!END_DEBUG
	}

	/**
	 * The main gameloop of the game. Runs logic every frame and interpolates between updates.
	 *
	 * @param lastTimestamp the last `timeStamp` value
	 * @param currentTimestamp the current timestamp of the game in milliseconds
	 * @param frameCount the amount of frames rendered by the game (updated around every `DESIRED_FPS` frames)
	 */
	private static gameLoop(lastTimestamp: number, currentTimestamp: number, frameCount: number): void {
		if (!App.running || App.GAME_PAUSED) {
			return;
		}

		let deltaTime = currentTimestamp - lastTimestamp;

		// prevent spiral of death
		if (deltaTime > 250) {
			deltaTime = 250;
		}

		// prevents "deltaTime" from being very large at the start and causing position calculations to move
		// board objects very large distances
		if (!lastTimestamp) {
			deltaTime = 0;
			lastTimestamp = currentTimestamp;
		}

		App.deltaTimeAccumulator += deltaTime;

		// #!DEBUG
		// update fps counter
		if (App.DEBUG) {
			if (frameCount === 0) {
				App.debug_frameCountTimeStamp = currentTimestamp;
			}

			if (currentTimestamp >= App.debug_frameCountTimeStamp + 1000) {
				// Update every second
				App.board!.debug_fpsCounter!.setText(`FPS:${App.debug_framesCounted}`);

				App.debug_framesCounted = 0;
				App.debug_frameCountTimeStamp = currentTimestamp;
			}
		}
		// #!END_DEBUG

		const DESIRED_MS_PER_FRAME = App.DESIRED_MS_PER_FRAME;
		// keep track of each moveable's position so we can properly interpolate it every frame
		let oldMoveablePositions: { [key: string]: Position } = {};

		/**
		 * Find an array of moveables that are currently moving, and save their current positions in memory.
		 */
		const getMoveablesAndMapPosition = (): Moveable[] =>
			App.MOVEABLES.filter((moveable) => {
				if (moveable.isMoving()) {
					oldMoveablePositions[moveable.getName()] = moveable.getPosition();

					return true;
				}

				return;
			});

		let movingMoveables: Moveable[] | undefined;

		while (App.deltaTimeAccumulator >= DESIRED_MS_PER_FRAME) {
			movingMoveables = getMoveablesAndMapPosition();

			for (let i = 0; i < movingMoveables.length; i++) {
				movingMoveables[i]!.tick();
			}

			frameCount++;
			App.deltaTimeAccumulator -= DESIRED_MS_PER_FRAME;

			// #!DEBUG
			if (App.DEBUG) {
				App.debug_framesCounted++;
			}
			// #!END_DEBUG
		}

		const alpha = App.deltaTimeAccumulator / DESIRED_MS_PER_FRAME;
		// some moveables may have stopped/started moving after ticking, so refresh this array
		movingMoveables = App.MOVEABLES.filter((moveable) => moveable.isMoving());

		if (movingMoveables.length) {
			for (let i = 0; i < movingMoveables.length; i++) {
				const moveable = movingMoveables[i];

				if (!defined(moveable)) {
					continue;
				}

				const oldMoveablePosition = oldMoveablePositions[moveable.getName()]!;

				if (!defined(oldMoveablePosition)) {
					continue;
				}

				moveable.interpolate(alpha, oldMoveablePosition);
			}
		}

		// check for collisions after interpolation since some collisions (teleporters for example)
		// cause sudden, drastic position changes for Moveable instances. interpolation between the old & new
		// positions will cause these drastic position changes to function unexpectedly
		if (movingMoveables) {
			for (let i = 0; i < movingMoveables.length; i++) {
				const moveable = movingMoveables[i]!;

				if (typeof moveable["_onCollision" as keyof typeof moveable] === "function") {
					App.checkForCollision(moveable as Moveable & Collidable);
				}
			}
		}

		const boardObjectsToRenderCount = App.BOARDOBJECTS_TO_RENDER.length;

		if (boardObjectsToRenderCount) {
			for (let i = 0; i < boardObjectsToRenderCount; i++) {
				const boardObject = App.BOARDOBJECTS_TO_RENDER[i];

				if (!defined(boardObject)) {
					continue;
				}

				(boardObject as BoardObject).render();
			}
		}

		lastTimestamp = currentTimestamp;

		App.animationFrameId = requestAnimationFrame((timeStampNew) =>
			App.gameLoop(lastTimestamp, timeStampNew, frameCount)
		);
	}

	/**
	 * Whether the app is currently running or not.
	 *
	 * @returns boolean if the app is running or not
	 */
	public static isRunning(): boolean {
		return App.running;
	}

	/**
	 * Register a DOM event listener in the app.
	 *
	 * @param eventName name of the event to register in the app
	 * @param element HTMLElement or the window object, which will have the event registered on it
	 * @param callback function to call when event is triggered
	 */
	public static addEventListenerToElement<K extends keyof HTMLElementEventMap>(
		eventName: K,
		element: HTMLElement | Window,
		callback: (event: Event) => void
	): void {
		element.addEventListener(eventName, callback);

		// add to listing so we can clean up event listeners upon app destruction
		App.EVENT_LISTENERS.push({
			eventName,
			element,
			callback,
		});
	}

	/**
	 * Loads the game's resources.
	 *
	 * @returns promise which loads all game resources
	 */
	// private static loadResources(): Promise<[void, void]> {
	// 	return Promise.all([]);
	// }

	/**
	 * Checks for collisions between a moving board object and any collidables around it.
	 *
	 * @param collidable a moveable, collidable board object
	 */
	private static checkForCollision(collidable: Moveable & Collidable): void {
		const centerPosition = collidable.getCenterPosition();
		const tileX = Board.calcTileNumX(centerPosition.x);
		const tileY = Board.calcTileNumY(centerPosition.y);
		const distancePerFrame = collidable.getDistancePerFrame();
		const collisionBox = collidable.getCollisionBox();
		const collidablesMap = App.COLLIDABLES_MAP;
		let positionCollidables: Collidable[] = [];
		let tileSearchCount = 1;

		positionCollidables = positionCollidables.concat(collidablesMap[collidable.getCollidablePositionKey()]!);

		if (distancePerFrame >= collisionBox.right - collisionBox.left) {
			tileSearchCount = Math.ceil(distancePerFrame / TILESIZE);
		}

		// index into the collidables map, and make sure that we also look to the "left/right" and "top/bottom" of
		// character
		for (let i = 1; i <= tileSearchCount; i++) {
			for (const entry of [
				collidablesMap[makeCollidablePositionKey({ x: tileX + i, y: tileY })],
				collidablesMap[makeCollidablePositionKey({ x: tileX - i, y: tileY })],
				collidablesMap[makeCollidablePositionKey({ x: tileX, y: tileY + i })],
				collidablesMap[makeCollidablePositionKey({ x: tileX, y: tileY - i })],
			]) {
				if (entry?.length) {
					positionCollidables = positionCollidables.concat(entry);
				}
			}
		}

		const numPositionCollidables = positionCollidables.length;

		if (numPositionCollidables) {
			// check for collisions between collidable and other collidables
			for (let i = 0; i < numPositionCollidables; i++) {
				const collidedWith = positionCollidables![i]!;

				if (
					// filter out the current board object we're operating on
					collidedWith.getName() === collidable.getName() ||
					// if the collided-with boardobject doesn't allow collidable to collide with it, skip
					!collidedWith.canBeCollidedByTypes.includes(collidable.constructor.name)
				) {
					continue;
				}

				// want to make sure to call the collision-handling function for the collided-with object,
				// since not all Collidables call the "tick()" method and therefore will not run their
				// "_onCollision()" logic if we do not explicity call it here
				if (collidable.isCollidingWithCollidable(collidedWith)) {
					console.log({
						moveable: collidable.getName(),
						collidedWith: collidedWith.getName(),
						distancePerFrame,
						boxSize: collisionBox.right - collisionBox.left,
						tileSearchCount,
					});

					collidedWith._onCollision(collidable);
				}
			}
		}
	}
}

// #!DEBUG
// run the game if not in testing mode
if (!App.TESTING) {
	// #!END_DEBUG
	App.run();
	// #!DEBUG
} else {
	const button = create({ name: "button", html: "Run Tests" });

	button.onclick = () => new RunTests();

	document.body.prepend(button);
}
// #!END_DEBUG
