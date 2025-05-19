import { App } from "../../src/main/App.js";
import Board from "../../src/main/board/Board.js";
import { BoardObject } from "../../src/main/board/boardobject/BoardObject.js";
import PacMan from "../../src/main/board/boardobject/children/character/PacMan.js";
import Moveable from "../../src/main/board/boardobject/children/moveable/Moveable.js";
import MovementDirection from "../../src/main/board/boardobject/children/moveable/MovementDirection.js";
import MakeAnimateable, { type Animateable } from "../../src/main/board/boardobject/mixins/Animateable.js";
import MakeCollidable, { type Collidable } from "../../src/main/board/boardobject/mixins/Collidable.js";
import CollisionBox from "../../src/main/gameelement/CollisionBox.js";
import { GameElement } from "../../src/main/gameelement/GameElement.js";
import type { AbstractConstructor } from "../../src/main/types.js";
import { cloneInstance, create, get } from "../../src/main/utils/Utils.js";
import Test from "../base/Base.js";

/**
 * Mock `Moveable` and `Collidable` class for testing.
 */
class CollidableMoveableTester extends MakeCollidable(Moveable) {
	public override canBeCollidedByTypes: string[] = [];

	override onCollision(): void {}
	override interpolate(): void {
		Object.defineProperty(this, "wasInterpolated", { value: true, writable: true });
	}
}
/**
 * Mock `Collidable` class for testing.
 */
class CollidedWithTester extends MakeCollidable(BoardObject) {
	public override canBeCollidedByTypes: string[] = [CollidableMoveableTester.name];

	override onCollision(withCollidable: Collidable): void {
		// this shouldn't happen with "deleted" collidables
		Object.defineProperty(this, "wasCollidedWith", { value: true, writable: true });
		Object.defineProperty(withCollidable, "wasCollidedWith", { value: true, writable: true });
	}
}

/**
 * Tests functionality of `src\main\board\boardobject\children\character\Inky.ts` instances.
 */
export default class AppTest extends Test {
	/**
	 * Test that app can start running the game correctly.
	 */
	public async runTest(): Promise<void> {
		const app = App.getInstance();

		// app["startGame"] = () => 0;

		await app.run();

		this.assertTrue(app["board"] instanceof Board);
		this.assertFalse(app["gamePaused"]);

		window.dispatchEvent(new FocusEvent("blur"));

		this.assertTrue(app["gamePaused"]);

		window.dispatchEvent(new FocusEvent("focus"));

		this.assertFalse(app["gamePaused"]);

		this.assertOfType("number", app["animationFrameId"]);
		this.assertTrue(app["running"]);
	}

	/**
	 * Test that the singleton App can get its instance.
	 */
	public getInstanceTest(): void {
		this.assertInstanceOf(App as unknown as AbstractConstructor<App>, App.getInstance());
	}

	/**
	 * Test that the app can gets its map of game elements.
	 */
	public getGameElementsMapTest(): void {
		const gameElement = new (class extends GameElement {})("test-game-element", 0, 0);
		const gameElementsMap = App.getInstance().getGameElementsMap();

		this.assertStrictlyEqual(1, gameElementsMap.size);
		this.assertTrue(gameElementsMap.has(gameElement.getUniqueId()));
	}

	/**
	 * Test that the app can gets its set of game deleted game element ids.
	 */
	public getDeletedGameElementIdsTest(): void {
		const gameElement = new (class extends GameElement {})("test-game-element", 0, 0);

		gameElement.delete();

		const deletedGameElementIds = App.getInstance().getDeletedGameElementIds();

		this.assertStrictlyEqual(1, deletedGameElementIds.size);
		this.assertTrue(deletedGameElementIds.has(gameElement.getUniqueId()));
	}

	/**
	 * Test that the app can gets its set of to-be-rendered game element ids.
	 */
	public getToRenderGameElementIdsTest(): void {
		const gameElement = new (class extends BoardObject {})("test-board-object", 0, 0);

		gameElement["queueRenderUpdate"](() => {});

		const toRenderGameElementIds = App.getInstance().getToRenderGameElementIds();

		this.assertStrictlyEqual(1, toRenderGameElementIds.size);
		this.assertTrue(toRenderGameElementIds.has(gameElement.getUniqueId()));
	}

	/**
	 * Test that the app can gets its set of moving game element ids.
	 */
	public getMovingMoveableIdsTest(): void {
		const gameElement = new (class extends Moveable {})("test-moveable", 0, 0, 0);

		gameElement.startMoving(MovementDirection.RIGHT);

		const movingMoveableIds = App.getInstance().getMovingMoveableIds();

		this.assertStrictlyEqual(1, movingMoveableIds.size);
		this.assertTrue(movingMoveableIds.has(gameElement.getUniqueId()));
	}

	/**
	 * Test that the app can gets its set of animating game element ids.
	 */
	public getAnimateableGameElementIdsTest(): void {
		const gameElement = new (class extends MakeAnimateable(BoardObject) {
			override _NUM_ANIMATION_STATES: number = 1;
		})("test-moveable", 0, 0);
		const animateableGameElementIds = App.getInstance().getAnimateableGameElementIds();

		this.assertStrictlyEqual(1, animateableGameElementIds.size);
		this.assertTrue(animateableGameElementIds.has(gameElement.getUniqueId()));
	}

	/**
	 * Test that the app can gets its map tile keys to collidables.
	 */
	public getCollidablesMapTest(): void {
		const gameElement = new (class extends MakeCollidable(BoardObject) {
			public override canBeCollidedByTypes: string[] = [];
			override onCollision(): void {}
		})("test-moveable", 0, 0);
		const collidablesMap = App.getInstance().getCollidablesMap();

		this.assertStrictlyEqual(1, collidablesMap.size);

		const tileKey = gameElement.getCollisionBox().findTileKeys()[0]!;

		this.assertTrue(collidablesMap.has(tileKey));
		this.assertStrictlyEqual(gameElement, collidablesMap.get(tileKey)!.values().next().value);
	}

	/**
	 * Test that the app can tell when the game is paused.
	 */
	public getPausedTest(): void {
		const app = App.getInstance();

		this.assertFalse(app.getPaused());

		app["stopGame"](true);

		this.assertTrue(app.getPaused());
	}

	/**
	 * Test that app can destroy itself correctly.
	 */
	public async destroyTest(): Promise<void> {
		const app = App.getInstance();

		await app.run();

		const gameElementsMap = app.getGameElementsMap();
		let animateableGameElementIdValues = app.getAnimateableGameElementIds().values();

		// queue render update for a single board object
		(gameElementsMap.get(animateableGameElementIdValues.next().value!) as BoardObject)["queueRenderUpdate"](
			() => {}
		);

		this.assertTrue(app.getCollidablesMap().size > 0);
		this.assertNotEmpty(app["eventListeners"]);
		this.assertTrue(app["running"]);
		this.assertTrue(app["board"] instanceof Board);
		this.assertNotEmpty(get("game")!.innerHTML);
		this.assertOfType("number", app["animationFrameId"]);

		app.destroy();

		animateableGameElementIdValues = app.getAnimateableGameElementIds().values();
		let animateableGameElementId = animateableGameElementIdValues.next();

		while (!animateableGameElementId.done) {
			this.assertOfType(
				"undefined",
				(gameElementsMap.get(animateableGameElementId.value) as Animateable)._animationIntervalId
			);

			animateableGameElementId = animateableGameElementIdValues.next();
		}

		this.assertEmpty(Object.keys(app["collidablesMap"]));
		this.assertEmpty(app["eventListeners"]);
		this.assertFalse(app["running"]);
		this.assertFalse(app["board"] instanceof Board);
		this.assertEmpty(get("game")!.innerHTML);
		this.assertOfType("undefined", app["animationFrameId"]);
		this.assertStrictlyEqual(0, app["deltaTimeAccumulator"]);
		this.assertFalse(app["gamePaused"]);
	}

	/**
	 * Test that app can start correctly.
	 */
	public startGameTest(): void {
		const pacman = new PacMan();
		const app = App.getInstance();

		pacman.startMoving(MovementDirection.RIGHT);

		app["startGame"]();

		this.assertFalse(app["gamePaused"]);
		this.assertOfType("number", pacman._animationIntervalId);

		app["stopGame"](true);

		this.assertTrue(app["gamePaused"]);
		this.assertOfType("undefined", pacman._animationIntervalId);

		app["startGame"]();

		this.assertFalse(app["gamePaused"]);
		this.assertOfType("number", pacman._animationIntervalId);
	}

	/**
	 * Test that app can stop correctly.
	 */
	public stopGameTest(): void {
		const pacman = new PacMan();
		const app = App.getInstance();

		pacman.startMoving(MovementDirection.RIGHT);

		app["startGame"]();

		this.assertFalse(app["gamePaused"]);
		this.assertOfType("number", pacman._animationIntervalId);
		this.assertOfType("number", app["deltaTimeAccumulator"]);

		app["stopGame"](true);

		this.assertTrue(app["gamePaused"]);
		this.assertOfType("undefined", pacman._animationIntervalId);
		this.assertStrictlyEqual(0, app["deltaTimeAccumulator"]);

		app["startGame"]();

		this.assertFalse(app["gamePaused"]);
		this.assertOfType("number", pacman._animationIntervalId);
		this.assertOfType("number", app["deltaTimeAccumulator"]);
	}

	/**
	 * Test that app can call the main game loop correctly.
	 */
	public updateGameTest(): void {
		const DESIRED_MS_PER_FRAME = App.DESIRED_MS_PER_FRAME;
		const app = App.getInstance();

		app["deltaTimeAccumulator"] = DESIRED_MS_PER_FRAME;
		app["updateGame"](0, 0, 0);

		// app not running so nothing should happen
		this.assertStrictlyEqual(0, app["deltaTimeAccumulator"]);

		app["running"] = true;
		app["gamePaused"] = true;

		app["deltaTimeAccumulator"] = DESIRED_MS_PER_FRAME;
		app["updateGame"](0, 0, 0);

		// app paused so nothing should happen
		this.assertStrictlyEqual(0, app["deltaTimeAccumulator"]);

		app["gamePaused"] = false;
		app["deltaTimeAccumulator"] = DESIRED_MS_PER_FRAME;
		app["updateGame"](0, 0, 0);

		// accumulator should be 0 since falsy "lastTimestamp"
		this.assertStrictlyEqual(0, app["deltaTimeAccumulator"]);

		let movingMoveables: (Moveable & Collidable)[] = [];
		const moveableCount = 10;
		const collidedWithTester = new CollidedWithTester("collided-with-tester", 10, 10);

		// create mock-collidable & moveable classes for updateGame to update
		for (let i = 0; i < moveableCount; i++) {
			const collidableMoveable = new CollidableMoveableTester(`test-moveable-${i}`, 10, 10, 10);

			// mark as deleted to test skipping collision checking
			collidableMoveable["deleted"] = true;

			collidableMoveable.startMoving(MovementDirection.RIGHT);
			movingMoveables.push(collidableMoveable);
		}

		// accumulator value here will be greater than our DESIRED_MS_PER_FRAME, so
		// updateGame will attempt to perform physics & state updates more than once to
		// catchup. since we're setting the deltaTimeAccumulator here to our DESIRED_MS_PER_FRAME
		// multiplied by 4, the updateGame function should update each moveable 3 times in one run
		app["deltaTimeAccumulator"] = DESIRED_MS_PER_FRAME * 4;
		app["updateGame"](0, 0, 0);

		for (const moveable of movingMoveables) {
			const distance3Times = moveable.getDistancePerFrame() * 3;

			// make sure updates to movable happen 3 times
			this.assertStrictlyEqual(distance3Times, moveable.getPosition().x);
			// render() calls should have happened too, so transform is updated
			this.assertStrictlyEqual(distance3Times, moveable.getTransform().x);
			this.assertOfType("undefined", moveable["wasCollidedWith" as keyof Moveable]);
			this.assertTrue(moveable["wasInterpolated" as keyof Moveable]);
		}

		this.assertStrictlyEqual(0, app.getToRenderGameElementIds().size);
		this.assertStrictlyEqual(0, app.getDeletedGameElementIds().size);

		// test that moveables that aren't moving don't collide or interpolate
		for (const moveable of movingMoveables) {
			moveable["deleted"] = false;
			moveable.stopMoving();

			Object.defineProperty(moveable, "wasInterpolated", { value: false, writable: true });
			moveable.setPosition({ x: 0, y: 0 });
		}

		app["deltaTimeAccumulator"] = DESIRED_MS_PER_FRAME;
		app["updateGame"](0, 0, 0);

		for (const moveable of movingMoveables) {
			this.assertOfType("undefined", moveable["wasCollidedWith" as keyof Moveable]);
			this.assertFalse(moveable["wasInterpolated" as keyof Moveable]);
		}

		// moveables that are moving should interpolate, but if they aren't collidable, they shouldn't
		// collide with anything
		for (const moveable of movingMoveables) {
			moveable.startMoving(MovementDirection.RIGHT);

			moveable.setPosition({ x: 0, y: 0 });
			Object.defineProperty(moveable, "onCollision", { value: undefined, writable: true });
		}

		app["deltaTimeAccumulator"] = DESIRED_MS_PER_FRAME;
		app["updateGame"](0, 0, 0);

		for (const moveable of movingMoveables) {
			this.assertOfType("undefined", moveable["wasCollidedWith" as keyof Moveable]);
			this.assertStrictlyEqual(true, moveable["wasInterpolated" as keyof Moveable]);
		}

		for (const moveable of movingMoveables) {
			moveable["moving"] = true;
			// re-define collision method so moveable is again considered "collidable"
			moveable["onCollision"] = () => {};

			moveable.setPosition({ x: 0, y: 0 });
			Object.defineProperty(moveable, "wasInterpolated", { value: false });
		}

		// test that collidables that are deleted after they tick are not involved in collisions
		// any longer
		collidedWithTester["onCollision"] = (withCollidable) => {
			withCollidable["deleted"] = true;
		};

		app["deltaTimeAccumulator"] = DESIRED_MS_PER_FRAME;
		app["updateGame"](0, 0, 0);

		for (const moveable of movingMoveables) {
			this.assertOfType("undefined", moveable["wasCollidedWith" as keyof Moveable]);
		}

		for (const moveable of movingMoveables) {
			moveable["deleted"] = false;

			moveable.setPosition({ x: 0, y: 0 });
		}

		// test that collidables collide properly but if they are deleted after collision, they still
		// interpolate
		collidedWithTester["onCollision"] = (withCollidable) => {
			Object.defineProperty(withCollidable, "wasCollidedWith", { value: true, writable: true });

			withCollidable["deleted"] = true;
		};

		app["deltaTimeAccumulator"] = DESIRED_MS_PER_FRAME;
		app["updateGame"](0, 0, 0);

		for (const moveable of movingMoveables) {
			this.assertStrictlyEqual(true, moveable["wasCollidedWith" as keyof Moveable]);
			this.assertStrictlyEqual(true, moveable["wasInterpolated" as keyof Moveable]);
		}

		// test that moveables collide, but if they are marked as "shouldn't interpolate", they don't interpolate
		for (const moveable of movingMoveables) {
			Object.defineProperty(moveable, "wasCollidedWith", { value: false, writable: true });
			Object.defineProperty(moveable, "wasInterpolated", { value: false, writable: true });
			moveable.setPosition({ x: 0, y: 0 });

			moveable["deleted"] = false;
			moveable["_shouldInterpolate"] = false;
		}

		collidedWithTester["onCollision"] = (withCollidable) => {
			Object.defineProperty(withCollidable, "wasCollidedWith", { value: true, writable: true });
		};

		app["deltaTimeAccumulator"] = DESIRED_MS_PER_FRAME;
		app["updateGame"](0, 0, 0);

		for (const moveable of movingMoveables) {
			this.assertStrictlyEqual(true, moveable["wasCollidedWith" as keyof Moveable]);
			this.assertStrictlyEqual(false, moveable["wasInterpolated" as keyof Moveable]);
		}

		// test that moveables collide, but if their old position matches their new position after ticking,
		// they don't interpolate
		for (const moveable of movingMoveables) {
			Object.defineProperty(moveable, "wasCollidedWith", { value: false, writable: true });
			// distancePerFrame of zero means no movement/position changes
			Object.defineProperty(moveable, "distancePerFrame", { value: 0, writable: true });
			moveable.setPosition({ x: 0, y: 0 });

			moveable["_shouldInterpolate"] = true;
		}

		app["deltaTimeAccumulator"] = DESIRED_MS_PER_FRAME;
		app["updateGame"](0, 0, 0);

		for (const moveable of movingMoveables) {
			this.assertStrictlyEqual(true, moveable["wasCollidedWith" as keyof Moveable]);
			this.assertStrictlyEqual(false, moveable["wasInterpolated" as keyof Moveable]);
		}

		// test that both collision and interpolation work at the same time
		for (const moveable of movingMoveables) {
			Object.defineProperty(moveable, "wasCollidedWith", { value: false, writable: true });
			// distancePerFrame of zero means no movement/position changes
			Object.defineProperty(moveable, "distancePerFrame", { value: 0.2, writable: true });
			moveable.setPosition({ x: 0, y: 0 });
		}

		app["deltaTimeAccumulator"] = DESIRED_MS_PER_FRAME;
		app["updateGame"](0, 0, 0);

		for (const moveable of movingMoveables) {
			this.assertStrictlyEqual(true, moveable["wasCollidedWith" as keyof Moveable]);
			this.assertStrictlyEqual(true, moveable["wasInterpolated" as keyof Moveable]);
		}

		// App.MOVEABLES = [];

		const currentTimestamp = 5;

		// update function will "catchup" 3 times due to this accumulator value
		app["deltaTimeAccumulator"] = DESIRED_MS_PER_FRAME * 4;

		// lastTimestamp should always be returned as equal to currentTimestamp
		// and the new frameCount will be the one passed in here incremented 3 times
		// (due to above deltaTimeAccumulator value)
		const gameUpdateData = app["updateGame"](0, currentTimestamp, 0);

		this.assertStrictlyEqual(currentTimestamp, gameUpdateData.lastTimestamp);
		this.assertStrictlyEqual(3, gameUpdateData.newFrameCount);
	}

	/**
	 * Test that app can tell whether it is running or not.
	 */
	public async isRunningTest(): Promise<void> {
		const app = App.getInstance();

		await app.run();

		this.assertTrue(app.isRunning());

		app.destroy();

		this.assertFalse(app.isRunning());
	}

	/**
	 * Test that app can add and manage event listeners correctly.
	 */
	public addEventListenerToElementTest(): void {
		const element = create({
			name: "div",
		});
		let changedVariable = 0;
		const app = App.getInstance();

		this.assertArrayLength(0, app["eventListeners"]);

		app.addEventListenerToElement("keydown", element, () => {
			changedVariable++;
		});

		this.assertArrayLength(1, app["eventListeners"]);
		this.assertStrictlyEqual(0, changedVariable);

		element.dispatchEvent(
			new KeyboardEvent("keydown", {
				code: "KeyA",
			})
		);

		this.assertStrictlyEqual(1, changedVariable);
	}

	/**
	 * Test that the app can properly look for position collidables.
	 */
	public lookForCollisionsTest(): void {
		const referenceCollidable = new CollidableMoveableTester("test-collidable", 10, 10, 10);
		const collidedWithTester = new CollidedWithTester("collided-with-tester", 10, 10);
		const referenceCollidablePosition = referenceCollidable.getPosition();
		const referenceCollidableCollisionBox = referenceCollidable.getCollisionBox();

		// set this collidable far away from our reference collidable and test that
		// they don't collide
		collidedWithTester.setPosition({
			x: referenceCollidablePosition.x + 100,
			y: referenceCollidablePosition.y + 100,
		});

		const app = App.getInstance();

		app["lookForCollisions"](referenceCollidable, referenceCollidableCollisionBox);

		this.assertOfType("undefined", referenceCollidable["wasCollidedWith" as keyof Moveable]);

		// move back close to reference collidable so collision is detected
		collidedWithTester.setPosition({
			x: referenceCollidablePosition.x,
			y: referenceCollidablePosition.y,
		});

		app["lookForCollisions"](referenceCollidable, referenceCollidableCollisionBox);

		this.assertStrictlyEqual(true, referenceCollidable["wasCollidedWith" as keyof Moveable]);

		const oldCollisionBox = cloneInstance(referenceCollidableCollisionBox);

		// reset this
		Object.defineProperty(referenceCollidable, "wasCollidedWith", { value: false });
		// set this collidable "in between" our old collision box and the new one for CCD testing
		collidedWithTester.setPosition({
			x: referenceCollidablePosition.x + 50,
			y: referenceCollidablePosition.y + 50,
		});
		// update position of reference collidable so its collision box child moved with it
		referenceCollidable.setPosition({
			x: referenceCollidablePosition.x + 100,
			y: referenceCollidablePosition.y + 100,
		});
		// make distance per frame larger than dimensions of collidable, so we use CCD to look for
		// collidables it may have "tunneled" through
		Object.defineProperty(referenceCollidable, "distancePerFrame", { value: referenceCollidable.getWidth() + 1 });

		app["lookForCollisions"](referenceCollidable, oldCollisionBox);

		// CCD should have found "collidedWithTester"
		this.assertStrictlyEqual(true, referenceCollidable["wasCollidedWith" as keyof Moveable]);
		this.assertStrictlyEqual(true, collidedWithTester["wasCollidedWith" as keyof Collidable]);
	}

	/**
	 * Test that the app can detect and call collision handlers.
	 */
	public checkForCollisionTest(): void {
		const referenceCollidable = new CollidableMoveableTester("test-collidable", 10, 10, 10);
		const positionCollidables: Collidable[] = [];

		// empty position collidables means no collision
		App["checkForCollision"](referenceCollidable, positionCollidables);

		this.assertOfType("undefined", referenceCollidable["wasCollidedWith" as keyof Moveable]);

		positionCollidables.push(
			new CollidedWithTester("collided-with-tester-1", 10, 10),
			new CollidedWithTester("collided-with-tester-2", 10, 10),
			new CollidedWithTester("collided-with-tester-3", 10, 10)
		);

		const lastCollidable = positionCollidables[2]!;

		// move last collidable closest to center, so this one should collide with
		// the reference collidable first
		lastCollidable.setPosition({
			x: 3,
			y: 3,
		});

		App["checkForCollision"](referenceCollidable, positionCollidables);

		this.assertStrictlyEqual(true, referenceCollidable["wasCollidedWith" as keyof Moveable]);
		this.assertStrictlyEqual(true, lastCollidable["wasCollidedWith" as keyof Collidable]);

		Object.defineProperty(referenceCollidable, "wasCollidedWith", { value: false, writable: true });
		Object.defineProperty(lastCollidable, "wasCollidedWith", { value: false, writable: true });

		const firstCollidable = positionCollidables[0]!;

		// now this first collidable is closest, so should collide with our reference collidable
		firstCollidable.setPosition({
			x: 5,
			y: 5,
		});

		// even with swept collision box, first collidable should be detected first
		App["checkForCollision"](referenceCollidable, positionCollidables, {
			oldCollisionBox: referenceCollidable.getCollisionBox(),
			// represents a swept bounding box from the beginning of our reference collidable's
			// old position to 100 pixels to the right
			sweptCollisionBox: new CollisionBox("test-swept-collision-box", 0, 100, 0, 10),
		});

		this.assertStrictlyEqual(true, referenceCollidable["wasCollidedWith" as keyof Moveable]);
		this.assertStrictlyEqual(true, firstCollidable["wasCollidedWith" as keyof Collidable]);
		this.assertStrictlyEqual(true, lastCollidable["wasCollidedWith" as keyof Collidable]);
	}
}
