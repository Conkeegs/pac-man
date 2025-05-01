import Button from "./Button.js";

export enum State {
	PAUSED,
	PLAYING,
}

// #!DEBUG
// const pausePlayButton = board.debug_pausePlayButton!;
// // #!END_DEBUG

// // put the game in a "unpaused" state upon opening the window
// App.addEventListenerToElement("focus", window, () => {
// 	// #!DEBUG
// 	// make sure game isn't already paused to prevent overwrite of "pauseplaybutton" behavior
// 	if (!(pausePlayButton.getState() === State.PAUSED)) {
// 		// #!END_DEBUG
// 		App.animationFrameId = App.startGame();
// 		// #!DEBUG
// 	}
// 	// #!END_DEBUG
// });

// if (Debugging.isEnabled()) {
// 	pausePlayButton.onClick(() => {
// 		App.GAME_PAUSED = !App.GAME_PAUSED;

// 		if (App.GAME_PAUSED) {
// 			App.stopGame(true);
// 			pausePlayButton.setText("Play");
// 			pausePlayButton.setPaused();

// 			return;
// 		}

// 		App.startGame();
// 		pausePlayButton.setText("Pause");
// 		pausePlayButton.setPlaying();
// 	});
// }
// #!END_DEBUG

// #!DEBUG
// update fps counter
// if (App.DEBUG) {
// 	if (frameCount === 0) {
// 		App.debug_frameCountTimeStamp = currentTimestamp;
// 	}

// 	if (currentTimestamp >= App.debug_frameCountTimeStamp + 1000) {
// 		// Update every second
// 		App.board!.debug_fpsCounter!.setText(`FPS:${App.debug_framesCounted}`);

// 		App.debug_framesCounted = 0;
// 		App.debug_frameCountTimeStamp = currentTimestamp;
// 	}
// }
// #!END_DEBUG

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
