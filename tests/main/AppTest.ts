import { App } from "../../src/main/App.js";
import Assertion from "../base/Assertion.js";
import Test from "../base/Base.js";

/**
 * Tests functionality of `src\main\board\boardobject\children\character\Inky.ts` instances.
 */
export default class AppTest extends Test {
	/**
	 * Test that we can get the app instance.
	 */
	public getInstanceTest(): void {
		const app = App.getInstance();

		Assertion.assertTrue(app instanceof App);
	}
}
