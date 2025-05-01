import { App } from "../../src/main/App.js";
import Board from "../../src/main/board/Board.js";
import PacMan from "../../src/main/board/boardobject/children/character/PacMan.js";
import MovementDirection from "../../src/main/board/boardobject/children/moveable/MovementDirection.js";
import { create, get } from "../../src/main/utils/Utils.js";
import Test from "../base/Base.js";

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
	public gameLoopTest(): void {
		let lastTimestamp = 0;
		const DESIRED_MS_PER_FRAME = App.DESIRED_MS_PER_FRAME;
		const currentTimestamp = 10 + DESIRED_MS_PER_FRAME;
		const frameCount = 0;
		let accumulatorValue = currentTimestamp - lastTimestamp;

		this.assertOfType("undefined", App["animationFrameId"]);

		App["gameLoop"](lastTimestamp, currentTimestamp, frameCount);

		// app not running so nothing should happen
		this.assertStrictlyEqual(0, App["deltaTimeAccumulator"]);
		this.assertOfType("undefined", App["animationFrameId"]);

		App["running"] = true;
		App.GAME_PAUSED = true;

		App["gameLoop"](lastTimestamp, currentTimestamp, frameCount);

		// app paused so nothing should happen
		this.assertStrictlyEqual(0, App["deltaTimeAccumulator"]);
		this.assertOfType("undefined", App["animationFrameId"]);

		App.GAME_PAUSED = false;
		App["gameLoop"](lastTimestamp, currentTimestamp, frameCount);

		// accumulator should be 0 since falsy "lastTimestamp"
		this.assertStrictlyEqual(0, App["deltaTimeAccumulator"]);
		this.assertOfType("number", App["animationFrameId"]);

		lastTimestamp = 1;
		accumulatorValue = currentTimestamp - lastTimestamp;

		App["gameLoop"](lastTimestamp, currentTimestamp, frameCount);

		while (accumulatorValue >= DESIRED_MS_PER_FRAME) {
			accumulatorValue -= DESIRED_MS_PER_FRAME;
		}

		this.assertStrictlyEqual(accumulatorValue, App["deltaTimeAccumulator"]);
		this.assertOfType("number", App["animationFrameId"]);
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
}
