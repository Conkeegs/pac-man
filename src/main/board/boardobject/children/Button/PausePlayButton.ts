import Button from "./Button.js";

export enum State {
	PAUSED,
	PLAYING,
}

/**
 * Represents the button used to pause/play the game.
 */
export default class PausePlayButton extends Button {
	/**
	 * Represents the state of this button: "paused" or "playing".
	 */
	private state: State.PAUSED | State.PLAYING = State.PLAYING;

	/**
	 * Creates a `PausePlayButton`
	 *
	 * @param name the unique name/id of the button
	 * @param text the text to be displayed in the button
	 */
	constructor(name: string, text: string) {
		super(name, text);
	}

	/**
	 * Gets the state of the button.
	 *
	 * @returns the state of the button: "paused" or "playing"
	 */
	public getState(): State {
		return this.state;
	}

	/**
	 * Sets the state of the button to "paused".
	 */
	public setPaused(): void {
		this.state = State.PAUSED;
	}

	/**
	 * Sets the state of the button to "playing".
	 */
	public setPlaying(): void {
		this.state = State.PLAYING;
	}
}
