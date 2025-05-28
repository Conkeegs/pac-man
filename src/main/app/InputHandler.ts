import { App } from "./App.js";

export default class InputHandler {
	/**
	 * The current keycode entered by the player.
	 */
	private currentKeyCode: string | undefined;
	/**
	 * Whether or not this input handler is currently responding to input.
	 */
	private listenForKeydown: boolean = true;
	/**
	 * The singleton-instance of the input handler.
	 */
	private static instance: InputHandler | undefined;

	/**
	 * Creates the singleton input handler instance.
	 */
	private constructor() {}

	/**
	 * Get the singleton input handler instance.
	 *
	 * @returns the singleton input handler instance
	 */
	public static getInstance(): InputHandler {
		return InputHandler.instance || (InputHandler.instance = new this());
	}

	/**
	 * Gets the current key code entered by the player.
	 *
	 * @returns current key code entered by the player
	 */
	public getCurrentKeyCode(): string | undefined {
		return this.currentKeyCode;
	}

	/**
	 * Handle the player pressing a key.
	 *
	 * @param event the raw keyboard event
	 */
	private handleKeyDown(event: KeyboardEvent): void {
		if (
			!this.listenForKeydown
			// || App.getInstance().getPaused()
		) {
			return;
		}

		event.stopImmediatePropagation();

		// set this to false so events are repeatedly fired when players holds
		// down inputs
		this.listenForKeydown = false;
		this.currentKeyCode = event.code;
	}

	/**
	 * Handle the player letting go of a key.
	 *
	 * @param event the raw keyboard event
	 */
	private handleKeyUp(): void {
		this.listenForKeydown = true;
	}

	/**
	 * Starts listening for player input events.
	 */
	public startListening(): void {
		const app = App.getInstance();

		app.addEventListenerToElement("keydown", this.handleKeyDown as (event: Event) => void);
		app.addEventListenerToElement("keyup", this.handleKeyUp);
	}

	/**
	 * Destroys the input handler singleton instance.
	 */
	public static destroy() {
		InputHandler.instance = undefined;
	}
}
