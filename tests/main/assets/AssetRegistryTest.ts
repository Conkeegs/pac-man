import AssetRegistry from "../../../src/main/assets/AssetRegistry.js";
import Test from "../../base/Base.js";
import { tests } from "../../base/Decorators.js";

/**
 * Tests the `src\main\assets\AssetRegistry.ts` class.
 */
@tests(AssetRegistry)
export default class AssetRegistryTest extends Test {
	/**
	 * Test that each asset is of expected type in the image registry.
	 */
	public assetListTest() {
		for (const audio of Object.values(AssetRegistry.ASSET_LIST["audio"])) {
			this.assertTrue(audio instanceof HTMLAudioElement);
		}

		for (const image of Object.values(AssetRegistry.ASSET_LIST["image"])) {
			this.assertTrue(image instanceof HTMLImageElement);
		}

		for (const json of Object.values(AssetRegistry.ASSET_LIST["json"])) {
			this.assertOfType("string", json);
		}
	}

	/**
	 * Test that each game audio file is pre-loaded into browser.
	 */
	public createAudioTest() {
		for (const eatAudioName of Object.keys(AssetRegistry.ASSET_LIST["audio"])) {
			this.assertTrue(
				Reflect.apply(AssetRegistry["createAudio"], undefined, [eatAudioName]) instanceof HTMLAudioElement
			);
		}
	}

	/**
	 * Test that each game image file is pre-loaded into browser.
	 */
	public createImageTest() {
		for (const imageName of Object.keys(AssetRegistry.ASSET_LIST["image"])) {
			this.assertTrue(
				Reflect.apply(AssetRegistry["createImage"], undefined, [imageName]) instanceof HTMLImageElement
			);
		}
	}

	/**
	 * Test that we can get a path to an audio in the game.
	 */
	public getAudioSrcTest() {
		this.assertOfType("string", AssetRegistry.getAudioSrc("food-eat-0"));
		this.assertOfType("string", AssetRegistry.getAudioSrc("food-eat-1"));
	}

	/**
	 * Test that we can get a path to an image in the game.
	 */
	public getImageSrcTest() {
		for (const imageName of Object.keys(AssetRegistry.ASSET_LIST["image"])) {
			this.assertOfType(
				"string",
				AssetRegistry.getImageSrc(imageName as keyof (typeof AssetRegistry.ASSET_LIST)["image"])
			);
		}
	}

	/**
	 * Test that we can get a path to a JSON file in the game.
	 */
	public getJsonSrcTest() {
		for (const jsonName of Object.keys(AssetRegistry.ASSET_LIST["json"])) {
			this.assertOfType(
				"string",
				AssetRegistry.getJsonSrc(jsonName as keyof (typeof AssetRegistry.ASSET_LIST)["json"])
			);
		}
	}
}
