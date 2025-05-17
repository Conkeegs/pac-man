import { App } from "../../src/main/App.js";
import Board from "../../src/main/board/Board.js";
import { BoardObject } from "../../src/main/board/boardobject/BoardObject.js";
import PacMan from "../../src/main/board/boardobject/children/character/PacMan.js";
import Moveable from "../../src/main/board/boardobject/children/moveable/Moveable.js";
import MovementDirection from "../../src/main/board/boardobject/children/moveable/MovementDirection.js";
import MakeCollidable, { type Collidable } from "../../src/main/board/boardobject/mixins/Collidable.js";
import CollisionBox from "../../src/main/gameelement/CollisionBox.js";
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
		await App.run();

		this.assertTrue(App["board"] instanceof Board);
		this.assertFalse(App.GAME_PAUSED);

		window.dispatchEvent(new FocusEvent("blur"));

		this.assertTrue(App.GAME_PAUSED);

		window.dispatchEvent(new FocusEvent("focus"));

		this.assertFalse(App.GAME_PAUSED);

		this.assertOfType("number", App["animationFrameId"]);
		this.assertTrue(App["running"]);
	}

	/**
	 * Test that app can destroy itself correctly.
	 */
	public async destroyTest(): Promise<void> {
		await App.run();

		// queue render update for a single board object so that render array is not empty
		App.ANIMATEABLES[0]!["queueRenderUpdate"](() => {});

		this.assertNotEmpty(Object.keys(App.COLLIDABLES_MAP));
		this.assertNotEmpty(App.EVENT_LISTENERS);
		this.assertNotEmpty(App.ANIMATEABLES);
		this.assertNotEmpty(App.BOARDOBJECTS);
		this.assertNotEmpty(App.CHARACTERS);
		this.assertNotEmpty(App.MOVEABLES);
		this.assertNotEmpty(App.TICKABLES);
		this.assertNotEmpty(App.COLLIDABLES);
		this.assertNotEmpty(App.BOARDOBJECTS_TO_RENDER);
		this.assertTrue(App["running"]);
		this.assertTrue(App["board"] instanceof Board);
		this.assertNotEmpty(get("game")!.innerHTML);
		this.assertOfType("number", App["animationFrameId"]);

		App.destroy();

		for (let i = 0; i < App.ANIMATEABLES.length; i++) {
			this.assertOfType("undefined", App.ANIMATEABLES[i]!._animationIntervalId);
		}

		this.assertEmpty(Object.keys(App.COLLIDABLES_MAP));
		this.assertEmpty(App.EVENT_LISTENERS);
		this.assertEmpty(App.ANIMATEABLES);
		this.assertEmpty(App.BOARDOBJECTS);
		this.assertEmpty(App.CHARACTERS);
		this.assertEmpty(App.MOVEABLES);
		this.assertEmpty(App.TICKABLES);
		this.assertEmpty(App.COLLIDABLES);
		this.assertEmpty(App.BOARDOBJECTS_TO_RENDER);
		this.assertFalse(App["running"]);
		this.assertFalse(App["board"] instanceof Board);
		this.assertEmpty(get("game")!.innerHTML);
		this.assertOfType("undefined", App["animationFrameId"]);
		this.assertStrictlyEqual(0, App["deltaTimeAccumulator"]);
		this.assertFalse(App.GAME_PAUSED);
	}

	/**
	 * Test that app can start correctly.
	 */
	public startGameTest(): void {
		const pacman = new PacMan();

		pacman.startMoving(MovementDirection.RIGHT);

		App["startGame"]();

		this.assertFalse(App.GAME_PAUSED);
		this.assertOfType("number", pacman._animationIntervalId);

		App["stopGame"](true);

		this.assertTrue(App.GAME_PAUSED);
		this.assertOfType("undefined", pacman._animationIntervalId);

		App["startGame"]();

		this.assertFalse(App.GAME_PAUSED);
		this.assertOfType("number", pacman._animationIntervalId);
	}

	/**
	 * Test that app can stop correctly.
	 */
	public stopGameTest(): void {
		const pacman = new PacMan();

		pacman.startMoving(MovementDirection.RIGHT);

		App["startGame"]();

		this.assertFalse(App.GAME_PAUSED);
		this.assertOfType("number", pacman._animationIntervalId);
		this.assertOfType("number", App["deltaTimeAccumulator"]);

		App["stopGame"](true);

		this.assertTrue(App.GAME_PAUSED);
		this.assertOfType("undefined", pacman._animationIntervalId);
		this.assertStrictlyEqual(0, App["deltaTimeAccumulator"]);

		App["startGame"]();

		this.assertFalse(App.GAME_PAUSED);
		this.assertOfType("number", pacman._animationIntervalId);
		this.assertOfType("number", App["deltaTimeAccumulator"]);
	}

	/**
	 * Test that app can call the main game loop correctly.
	 */
	public updateGameTest(): void {
		const DESIRED_MS_PER_FRAME = App.DESIRED_MS_PER_FRAME;

		App["deltaTimeAccumulator"] = DESIRED_MS_PER_FRAME;
		App["updateGame"](0, 0, 0);

		// app not running so nothing should happen
		this.assertStrictlyEqual(0, App["deltaTimeAccumulator"]);

		App["running"] = true;
		App.GAME_PAUSED = true;

		App["deltaTimeAccumulator"] = DESIRED_MS_PER_FRAME;
		App["updateGame"](0, 0, 0);

		// app paused so nothing should happen
		this.assertStrictlyEqual(0, App["deltaTimeAccumulator"]);

		App.GAME_PAUSED = false;
		App["deltaTimeAccumulator"] = DESIRED_MS_PER_FRAME;
		App["updateGame"](0, 0, 0);

		// accumulator should be 0 since falsy "lastTimestamp"
		this.assertStrictlyEqual(0, App["deltaTimeAccumulator"]);

		let movingMoveables: (Moveable & Collidable)[] = [];
		const moveableCount = 10;
		const collidedWithTester = new CollidedWithTester("collided-with-tester", 10, 10);

		// create mock-collidable & moveable classes for updateGame to update
		for (let i = 0; i < moveableCount; i++) {
			const collidableMoveable = new CollidableMoveableTester(`test-moveable-${i}`, 10, 10, 10);

			// mark as deleted to test skipping collision checking and interpolation
			collidableMoveable["deleted"] = true;

			collidableMoveable.startMoving(MovementDirection.RIGHT);
			movingMoveables.push(collidableMoveable);
		}

		// accumulator value here will be greater than our DESIRED_MS_PER_FRAME, so
		// updateGame will attempt to perform physics & state updates more than once to
		// catchup. since we're setting the deltaTimeAccumulator here to our DESIRED_MS_PER_FRAME
		// multiplied by 4, the updateGame function should update each moveable 3 times in one run
		App["deltaTimeAccumulator"] = DESIRED_MS_PER_FRAME * 4;
		App["updateGame"](0, 0, 0);

		for (const moveable of movingMoveables) {
			const distance3Times = moveable.getDistancePerFrame() * 3;

			// make sure updates to movable happen 3 times
			this.assertStrictlyEqual(distance3Times, moveable.getPosition().x);
			// render() calls should have happened too, so transform is updated
			this.assertStrictlyEqual(distance3Times, moveable.getTransform().x);
			this.assertOfType("undefined", moveable["wasCollidedWith" as keyof Moveable]);
			this.assertOfType("undefined", moveable["wasInterpolated" as keyof Moveable]);
		}

		this.assertEmpty(App.BOARDOBJECTS_TO_RENDER);

		// test that moveables that aren't moving don't collide or interpolate
		for (const moveable of movingMoveables) {
			moveable["deleted"] = false;
			moveable["moving"] = false;

			moveable.setPosition({ x: 0, y: 0 });
		}

		App["deltaTimeAccumulator"] = DESIRED_MS_PER_FRAME;
		App["updateGame"](0, 0, 0);

		for (const moveable of movingMoveables) {
			this.assertOfType("undefined", moveable["wasCollidedWith" as keyof Moveable]);
			this.assertOfType("undefined", moveable["wasInterpolated" as keyof Moveable]);
		}

		// moveables that are moving should interpolate, but if they aren't collidable, they shouldn't
		// collide with anything
		for (const moveable of movingMoveables) {
			moveable["moving"] = true;

			moveable.setPosition({ x: 0, y: 0 });
			Object.defineProperty(moveable, "onCollision", { value: undefined, writable: true });
		}

		App["deltaTimeAccumulator"] = DESIRED_MS_PER_FRAME;
		App["updateGame"](0, 0, 0);

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
		// any longer and do not interpolate
		collidedWithTester["onCollision"] = (withCollidable) => {
			withCollidable["deleted"] = true;
		};

		App["deltaTimeAccumulator"] = DESIRED_MS_PER_FRAME;
		App["updateGame"](0, 0, 0);

		for (const moveable of movingMoveables) {
			this.assertOfType("undefined", moveable["wasCollidedWith" as keyof Moveable]);
			this.assertStrictlyEqual(false, moveable["wasInterpolated" as keyof Moveable]);
		}

		for (const moveable of movingMoveables) {
			moveable["deleted"] = false;

			moveable.setPosition({ x: 0, y: 0 });
		}

		// test that collidables collide properly but if they are deleted after collision, they don't
		// interpolate
		collidedWithTester["onCollision"] = (withCollidable) => {
			Object.defineProperty(withCollidable, "wasCollidedWith", { value: true, writable: true });

			withCollidable["deleted"] = true;
		};

		App["deltaTimeAccumulator"] = DESIRED_MS_PER_FRAME;
		App["updateGame"](0, 0, 0);

		for (const moveable of movingMoveables) {
			this.assertStrictlyEqual(true, moveable["wasCollidedWith" as keyof Moveable]);
			this.assertStrictlyEqual(false, moveable["wasInterpolated" as keyof Moveable]);
		}

		// test that moveables collide, but if they are marked as "shouldn't interpolate", they don't interpolate
		for (const moveable of movingMoveables) {
			Object.defineProperty(moveable, "wasCollidedWith", { value: false, writable: true });
			moveable.setPosition({ x: 0, y: 0 });

			moveable["deleted"] = false;
			moveable["_shouldInterpolate"] = false;
		}

		collidedWithTester["onCollision"] = (withCollidable) => {
			Object.defineProperty(withCollidable, "wasCollidedWith", { value: true, writable: true });
		};

		App["deltaTimeAccumulator"] = DESIRED_MS_PER_FRAME;
		App["updateGame"](0, 0, 0);

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

		App["deltaTimeAccumulator"] = DESIRED_MS_PER_FRAME;
		App["updateGame"](0, 0, 0);

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

		App["deltaTimeAccumulator"] = DESIRED_MS_PER_FRAME;
		App["updateGame"](0, 0, 0);

		for (const moveable of movingMoveables) {
			this.assertStrictlyEqual(true, moveable["wasCollidedWith" as keyof Moveable]);
			this.assertStrictlyEqual(true, moveable["wasInterpolated" as keyof Moveable]);
		}

		App.MOVEABLES = [];

		const currentTimestamp = 5;

		// update function will "catchup" 3 times due to this accumulator value
		App["deltaTimeAccumulator"] = DESIRED_MS_PER_FRAME * 4;

		// lastTimestamp should always be returned as equal to currentTimestamp
		// and the new frameCount will be the one passed in here incremented 3 times
		// (due to above deltaTimeAccumulator value)
		const gameUpdateData = App["updateGame"](0, currentTimestamp, 0);

		this.assertStrictlyEqual(currentTimestamp, gameUpdateData.lastTimestamp);
		this.assertStrictlyEqual(3, gameUpdateData.newFrameCount);
	}

	/**
	 * Test that app can tell whether it is running or not.
	 */
	public async isRunningTest(): Promise<void> {
		await App.run();

		this.assertTrue(App.isRunning());

		App.destroy();

		this.assertFalse(App.isRunning());
	}

	/**
	 * Test that app can add and manage event listeners correctly.
	 */
	public addEventListenerToElementTest(): void {
		const element = create({
			name: "div",
		});
		let changedVariable = 0;

		this.assertArrayLength(0, App.EVENT_LISTENERS);

		App.addEventListenerToElement("keydown", element, () => {
			changedVariable++;
		});

		this.assertArrayLength(1, App.EVENT_LISTENERS);
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

		App["lookForCollisions"](referenceCollidable, referenceCollidableCollisionBox);

		this.assertOfType("undefined", referenceCollidable["wasCollidedWith" as keyof Moveable]);

		// move back close to reference collidable so collision is detected
		collidedWithTester.setPosition({
			x: referenceCollidablePosition.x,
			y: referenceCollidablePosition.y,
		});

		App["lookForCollisions"](referenceCollidable, referenceCollidableCollisionBox);

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

		App["lookForCollisions"](referenceCollidable, oldCollisionBox);

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
