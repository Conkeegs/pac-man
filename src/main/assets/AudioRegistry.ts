import { getAudioSrc } from "../utils/Utils.js";

/**
 * List of all audio file paths.
 */
type AUDIO_LIST = {
	"food-eat-0": HTMLAudioElement;
	"food-eat-1": HTMLAudioElement;
};

/**
 * List of all audio file paths.
 */
export default class AudioRegistry {
	/**
	 * List of all audio file paths.
	 */
	public static readonly AUDIO_LIST: AUDIO_LIST = {
		"food-eat-0": AudioRegistry.createAudio("food-eat-0"),
		"food-eat-1": AudioRegistry.createAudio("food-eat-1"),
	};

	/**
	 * This function will make sure each game-audio is pre-loaded by the browser.
	 *
	 * @param name the name of the audio file in the audio directory
	 * @returns
	 */
	private static createAudio(name: keyof typeof AudioRegistry.AUDIO_LIST): HTMLAudioElement {
		const audio = new Audio();

		// this will pre-load the audio in the browser
		audio.src = getAudioSrc(name);

		return audio;
	}

	/**
	 * Gets the path to an audio in the game.
	 *
	 * @param name the audio file's name
	 * @returns path to game-reliant audio file
	 */
	public static getAudio(name: keyof AUDIO_LIST): string {
		return AudioRegistry.AUDIO_LIST[name].src;
	}
}
