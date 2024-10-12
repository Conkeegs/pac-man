import ImageRegistry from "../../../src/main/assets/ImageRegistry.ts";
import Assertion from "../../base/Assertion.ts";
import Test from "../../base/Base.ts";
import { tests } from "../../base/Decorators.ts";

/**
 * Tests the `src\main\assets\ImageRegistry.ts` class.
 */
@tests(ImageRegistry)
export default class ImageRegistryTest extends Test {
	/**
	 * Test that each image is of type `HTMLImageElement` in the image registry.
	 */
	public imageListTest() {
		for (const image of Object.values(ImageRegistry.IMAGE_LIST)) {
			Assertion.assertTrue(image instanceof HTMLImageElement);
		}
	}

	/**
	 * Test that each game image file is pre-loaded into browser.
	 */
	public createImageTest() {
		for (const imageName of Object.keys(ImageRegistry.IMAGE_LIST)) {
			Assertion.assertTrue(
				Reflect.apply(ImageRegistry["createImage"], undefined, [imageName]) instanceof HTMLImageElement
			);
		}
	}

	/**
	 * Test that we can get a path to an image in the game.
	 */
	public getImageTest() {
		for (const imageName of Object.keys(ImageRegistry.IMAGE_LIST)) {
			Assertion.assertOfType(
				"string",
				ImageRegistry.getImage(imageName as keyof typeof ImageRegistry.IMAGE_LIST)
			);
		}
	}
}
