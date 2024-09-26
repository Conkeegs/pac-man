import JsonRegistry from "../../src/main/assets/JsonRegistry.js";
import Assertion from "../base/Assertion.js";
import Test from "../base/Base.js";
import { tests } from "../base/Decorators.js";

/**
 * Tests the `src\main\assets\JsonRegistry.ts` class.
 */
@tests(JsonRegistry)
export default class JsonRegistryTest extends Test {
	/**
	 * Test that each JSON is of type `string` in the JSON registry.
	 */
	public jsonListTest() {
		for (const json of Object.values(JsonRegistry.JSON_LIST)) {
			Assertion.assertOfType("string", json);
		}
	}

	/**
	 * Test that we can get a path to a JSON file in the game.
	 */
	public getJsonTest() {
		for (const jsonName of Object.keys(JsonRegistry.JSON_LIST)) {
			Assertion.assertOfType("string", JsonRegistry.getJson(jsonName as keyof typeof JsonRegistry.JSON_LIST));
		}
	}
}
