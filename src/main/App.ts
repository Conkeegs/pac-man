"use strict";

import RunTests from "../../tests/RunTests.js";
import Board from "./board/Board.js";
import { BoardObject } from "./board/boardobject/BoardObject.js";
import type Character from "./board/boardobject/children/character/Character.js";
import Moveable from "./board/boardobject/children/moveable/Moveable.js";
import type { Animateable } from "./board/boardobject/mixins/Animateable.js";
import type { Collidable } from "./board/boardobject/mixins/Collidable.js";
import type { Tickable } from "./board/boardobject/mixins/Tickable.js";
import Debugging from "./Debugging.js";
import CollisionBox from "./gameelement/CollisionBox.js";
import { GameElement, type Position } from "./gameelement/GameElement.js";
import { cloneInstance, create, defined, get, uniqueId } from "./utils/Utils.js";

/**
 * Represents important data to keep track of before ticking
 * any boardobjects.
 */
type OldMoveableData = {
	/**
	 * Old position of the board object.
	 */
	position: Position;
	/**
	 * Old collision box of the board object.
	 */
	collisionBox?: CollisionBox;
};

/**
 * Represents vital data returned to the gameloop every game update.
 */
type GameUpdateData = {
	/**
	 * The last timestamp the game updated at.
	 */
	lastTimestamp: number;
	/**
	 * The current frame iteration of the game.
	 */
	newFrameCount: number;
};

/**
 * Data used in collision detection to perform CCD (continuous collision detection).
 */
type CCDData = {
	/**
	 * The old state of a collidable before it started ticking.
	 */
	oldCollisionBox: CollisionBox;
	/**
	 * Swept collision box from a collidable's old collision box position
	 * to its collision box's new position.
	 */
	sweptCollisionBox: CollisionBox;
};

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
	 * An array of classes that use the `Collidable` mixin..
	 */
	public static COLLIDABLES: Collidable[] = [];
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
	public static COLLIDABLES_MAP: { [tileKey: string]: Collidable[] } = {};

	// #!DEBUG
	/**
	 * Whether the game is in debug mode or not.
	 */
	public static DEBUG: boolean = true;
	/**
	 * Whether or not the app is in testing mode.
	 */
	public static TESTING: boolean = true;
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

		// put the game in a "unpaused" state upon opening the window
		App.addEventListenerToElement("focus", window, () => {
			App.animationFrameId = App.startGame();
		});

		// initial start of the game
		App.animationFrameId = App.startGame();
		App.running = true;

		// #!DEBUG
		if (Debugging.isEnabled()) {
			Debugging.showHitBoxes();
		}
		// #!END_DEBUG
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
		App.COLLIDABLES.length = 0;
		App.BOARDOBJECTS_TO_RENDER.length = 0;
		App.running = false;
		App.GAME_PAUSED = false;

		Board.getInstance().delete();
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
	}

	/**
	 * The main gameloop of the game. Runs main logic every frame.
	 *
	 * @param lastTimestamp the last `timeStamp` value
	 * @param currentTimestamp the current timestamp of the game in milliseconds
	 * @param frameCount the amount of frames rendered by the game (updated around every `DESIRED_MS_PER_FRAME` frames)
	 */
	private static gameLoop(lastTimestamp: number, currentTimestamp: number, frameCount: number): void {
		if (!App.running || App.GAME_PAUSED) {
			return;
		}

		console.log("IN GAMELOOP");

		const gameUpdateData = App.updateGame(lastTimestamp, currentTimestamp, frameCount);

		App.animationFrameId = requestAnimationFrame((timeStampNew) =>
			App.gameLoop(gameUpdateData.lastTimestamp, timeStampNew, gameUpdateData.newFrameCount)
		);
	}

	/**
	 * Updates game state in a single frame (usually). Sometimes needs to run more than one frame
	 * if player is lagging or on a slow system.
	 *
	 * @param lastTimestamp the last `timeStamp` value
	 * @param currentTimestamp the current timestamp of the game in milliseconds
	 * @param frameCount the amount of frames rendered by the game (updated around every `DESIRED_MS_PER_FRAME` frames)
	 * @returns game state data to be used in the next loop of the game
	 */
	private static updateGame(lastTimestamp: number, currentTimestamp: number, frameCount: number): GameUpdateData {
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

		const DESIRED_MS_PER_FRAME = App.DESIRED_MS_PER_FRAME;
		// keep track of old moveable data so we can use it later (after ticking)
		let oldMoveableData: { [index: number]: OldMoveableData } = {};
		/**
		 * Find an array of moveables that are currently moving, and save their current positions in memory.
		 */
		let movingMoveables: Moveable[] = App.MOVEABLES.filter((moveable, index) => {
			if (moveable.isMoving()) {
				oldMoveableData[index] = {
					position: { ...moveable.getPosition() },
					...(typeof moveable["onCollision" as keyof typeof moveable] === "function" && {
						collisionBox: cloneInstance((moveable as Moveable & Collidable).getCollisionBox()),
					}),
				};

				return true;
			}

			return;
		});
		let movingMoveablesLength = movingMoveables.length;

		// tick board objects and check for collisions. fixed timestep
		while (App.deltaTimeAccumulator >= DESIRED_MS_PER_FRAME) {
			for (let i = 0; i < movingMoveablesLength; i++) {
				const moveable = movingMoveables[i]!;

				// if (!defined(moveable)) {
				// 	continue;
				// }

				moveable.tick();

				if (moveable.getDeleted() || typeof moveable["onCollision" as keyof typeof moveable] !== "function") {
					continue;
				}

				App.lookForCollisions(moveable as unknown as Moveable & Collidable, oldMoveableData[i]!.collisionBox!);
			}

			frameCount++;
			App.deltaTimeAccumulator -= DESIRED_MS_PER_FRAME;
		}

		movingMoveables = movingMoveables.filter((moveable) => !moveable.getDeleted());
		movingMoveablesLength = movingMoveables.length;

		// check for needed interpolations of board objects
		if (movingMoveablesLength) {
			const alpha = App.deltaTimeAccumulator / DESIRED_MS_PER_FRAME;

			for (let i = 0; i < movingMoveablesLength; i++) {
				const moveable = movingMoveables[i]!;

				if (!moveable.getShouldInterpolate()) {
					moveable.setShouldInterpolate(true);

					continue;
				}

				const currentMoveableData = oldMoveableData[i]!;

				// if (!defined(currentMoveableData)) {
				// 	continue;
				// }

				const oldMoveablePosition = currentMoveableData.position;

				if (
					// !defined(oldMoveablePosition) ||
					GameElement.positionsEqual(oldMoveablePosition, moveable.getPosition())
				) {
					continue;
				}

				moveable.interpolate(alpha, oldMoveablePosition);
			}
		}

		const boardObjectsToRenderCount = App.BOARDOBJECTS_TO_RENDER.length;

		// render board objects
		for (let i = 0; i < boardObjectsToRenderCount; i++) {
			const boardObject = App.BOARDOBJECTS_TO_RENDER[i];

			// if (!defined(boardObject)) {
			// 	continue;
			// }

			(boardObject as BoardObject).render();
		}

		lastTimestamp = currentTimestamp;

		return { lastTimestamp, newFrameCount: frameCount };
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
	 * Handles looking for possible collisions between a moving collidable and any collidables around it.
	 * This function doesn't call the actual collision handler methods, but instead will look through tiles
	 * on the board and make sure that collidables that are near each other are checked for collisions.
	 *
	 * @param collidable a moveable, collidable board object
	 * @param oldCollisionBox the old state of `collidable`'s collision box before ticking
	 */
	private static lookForCollisions(collidable: Moveable & Collidable, oldCollisionBox: CollisionBox): void {
		const collidablesMap = App.COLLIDABLES_MAP;
		const tileKeys = collidable.getCurrentTileKeys();
		let positionCollidables: Collidable[] = [];

		// get collidables that are near passed-in collidable
		for (let i = 0; i < tileKeys.length; i++) {
			const tileKey = tileKeys[i]!;

			positionCollidables = positionCollidables.concat(collidablesMap[tileKey]!);
		}

		// initial check for collisions between passed-in collidable and other collidables
		App.checkForCollision(collidable, positionCollidables);

		const collisionBox = collidable.getCollisionBox();

		// if the collidable doesn't move a greater distance than its collision box each frame,
		// we can stop here
		if (!(collidable.getDistancePerFrame() >= collisionBox.getWidth())) {
			return;
		}

		positionCollidables = [];

		const sweptCollisionBox = new CollisionBox(
			`swept-collision-box-${uniqueId()}`,
			Math.min(oldCollisionBox.getLeft(), collisionBox.getLeft()),
			Math.max(oldCollisionBox.getRight(), collisionBox.getRight()),
			Math.min(oldCollisionBox.getTop(), collisionBox.getTop()),
			Math.max(oldCollisionBox.getBottom(), collisionBox.getBottom())
		);
		const sweptTileKeys = sweptCollisionBox.findTileKeys();

		for (let i = 0; i < sweptTileKeys.length; i++) {
			const sweptTileKey = sweptTileKeys[i]!;

			// create a new mapping for the new tile key, if there isn't one yet
			if (!defined(App.COLLIDABLES_MAP[sweptTileKey])) {
				App.COLLIDABLES_MAP[sweptTileKey] = [];
			}

			positionCollidables = positionCollidables.concat(collidablesMap[sweptTileKey]!);
		}

		// check for collisions between collidable and other collidables
		App.checkForCollision(collidable, positionCollidables, {
			oldCollisionBox,
			sweptCollisionBox,
		});
	}

	/**
	 * Takes in a reference collidable `collidable` and any collidables that are either close to it
	 * or within a swept collision box if `collidable` is fast-moving. The function can also perform
	 * CCD. `positionCollidables` are gathered by the `App`'s `lookForCollisions` function.
	 *
	 * @param collidable reference collidable
	 * @param positionCollidables collidables that are either near `collidable` or are within
	 * the swept collision box (if `collidable` is fast-moving)
	 * @param ccdData needed-data if this function is to perform CCD collision detection
	 */
	private static checkForCollision(
		collidable: Collidable,
		positionCollidables: Collidable[],
		ccdData?: CCDData
	): void {
		const positionCollidablesLength = positionCollidables.length;

		if (!positionCollidablesLength) {
			return;
		}

		const oldCollisionBox = ccdData?.oldCollisionBox;
		// if ccdData is provided, use the center position of the old collision box
		// position as the reference point. otherwise, just use collidable's center.
		const sortPosition = !oldCollisionBox ? collidable.getCenterPosition() : oldCollisionBox.getCenterPosition();

		positionCollidables.sort((collidableA, collidableB) => {
			return (
				collidableA.getCollisionBox().findDistanceToPosition(sortPosition) -
				collidableB.getCollisionBox().findDistanceToPosition(sortPosition)
			);
		});

		// if performing CCD, we have to use the whole swept collision box to look for collisions,
		// otherwise just use the collidable's collision box
		const sweptCollisionBox = ccdData?.sweptCollisionBox;
		const collisionBox = !sweptCollisionBox ? collidable.getCollisionBox() : sweptCollisionBox;

		for (let i = 0; i < positionCollidablesLength; i++) {
			const otherCollidable = positionCollidables[i]!;

			if (
				// !defined(otherCollidable) ||
				// filter out the current board object we're operating on
				otherCollidable.getName() === collidable.getName() ||
				// if the collided-with boardobject doesn't allow collidable to collide with it, skip
				!otherCollidable.canBeCollidedBy(collidable.constructor.name)
			) {
				continue;
			}

			// want to make sure to call the collision-handling function for the collided-with object,
			// since not all Collidables call the "tick()" method and therefore will not run their
			// "onCollision()" logic if we do not explicity call it here
			if (collisionBox.isCollidingWith(otherCollidable.getCollisionBox())) {
				otherCollidable.onCollision(collidable);
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

	button.onclick = () => new RunTests("AppTest");

	document.body.prepend(button);
}
// #!END_DEBUG
