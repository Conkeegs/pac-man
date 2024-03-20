import { getJsonSrc } from "../utils/Utils.js";

/**
 * List of all json file paths.
 */
type JSON_LIST = {
	paths: string;
	walls: string;
	turns: string;
};

/**
 * List of all json file paths.
 */
export default class JsonRegistry {
	/**
	 * List of all json file paths.
	 */
	public static readonly JSON_LIST: JSON_LIST = {
		paths: getJsonSrc("paths"),
		walls: getJsonSrc("walls"),
		turns: getJsonSrc("turns"),
	};

	/**
	 * Gets the path to a json file in the game.
	 *
	 * @param name the json file's name
	 * @returns path to game-reliant json file
	 */
	public static getJson(name: keyof JSON_LIST): string {
		return JsonRegistry.JSON_LIST[name];
	}
}
