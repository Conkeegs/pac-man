import { App } from "../../src/main/App.js";
import Board from "../../src/main/board/Board.js";
import PacMan from "../../src/main/board/boardobject/children/character/PacMan.js";
import MovementDirection from "../../src/main/board/boardobject/children/moveable/MovementDirection.js";
import { create, get } from "../../src/main/utils/Utils.js";
import Assertion from "../base/Assertion.js";
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

		Assertion.assertTrue(App["board"] instanceof Board);
		Assertion.assertFalse(App.GAME_PAUSED);

		window.dispatchEvent(new FocusEvent("blur"));

		Assertion.assertTrue(App.GAME_PAUSED);

		window.dispatchEvent(new FocusEvent("focus"));

		Assertion.assertFalse(App.GAME_PAUSED);

		Assertion.assertOfType("number", App["animationFrameId"]);
		Assertion.assertTrue(App["running"]);
	}

	/**
	 * Test that app can destroy itself correctly.
	 */
	public async destroyTest(): Promise<void> {
		await App.run();

		// queue render update for a single board object so that render array is not empty
		App.ANIMATEABLES[0]!["queueRenderUpdate"](() => {});

		Assertion.assertNotEmpty(Object.keys(App.COLLIDABLES_MAP));
		Assertion.assertNotEmpty(App.EVENT_LISTENERS);
		Assertion.assertNotEmpty(App.ANIMATEABLES);
		Assertion.assertNotEmpty(App.BOARDOBJECTS);
		Assertion.assertNotEmpty(App.CHARACTERS);
		Assertion.assertNotEmpty(App.MOVEABLES);
		Assertion.assertNotEmpty(App.TICKABLES);
		Assertion.assertNotEmpty(App.BOARDOBJECTS_TO_RENDER);
		Assertion.assertTrue(App["running"]);
		Assertion.assertTrue(App["board"] instanceof Board);
		Assertion.assertNotEmpty(get("game")!.innerHTML);
		Assertion.assertOfType("number", App["animationFrameId"]);

		App.destroy();

		for (let i = 0; i < App.ANIMATEABLES.length; i++) {
			Assertion.assertOfType("undefined", App.ANIMATEABLES[i]!._animationIntervalId);
		}

		Assertion.assertEmpty(Object.keys(App.COLLIDABLES_MAP));
		Assertion.assertEmpty(App.EVENT_LISTENERS);
		Assertion.assertEmpty(App.ANIMATEABLES);
		Assertion.assertEmpty(App.BOARDOBJECTS);
		Assertion.assertEmpty(App.CHARACTERS);
		Assertion.assertEmpty(App.MOVEABLES);
		Assertion.assertEmpty(App.TICKABLES);
		Assertion.assertEmpty(App.BOARDOBJECTS_TO_RENDER);
		Assertion.assertFalse(App["running"]);
		Assertion.assertFalse(App["board"] instanceof Board);
		Assertion.assertEmpty(get("game")!.innerHTML);
		Assertion.assertOfType("undefined", App["animationFrameId"]);
		Assertion.assertStrictlyEqual(0, App["deltaTimeAccumulator"]);
		Assertion.assertFalse(App.GAME_PAUSED);
	}

	/**
	 * Test that app can start correctly.
	 */
	public startGameTest(): void {
		const pacman = new PacMan();

		pacman.startMoving(MovementDirection.RIGHT);

		App["startGame"]();

		Assertion.assertFalse(App.GAME_PAUSED);
		Assertion.assertOfType("number", pacman._animationIntervalId);

		App["stopGame"](true);

		Assertion.assertTrue(App.GAME_PAUSED);
		Assertion.assertOfType("undefined", pacman._animationIntervalId);

		App["startGame"]();

		Assertion.assertFalse(App.GAME_PAUSED);
		Assertion.assertOfType("number", pacman._animationIntervalId);
	}

	/**
	 * Test that app can stop correctly.
	 */
	public stopGameTest(): void {
		const pacman = new PacMan();

		pacman.startMoving(MovementDirection.RIGHT);

		App["startGame"]();

		Assertion.assertFalse(App.GAME_PAUSED);
		Assertion.assertOfType("number", pacman._animationIntervalId);
		Assertion.assertOfType("number", App["deltaTimeAccumulator"]);

		App["stopGame"](true);

		Assertion.assertTrue(App.GAME_PAUSED);
		Assertion.assertOfType("undefined", pacman._animationIntervalId);
		Assertion.assertStrictlyEqual(0, App["deltaTimeAccumulator"]);

		App["startGame"]();

		Assertion.assertFalse(App.GAME_PAUSED);
		Assertion.assertOfType("number", pacman._animationIntervalId);
		Assertion.assertOfType("number", App["deltaTimeAccumulator"]);
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

		Assertion.assertOfType("undefined", App["animationFrameId"]);

		App["gameLoop"](lastTimestamp, currentTimestamp, frameCount);

		// app not running so nothing should happen
		Assertion.assertStrictlyEqual(0, App["deltaTimeAccumulator"]);
		Assertion.assertOfType("undefined", App["animationFrameId"]);

		App["running"] = true;
		App.GAME_PAUSED = true;

		App["gameLoop"](lastTimestamp, currentTimestamp, frameCount);

		// app paused so nothing should happen
		Assertion.assertStrictlyEqual(0, App["deltaTimeAccumulator"]);
		Assertion.assertOfType("undefined", App["animationFrameId"]);

		App.GAME_PAUSED = false;
		App["gameLoop"](lastTimestamp, currentTimestamp, frameCount);

		// accumulator should be 0 since falsy "lastTimestamp"
		Assertion.assertStrictlyEqual(0, App["deltaTimeAccumulator"]);
		Assertion.assertOfType("number", App["animationFrameId"]);

		lastTimestamp = 1;
		accumulatorValue = currentTimestamp - lastTimestamp;

		App["gameLoop"](lastTimestamp, currentTimestamp, frameCount);

		while (accumulatorValue >= DESIRED_MS_PER_FRAME) {
			accumulatorValue -= DESIRED_MS_PER_FRAME;
		}

		Assertion.assertStrictlyEqual(accumulatorValue, App["deltaTimeAccumulator"]);
		Assertion.assertOfType("number", App["animationFrameId"]);
	}

	/**
	 * Test that app can add and manage event listeners correctly.
	 */
	public addEventListenerToElementTest(): void {
		const element = create({
			name: "div",
		});
		let changedVariable = 0;

		Assertion.assertArrayLength(0, App.EVENT_LISTENERS);

		App.addEventListenerToElement("keydown", element, () => {
			changedVariable++;
		});

		Assertion.assertArrayLength(1, App.EVENT_LISTENERS);
		Assertion.assertStrictlyEqual(0, changedVariable);

		element.dispatchEvent(
			new KeyboardEvent("keydown", {
				code: "KeyA",
			})
		);

		Assertion.assertStrictlyEqual(1, changedVariable);
	}
}
