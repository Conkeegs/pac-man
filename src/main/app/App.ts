"use strict";

import RunTests from "../../../tests/RunTests.js";
import Board from "../board/Board.js";
import type { BoardObject } from "../board/boardobject/BoardObject.js";
import Moveable from "../board/boardobject/children/moveable/Moveable.js";
import type { Animateable } from "../board/boardobject/mixins/Animateable.js";
import type { Collidable } from "../board/boardobject/mixins/Collidable.js";
import Debugging from "../Debugging.js";
import CollisionBox from "../gameelement/CollisionBox.js";
import { GameElement, type Position } from "../gameelement/GameElement.js";
import { cloneInstance, create, get, uniqueId } from "../utils/Utils.js";

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
 * Represents data about event listener registered in the app.
 */
export type EventListenerData = {
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
};

/**
 * This class loads the game's UI before initializing the board.
 */
export class App {
	/**
	 * The singleton-instance of the app.
	 */
	private static instance: App | undefined;
	/**
	 * The current animation frame requested by the DOM for the game's loop.
	 */
	private animationFrameId: number | undefined;
	/**
	 * Increments by the number of milliseconds it takes to render each frame, every frame.
	 */
	private deltaTimeAccumulator: number = 0;
	/**
	 * The board that the game displays on.
	 */
	private board: Board | undefined;
	/**
	 * Whether or not the app is currently running.
	 */
	private running: boolean = false;
	/**
	 * Whether or not the game is currently paused.
	 */
	private gamePaused: boolean = false;
	/**
	 * `Map` of classes that extends the `GameElement` class so we can add/remove them when needed,
	 * and also check for duplicates since each of them have unique `name` properties.
	 */
	private gameElementsMap: Map<number, GameElement> = new Map();
	/**
	 * Ids of game elements that are marked as delete currently.
	 */
	private deletedGameElementIds: Set<number> = new Set();
	/**
	 * Ids of game elements that are queued to be rendered.
	 */
	private toRenderGameElementIds: Set<number> = new Set();
	/**
	 * Ids of game elements that are currently moving.
	 */
	private movingMoveableIds: Set<number> = new Set();
	/**
	 * Ids of game elements that are animateable.
	 */
	private animateableGameElementIds: Set<number> = new Set();
	/**
	 * Event listeners registered in the app.
	 */
	private eventListeners: EventListenerData[] = [];
	/**
	 * A map of `BoardObject` classes that implement the `Collidable` interface so we can add/remove them when needed,
	 * and make sure collision detection for characters is optimized into "groups".
	 */
	private collidablesMap: Map<string, Collidable[]> = new Map();
	/**
	 * The desired frames-per-second that the game should update at.
	 */
	private static readonly DESIRED_FPS: 30 = 30;
	/**
	 * The rough amount of milliseconds that should pass before the game updates each frame.
	 */
	public static readonly DESIRED_MS_PER_FRAME: number = 1000 / App.DESIRED_FPS;

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
	 * Creates the singleton app instance.
	 */
	private constructor() {}

	/**
	 * Get the singleton app instance.
	 *
	 * @returns the singleton app instance
	 */
	public static getInstance(): App {
		return App.instance || (App.instance = new this());
	}

	/**
	 * Gets the map of game elements in the app.
	 *
	 * @returns map of game elements in the app
	 */
	public getGameElementsMap(): Map<number, GameElement> {
		return this.gameElementsMap;
	}

	/**
	 * Get the ids of game elements marked as deleted.
	 *
	 * @returns set ids of game elements marked as deleted
	 */
	public getDeletedGameElementIds(): Set<number> {
		return this.deletedGameElementIds;
	}

	/**
	 * Get the ids of game elements queued for rendering.
	 *
	 * @returns set of ids of game elements queued for rendering
	 */
	public getToRenderGameElementIds(): Set<number> {
		return this.toRenderGameElementIds;
	}

	/**
	 * Get the set of ids of game elements that are moving.
	 *
	 * @returns set of ids of game elements that are moving
	 */
	public getMovingMoveableIds(): Set<number> {
		return this.movingMoveableIds;
	}

	/**
	 * Get the set of ids of game elements that are animateable.
	 *
	 * @returns set of ids of game elements that are animateable
	 */
	public getAnimateableGameElementIds(): Set<number> {
		return this.animateableGameElementIds;
	}

	/**
	 * Get the map of tilekeys to collidables to better-optimize collision
	 * detection.
	 *
	 * @returns map of tilekeys to collidables
	 */
	public getCollidablesMap(): Map<string, Collidable[]> {
		return this.collidablesMap;
	}

	/**
	 * Get whether or not the game is paused.
	 *
	 * @returns whether or not the game is paused
	 */
	public getPaused(): boolean {
		return this.gamePaused;
	}

	/**
	 * Whether the app is currently running or not.
	 *
	 * @returns boolean if the app is running or not
	 */
	public isRunning(): boolean {
		return this.running;
	}

	/**
	 * Loads app's resources, loads the board, and starts running the game.
	 */
	public async run(): Promise<void> {
		if (this.running) {
			return;
		}

		this.board = Board.getInstance();

		await this.board.create();

		// put the game in a "paused" state upon exiting the window
		this.addEventListenerToElement("blur", () => {
			// make sure game isn't already paused to prevent overwrite of "pauseplaybutton" behavior
			if (!this.gamePaused) {
				this.stopGame(true);
			}
		});

		// put the game in a "unpaused" state upon opening the window
		this.addEventListenerToElement("focus", () => {
			this.animationFrameId = this.startGame();
		});

		// initial start of the game
		this.animationFrameId = this.startGame();
		this.running = true;

		// #!DEBUG
		if (Debugging.isEnabled()) {
			Debugging.showHitBoxes();
		}
		// #!END_DEBUG
	}

	/**
	 * Destroys the application and the resources it's using.
	 */
	public destroy(): void {
		this.stopGame();
		Board.getInstance().delete();

		this.gameElementsMap.clear();
		this.collidablesMap.clear();
		this.deletedGameElementIds.clear();
		this.toRenderGameElementIds.clear();
		this.movingMoveableIds.clear();
		this.animateableGameElementIds.clear();

		for (let i = 0; i < this.eventListeners.length; i++) {
			const eventListenerInfo = this.eventListeners[i]!;

			eventListenerInfo.element.removeEventListener(eventListenerInfo.eventName, eventListenerInfo.callback);
		}

		this.eventListeners.length = 0;
		this.running = false;
		this.gamePaused = false;
		this.board = undefined;
		App.instance = undefined;

		get("game")!.removeAllChildren();
	}

	/**
	 * Starts the main gameloop.
	 */
	private startGame(): number {
		if (this.gamePaused) {
			this.gamePaused = false;

			const animateableGameElementIdValues = this.animateableGameElementIds.values();
			let animateableGameElementId = animateableGameElementIdValues.next();

			// play every animateable's animations again upon starting the game from a paused state
			while (!animateableGameElementId.done) {
				const animateable = this.gameElementsMap.get(animateableGameElementId.value)! as Animateable;

				// moveables base their animation states on their current direction, so errors
				// will happen if we try and play their animations while they are "stopped"
				if (animateable instanceof Moveable && !animateable.isMoving()) {
					animateableGameElementId = animateableGameElementIdValues.next();

					continue;
				}

				animateable.playAnimation();

				animateableGameElementId = animateableGameElementIdValues.next();
			}
		}

		return requestAnimationFrame((timeStamp) => this.gameLoop(0, timeStamp, 0));
	}

	/**
	 * Stop the game loop from running.
	 *
	 * @param paused whether or not the game stopped because it paused (defaults to `false`)
	 */
	private stopGame(paused: boolean = false): void {
		cancelAnimationFrame(this.animationFrameId!);

		this.animationFrameId = undefined;

		// don't reset these variables on pause so the game can properly be un-paused without
		// losing state
		if (!paused) {
			this.deltaTimeAccumulator = 0;
		} else {
			this.gamePaused = true;
		}

		const animateableGameElementIdValues = this.animateableGameElementIds.values();
		let animateableGameElementId = animateableGameElementIdValues.next();

		while (!animateableGameElementId.done) {
			(this.gameElementsMap.get(animateableGameElementId.value)! as Animateable).stopAnimation();

			animateableGameElementId = animateableGameElementIdValues.next();
		}
	}

	/**
	 * The main gameloop of the game. Runs main logic every frame.
	 *
	 * @param lastTimestamp the last `timeStamp` value
	 * @param currentTimestamp the current timestamp of the game in milliseconds
	 * @param frameCount the amount of frames rendered by the game (updated around every `DESIRED_MS_PER_FRAME` frames)
	 */
	private gameLoop(lastTimestamp: number, currentTimestamp: number, frameCount: number): void {
		if (!this.running || this.gamePaused) {
			return;
		}

		console.log("IN GAMELOOP");

		const gameUpdateData = this.updateGame(lastTimestamp, currentTimestamp, frameCount);

		this.animationFrameId = requestAnimationFrame((timeStampNew) =>
			this.gameLoop(gameUpdateData.lastTimestamp, timeStampNew, gameUpdateData.newFrameCount)
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
	private updateGame(lastTimestamp: number, currentTimestamp: number, frameCount: number): GameUpdateData {
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

		this.deltaTimeAccumulator += deltaTime;

		const DESIRED_MS_PER_FRAME = App.DESIRED_MS_PER_FRAME;
		// keep track of old moveable data so we can use it later (after ticking)
		const oldMoveableData: OldMoveableData[] = [];
		const movingMoveables: Moveable[] = [];
		const movingMoveableIdValues = this.movingMoveableIds.values();
		let movingMoveableId = movingMoveableIdValues.next();
		const gameElementsMap = this.gameElementsMap;

		// find all moveables that are currently moving, and save their current positions in memory
		while (!movingMoveableId.done) {
			const movingMoveable = gameElementsMap.get(movingMoveableId.value)! as Moveable;

			movingMoveables.push(movingMoveable);
			oldMoveableData.push({
				position: { ...movingMoveable.getPosition() },
				...(typeof movingMoveable["onCollision" as keyof typeof movingMoveable] === "function" && {
					collisionBox: cloneInstance((movingMoveable as Moveable & Collidable).getCollisionBox()),
				}),
			});

			movingMoveableId = movingMoveableIdValues.next();
		}

		const movingMoveablesLength = movingMoveables.length;

		// tick board objects and check for collisions. fixed timestep
		while (this.deltaTimeAccumulator >= DESIRED_MS_PER_FRAME) {
			for (let i = 0; i < movingMoveablesLength; i++) {
				const moveable = movingMoveables[i]!;

				// if (!defined(moveable)) {
				// 	continue;
				// }

				moveable.tick();

				if (moveable.getDeleted() || typeof moveable["onCollision" as keyof typeof moveable] !== "function") {
					continue;
				}

				this.lookForCollisions(moveable as unknown as Moveable & Collidable, oldMoveableData[i]!.collisionBox!);
			}

			frameCount++;
			this.deltaTimeAccumulator -= DESIRED_MS_PER_FRAME;
		}

		// check for needed interpolations of board objects
		if (movingMoveablesLength) {
			const alpha = this.deltaTimeAccumulator / DESIRED_MS_PER_FRAME;

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

		const toRenderGameElementIds = this.toRenderGameElementIds;
		const toRenderGameElementIdValues = toRenderGameElementIds.values();
		let toRenderGameElementId = toRenderGameElementIdValues.next();

		// find all game elements that are currently marked as "to-render" and render them
		while (!toRenderGameElementId.done) {
			(gameElementsMap.get(toRenderGameElementId.value)! as BoardObject).render();

			toRenderGameElementId = toRenderGameElementIdValues.next();
		}

		toRenderGameElementIds.clear();

		const deletedGameElementIds = this.deletedGameElementIds;
		const deletedGameElementIdValues = deletedGameElementIds.values();
		let deletedGameElementId = deletedGameElementIdValues.next();

		// find all game elements that are currently marked as deleted, and remove them from DOM
		while (!deletedGameElementId.done) {
			const idValue = deletedGameElementId.value;
			const deletedGameElement = gameElementsMap.get(idValue)!;

			deletedGameElement.getElement().remove();
			gameElementsMap.delete(idValue);

			deletedGameElementId = deletedGameElementIdValues.next();
		}

		deletedGameElementIds.clear();

		lastTimestamp = currentTimestamp;

		return { lastTimestamp, newFrameCount: frameCount };
	}

	/**
	 * Register a DOM event listener in the app.
	 *
	 * @param eventName name of the event to register in the app
	 * @param element HTMLElement or the window object, which will have the event registered on it
	 * @param callback function to call when event is triggered
	 */
	public addEventListenerToElement<K extends keyof HTMLElementEventMap>(
		eventName: K,
		callback: (event: Event) => void,
		element: HTMLElement | Window = window
	): void {
		element.addEventListener(eventName, callback);

		// add to listing so we can clean up event listeners upon app destruction
		this.eventListeners.push({
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
	private lookForCollisions(collidable: Moveable & Collidable, oldCollisionBox: CollisionBox): void {
		const collidablesMap = this.collidablesMap;
		const tileKeys = collidable.getCurrentTileKeys();
		let positionCollidables: Collidable[] = [];

		// get collidables that are near passed-in collidable
		for (let i = 0; i < tileKeys.length; i++) {
			const tileKey = tileKeys[i]!;

			positionCollidables = positionCollidables.concat(collidablesMap.get(tileKey)!);
		}

		// initial check for collisions between passed-in collidable and other collidables
		App.checkForCollision(collidable, positionCollidables);

		const collisionBox = collidable.getCollisionBox();

		// if the collidable doesn't move a greater distance than its collision box each frame,
		// we can stop here
		if (!(collidable.getDistancePerFrame() >= collisionBox.getWidth()) || collidable.getDeleted()) {
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
			if (!collidablesMap.has(sweptTileKey)) {
				collidablesMap.set(sweptTileKey, []);
			}

			positionCollidables = positionCollidables.concat(collidablesMap.get(sweptTileKey)!);
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
				!otherCollidable.canBeCollidedBy(collidable.constructor.name) ||
				collidable.getDeleted() ||
				otherCollidable.getDeleted()
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
	App.getInstance().run();
	// #!DEBUG
} else {
	const button = create({ name: "button", html: "Run Tests" });

	button.onclick = () => new RunTests();

	document.body.prepend(button);
}
// #!END_DEBUG
