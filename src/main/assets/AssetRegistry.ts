import { getAudioSrc, getImageSrc, getJsonSrc } from "../utils/Utils.js";

/**
 * List of all asset file paths.
 */
export type ASSET_LIST = {
	audio: {
		"food-eat-0": HTMLAudioElement;
		"food-eat-1": HTMLAudioElement;
	};

	image: {
		"not-found": HTMLImageElement;
		"pacman-1": HTMLImageElement;
		"pacman-2-0": HTMLImageElement;
		"pacman-2-1": HTMLImageElement;
		"pacman-2-2": HTMLImageElement;
		"pacman-2-3": HTMLImageElement;
		"pacman-3-0": HTMLImageElement;
		"pacman-3-1": HTMLImageElement;
		"pacman-3-2": HTMLImageElement;
		"pacman-3-3": HTMLImageElement;
		"blinky-1-0": HTMLImageElement;
		"blinky-1-1": HTMLImageElement;
		"blinky-1-2": HTMLImageElement;
		"blinky-1-3": HTMLImageElement;
		"blinky-2-0": HTMLImageElement;
		"blinky-2-1": HTMLImageElement;
		"blinky-2-2": HTMLImageElement;
		"blinky-2-3": HTMLImageElement;
		"inky-1-0": HTMLImageElement;
		"inky-1-1": HTMLImageElement;
		"inky-1-2": HTMLImageElement;
		"inky-1-3": HTMLImageElement;
		"inky-2-0": HTMLImageElement;
		"inky-2-1": HTMLImageElement;
		"inky-2-2": HTMLImageElement;
		"inky-2-3": HTMLImageElement;
		"pinky-1-0": HTMLImageElement;
		"pinky-1-1": HTMLImageElement;
		"pinky-1-2": HTMLImageElement;
		"pinky-1-3": HTMLImageElement;
		"pinky-2-0": HTMLImageElement;
		"pinky-2-1": HTMLImageElement;
		"pinky-2-2": HTMLImageElement;
		"pinky-2-3": HTMLImageElement;
		"clyde-1-0": HTMLImageElement;
		"clyde-1-1": HTMLImageElement;
		"clyde-1-2": HTMLImageElement;
		"clyde-1-3": HTMLImageElement;
		"clyde-2-0": HTMLImageElement;
		"clyde-2-1": HTMLImageElement;
		"clyde-2-2": HTMLImageElement;
		"clyde-2-3": HTMLImageElement;
	};

	json: {
		paths: string;
		walls: string;
		turns: string;
		food: string;
	};
};

/**
 * List of all asset file paths.
 */
export default class AssetRegistry {
	/**
	 * List of all image file paths.
	 */
	public static readonly ASSET_LIST: ASSET_LIST = {
		audio: {
			"food-eat-0": AssetRegistry.createAudio("food-eat-0"),
			"food-eat-1": AssetRegistry.createAudio("food-eat-1"),
		},
		image: {
			"not-found": AssetRegistry.createImage("not-found"),
			"pacman-1": AssetRegistry.createImage("pacman-1"),
			"pacman-2-0": AssetRegistry.createImage("pacman-2-0"),
			"pacman-2-1": AssetRegistry.createImage("pacman-2-1"),
			"pacman-2-2": AssetRegistry.createImage("pacman-2-2"),
			"pacman-2-3": AssetRegistry.createImage("pacman-2-3"),
			"pacman-3-0": AssetRegistry.createImage("pacman-3-0"),
			"pacman-3-1": AssetRegistry.createImage("pacman-3-1"),
			"pacman-3-2": AssetRegistry.createImage("pacman-3-2"),
			"pacman-3-3": AssetRegistry.createImage("pacman-3-3"),
			"blinky-1-0": AssetRegistry.createImage("blinky-1-0"),
			"blinky-1-1": AssetRegistry.createImage("blinky-1-1"),
			"blinky-1-2": AssetRegistry.createImage("blinky-1-2"),
			"blinky-1-3": AssetRegistry.createImage("blinky-1-3"),
			"blinky-2-0": AssetRegistry.createImage("blinky-2-0"),
			"blinky-2-1": AssetRegistry.createImage("blinky-2-1"),
			"blinky-2-2": AssetRegistry.createImage("blinky-2-2"),
			"blinky-2-3": AssetRegistry.createImage("blinky-2-3"),
			"inky-1-0": AssetRegistry.createImage("inky-1-0"),
			"inky-1-1": AssetRegistry.createImage("inky-1-1"),
			"inky-1-2": AssetRegistry.createImage("inky-1-2"),
			"inky-1-3": AssetRegistry.createImage("inky-1-3"),
			"inky-2-0": AssetRegistry.createImage("inky-2-0"),
			"inky-2-1": AssetRegistry.createImage("inky-2-1"),
			"inky-2-2": AssetRegistry.createImage("inky-2-2"),
			"inky-2-3": AssetRegistry.createImage("inky-2-3"),
			"pinky-1-0": AssetRegistry.createImage("pinky-1-0"),
			"pinky-1-1": AssetRegistry.createImage("pinky-1-1"),
			"pinky-1-2": AssetRegistry.createImage("pinky-1-2"),
			"pinky-1-3": AssetRegistry.createImage("pinky-1-3"),
			"pinky-2-0": AssetRegistry.createImage("pinky-2-0"),
			"pinky-2-1": AssetRegistry.createImage("pinky-2-1"),
			"pinky-2-2": AssetRegistry.createImage("pinky-2-2"),
			"pinky-2-3": AssetRegistry.createImage("pinky-2-3"),
			"clyde-1-0": AssetRegistry.createImage("clyde-1-0"),
			"clyde-1-1": AssetRegistry.createImage("clyde-1-1"),
			"clyde-1-2": AssetRegistry.createImage("clyde-1-2"),
			"clyde-1-3": AssetRegistry.createImage("clyde-1-3"),
			"clyde-2-0": AssetRegistry.createImage("clyde-2-0"),
			"clyde-2-1": AssetRegistry.createImage("clyde-2-1"),
			"clyde-2-2": AssetRegistry.createImage("clyde-2-2"),
			"clyde-2-3": AssetRegistry.createImage("clyde-2-3"),
		},
		json: {
			paths: getJsonSrc("paths"),
			walls: getJsonSrc("walls"),
			turns: getJsonSrc("turns"),
			food: getJsonSrc("food"),
		},
	};

	/**
	 * This function will make sure each game-audio is pre-loaded by the browser.
	 *
	 * @param name the name of the audio file in the audio directory
	 * @returns
	 */
	private static createAudio(name: keyof ASSET_LIST["audio"]): HTMLAudioElement {
		const audio = new Audio();

		// this will pre-load the audio in the browser
		audio.src = getAudioSrc(name);

		return audio;
	}

	/**
	 * This function will make sure each image is pre-loaded by the browser, so there isn't a noticeable "blink"
	 * effect when characters first change their background images.
	 *
	 * @param name the name of the image in the image directory
	 * @returns
	 */
	private static createImage(name: string): HTMLImageElement {
		const image = new Image();

		// this will pre-load the image in the browser
		image.src = getImageSrc(name);

		return image;
	}

	/**
	 * Gets the path to an audio in the game.
	 *
	 * @param name the audio file's name
	 * @returns path to game-reliant audio file
	 */
	public static getAudioSrc(name: keyof ASSET_LIST["audio"]): string {
		return AssetRegistry.ASSET_LIST["audio"][name].src;
	}

	/**
	 * Gets the path to an image in the game.
	 *
	 * @param name the image file's name
	 * @returns path to game-reliant image
	 */
	public static getImageSrc(name: keyof ASSET_LIST["image"]): string {
		return AssetRegistry.ASSET_LIST["image"][name].src;
	}

	/**
	 * Gets the path to a json file in the game.
	 *
	 * @param name the json file's name
	 * @returns path to game-reliant json file
	 */
	public static getJsonSrc(name: keyof ASSET_LIST["json"]): string {
		return AssetRegistry.ASSET_LIST["json"][name];
	}
}
