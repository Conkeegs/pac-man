import { App } from "../../../src/main/app/App.js";
import InputHandler from "../../../src/main/app/InputHandler.js";
import type { AbstractConstructor } from "../../../src/main/types.js";
import Test from "../../base/Base.js";
import { tests } from "../../base/Decorators.js";

@tests(InputHandler)
export default class InputHandlerTest extends Test {
	/**
	 * Test that the singleton InputHandler can get its instance.
	 */
	public getInstanceTest(): void {
		this.assertInstanceOf(InputHandler as unknown as AbstractConstructor<InputHandler>, InputHandler.getInstance());
	}

	/**
	 * Test that the input handler can get the current key code entered by the
	 * player.
	 */
	public getCurrentKeyCodeTest(): void {
		const inputHandler = App.getInstance()["inputHandler"]!;

		this.assertOfType("undefined", inputHandler.getCurrentKeyCode());

		inputHandler.startListening();

		const keyCode = "KeyD";

		inputHandler["handleKeyDown"](
			new KeyboardEvent("keydown", {
				code: keyCode,
			})
		);

		this.assertStrictlyEqual(keyCode, inputHandler.getCurrentKeyCode());
	}

	/**
	 * Test that the input handler can handle key down events.
	 */
	public handleKeyDownTest(): void {
		const inputHandler = App.getInstance()["inputHandler"]!;
		const keyCode = "KeyD";

		inputHandler["handleKeyDown"](
			new KeyboardEvent("keydown", {
				code: keyCode,
			})
		);

		this.assertFalse(inputHandler["listenForKeydown"]);
		this.assertStrictlyEqual(keyCode, inputHandler["currentKeyCode"]);
	}

	/**
	 * Test that the input handler can handle key up events.
	 */
	public handleKeyUpTest(): void {
		const inputHandler = App.getInstance()["inputHandler"]!;

		this.assertTrue(inputHandler["listenForKeydown"]);

		inputHandler["handleKeyDown"](
			new KeyboardEvent("keydown", {
				code: "KeyD",
			})
		);

		this.assertFalse(inputHandler["listenForKeydown"]);

		inputHandler["handleKeyUp"]();

		this.assertTrue(inputHandler["listenForKeydown"]);
	}

	/**
	 * Test that the input handler can start listening for input events.
	 */
	public startListeningTest(): void {
		const app = App.getInstance();
		const inputHandler = app["inputHandler"]!;
		const eventListeners = app["eventListeners"];

		this.assertDoesntExist(
			eventListeners.find((eventListenerData) => eventListenerData.callback === inputHandler["handleKeyDown"])
		);
		this.assertDoesntExist(
			eventListeners.find((eventListenerData) => eventListenerData.callback === inputHandler["handleKeyUp"])
		);

		inputHandler.startListening();

		this.assertExists(
			eventListeners.find((eventListenerData) => eventListenerData.callback === inputHandler["handleKeyDown"])
		);
		this.assertExists(
			eventListeners.find((eventListenerData) => eventListenerData.callback === inputHandler["handleKeyUp"])
		);
	}

	/**
	 * Test that the input handler can be destroyed.
	 */
	public destroyTest(): void {
		InputHandler.destroy();

		this.assertOfType("undefined", InputHandler["instance"]);
	}
}
