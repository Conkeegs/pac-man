import { getImageSrc } from "../utils/Utils.js";

/**
 * List of all image file paths.
 */
type IMAGE_LIST = {
	"pacman-0": string;
	"pacman-1-0": string;
	"pacman-1-1": string;
	"pacman-1-2": string;
	"pacman-1-3": string;
	"pacman-2-0": string;
	"pacman-2-1": string;
	"pacman-2-2": string;
	"pacman-2-3": string;
	"blinky-0-0": string;
	"blinky-0-1": string;
	"blinky-0-2": string;
	"blinky-0-3": string;
	"blinky-1-0": string;
	"blinky-1-1": string;
	"blinky-1-2": string;
	"blinky-1-3": string;
	"inky-0-0": string;
	"inky-0-1": string;
	"inky-0-2": string;
	"inky-0-3": string;
	"inky-1-0": string;
	"inky-1-1": string;
	"inky-1-2": string;
	"inky-1-3": string;
	"pinky-0-0": string;
	"pinky-0-1": string;
	"pinky-0-2": string;
	"pinky-0-3": string;
	"pinky-1-0": string;
	"pinky-1-1": string;
	"pinky-1-2": string;
	"pinky-1-3": string;
	"clyde-0-0": string;
	"clyde-0-1": string;
	"clyde-0-2": string;
	"clyde-0-3": string;
	"clyde-1-0": string;
	"clyde-1-1": string;
	"clyde-1-2": string;
	"clyde-1-3": string;
};

/**
 * List of all image file paths.
 */
export default class ImageRegistry {
	/**
	 * List of all image file paths.
	 */
	public static readonly IMAGE_LIST: IMAGE_LIST = {
		"pacman-0": ImageRegistry.createImageSrc("pacman-0"),
		"pacman-1-0": ImageRegistry.createImageSrc("pacman-1-0"),
		"pacman-1-1": ImageRegistry.createImageSrc("pacman-1-1"),
		"pacman-1-2": ImageRegistry.createImageSrc("pacman-1-2"),
		"pacman-1-3": ImageRegistry.createImageSrc("pacman-1-3"),
		"pacman-2-0": ImageRegistry.createImageSrc("pacman-2-0"),
		"pacman-2-1": ImageRegistry.createImageSrc("pacman-2-1"),
		"pacman-2-2": ImageRegistry.createImageSrc("pacman-2-2"),
		"pacman-2-3": ImageRegistry.createImageSrc("pacman-2-3"),
		"blinky-0-0": ImageRegistry.createImageSrc("blinky-0-0"),
		"blinky-0-1": ImageRegistry.createImageSrc("blinky-0-1"),
		"blinky-0-2": ImageRegistry.createImageSrc("blinky-0-2"),
		"blinky-0-3": ImageRegistry.createImageSrc("blinky-0-3"),
		"blinky-1-0": ImageRegistry.createImageSrc("blinky-1-0"),
		"blinky-1-1": ImageRegistry.createImageSrc("blinky-1-1"),
		"blinky-1-2": ImageRegistry.createImageSrc("blinky-1-2"),
		"blinky-1-3": ImageRegistry.createImageSrc("blinky-1-3"),
		"inky-0-0": ImageRegistry.createImageSrc("inky-0-0"),
		"inky-0-1": ImageRegistry.createImageSrc("inky-0-1"),
		"inky-0-2": ImageRegistry.createImageSrc("inky-0-2"),
		"inky-0-3": ImageRegistry.createImageSrc("inky-0-3"),
		"inky-1-0": ImageRegistry.createImageSrc("inky-1-0"),
		"inky-1-1": ImageRegistry.createImageSrc("inky-1-1"),
		"inky-1-2": ImageRegistry.createImageSrc("inky-1-2"),
		"inky-1-3": ImageRegistry.createImageSrc("inky-1-3"),
		"pinky-0-0": ImageRegistry.createImageSrc("pinky-0-0"),
		"pinky-0-1": ImageRegistry.createImageSrc("pinky-0-1"),
		"pinky-0-2": ImageRegistry.createImageSrc("pinky-0-2"),
		"pinky-0-3": ImageRegistry.createImageSrc("pinky-0-3"),
		"pinky-1-0": ImageRegistry.createImageSrc("pinky-1-0"),
		"pinky-1-1": ImageRegistry.createImageSrc("pinky-1-1"),
		"pinky-1-2": ImageRegistry.createImageSrc("pinky-1-2"),
		"pinky-1-3": ImageRegistry.createImageSrc("pinky-1-3"),
		"clyde-0-0": ImageRegistry.createImageSrc("clyde-0-0"),
		"clyde-0-1": ImageRegistry.createImageSrc("clyde-0-1"),
		"clyde-0-2": ImageRegistry.createImageSrc("clyde-0-2"),
		"clyde-0-3": ImageRegistry.createImageSrc("clyde-0-3"),
		"clyde-1-0": ImageRegistry.createImageSrc("clyde-1-0"),
		"clyde-1-1": ImageRegistry.createImageSrc("clyde-1-1"),
		"clyde-1-2": ImageRegistry.createImageSrc("clyde-1-2"),
		"clyde-1-3": ImageRegistry.createImageSrc("clyde-1-3"),
	};

	/**
	 * This function will make sure each game-image is pre-loaded by the browser, so there isn't a noticeable "blink"
	 * effect when characters first change their background images.
	 *
	 * @param name the name of the image in the image directory
	 * @returns
	 */
	private static createImageSrc(name: string): string {
		const image = new Image();

		// this will pre-load the image in the browser
		image.src = getImageSrc(name);

		return image.src;
	}

	/**
	 * Gets the path to an image in the game.
	 *
	 * @param name the image file's name
	 * @returns path to game-reliant image
	 */
	public static getImage(name: keyof IMAGE_LIST): string {
		return ImageRegistry.IMAGE_LIST[name];
	}
}
