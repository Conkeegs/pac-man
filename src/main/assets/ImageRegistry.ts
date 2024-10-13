import { getImageSrc } from "../utils/Utils.js";

/**
 * List of all image file paths.
 */
export type IMAGE_LIST = {
	"not-found": HTMLImageElement;
	"pacman-0": HTMLImageElement;
	"pacman-1-0": HTMLImageElement;
	"pacman-1-1": HTMLImageElement;
	"pacman-1-2": HTMLImageElement;
	"pacman-1-3": HTMLImageElement;
	"pacman-2-0": HTMLImageElement;
	"pacman-2-1": HTMLImageElement;
	"pacman-2-2": HTMLImageElement;
	"pacman-2-3": HTMLImageElement;
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

/**
 * List of all image file paths.
 */
export default class ImageRegistry {
	/**
	 * List of all image file paths.
	 */
	public static readonly IMAGE_LIST: IMAGE_LIST = {
		"not-found": ImageRegistry.createImage("not-found"),
		"pacman-0": ImageRegistry.createImage("pacman-0"),
		"pacman-1-0": ImageRegistry.createImage("pacman-1-0"),
		"pacman-1-1": ImageRegistry.createImage("pacman-1-1"),
		"pacman-1-2": ImageRegistry.createImage("pacman-1-2"),
		"pacman-1-3": ImageRegistry.createImage("pacman-1-3"),
		"pacman-2-0": ImageRegistry.createImage("pacman-2-0"),
		"pacman-2-1": ImageRegistry.createImage("pacman-2-1"),
		"pacman-2-2": ImageRegistry.createImage("pacman-2-2"),
		"pacman-2-3": ImageRegistry.createImage("pacman-2-3"),
		"blinky-1-0": ImageRegistry.createImage("blinky-0-0"),
		"blinky-1-1": ImageRegistry.createImage("blinky-0-1"),
		"blinky-1-2": ImageRegistry.createImage("blinky-0-2"),
		"blinky-1-3": ImageRegistry.createImage("blinky-0-3"),
		"blinky-2-0": ImageRegistry.createImage("blinky-1-0"),
		"blinky-2-1": ImageRegistry.createImage("blinky-1-1"),
		"blinky-2-2": ImageRegistry.createImage("blinky-1-2"),
		"blinky-2-3": ImageRegistry.createImage("blinky-1-3"),
		"inky-1-0": ImageRegistry.createImage("inky-0-0"),
		"inky-1-1": ImageRegistry.createImage("inky-0-1"),
		"inky-1-2": ImageRegistry.createImage("inky-0-2"),
		"inky-1-3": ImageRegistry.createImage("inky-0-3"),
		"inky-2-0": ImageRegistry.createImage("inky-1-0"),
		"inky-2-1": ImageRegistry.createImage("inky-1-1"),
		"inky-2-2": ImageRegistry.createImage("inky-1-2"),
		"inky-2-3": ImageRegistry.createImage("inky-1-3"),
		"pinky-1-0": ImageRegistry.createImage("pinky-0-0"),
		"pinky-1-1": ImageRegistry.createImage("pinky-0-1"),
		"pinky-1-2": ImageRegistry.createImage("pinky-0-2"),
		"pinky-1-3": ImageRegistry.createImage("pinky-0-3"),
		"pinky-2-0": ImageRegistry.createImage("pinky-1-0"),
		"pinky-2-1": ImageRegistry.createImage("pinky-1-1"),
		"pinky-2-2": ImageRegistry.createImage("pinky-1-2"),
		"pinky-2-3": ImageRegistry.createImage("pinky-1-3"),
		"clyde-1-0": ImageRegistry.createImage("clyde-0-0"),
		"clyde-1-1": ImageRegistry.createImage("clyde-0-1"),
		"clyde-1-2": ImageRegistry.createImage("clyde-0-2"),
		"clyde-1-3": ImageRegistry.createImage("clyde-0-3"),
		"clyde-2-0": ImageRegistry.createImage("clyde-1-0"),
		"clyde-2-1": ImageRegistry.createImage("clyde-1-1"),
		"clyde-2-2": ImageRegistry.createImage("clyde-1-2"),
		"clyde-2-3": ImageRegistry.createImage("clyde-1-3"),
	};

	/**
	 * This function will make sure each game-image is pre-loaded by the browser, so there isn't a noticeable "blink"
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
	 * Gets the path to an image in the game.
	 *
	 * @param name the image file's name
	 * @returns path to game-reliant image
	 */
	public static getImage(name: keyof IMAGE_LIST): string {
		return ImageRegistry.IMAGE_LIST[name].src;
	}
}
