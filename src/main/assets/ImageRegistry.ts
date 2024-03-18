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
};

export default class ImageRegistry {
	/**
	 * List of all image file paths.
	 */
	public static readonly IMAGE_LIST: IMAGE_LIST = {
		"pacman-0": getImageSrc("pacman-0"),
		"pacman-1-0": getImageSrc("pacman-1-0"),
		"pacman-1-1": getImageSrc("pacman-1-1"),
		"pacman-1-2": getImageSrc("pacman-1-2"),
		"pacman-1-3": getImageSrc("pacman-1-3"),
		"pacman-2-0": getImageSrc("pacman-2-0"),
		"pacman-2-1": getImageSrc("pacman-2-1"),
		"pacman-2-2": getImageSrc("pacman-2-2"),
		"pacman-2-3": getImageSrc("pacman-2-3"),
	};

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
