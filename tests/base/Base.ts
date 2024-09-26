import Logger from "../../src/main/Logger.js";
import type TestException from "./TestException.js";

/**
 * The base test class.
 */
export default abstract class Test {
	/**
	 * The name of this test class.
	 */
	private name: string;

	/**
	 * Creates a `Test` instance.
	 */
	constructor() {
		this.name = Object.getPrototypeOf(this).constructor.name;
	}

	/**
	 * Logic to call when this test fails.
	 *
	 * @param message the message to display in the console
	 * @param error the testing error thrown
	 */
	public fail(message: string, error: TestException): void {
		Logger.log(`${message} in ${this.getName()}\n`, {
			severity: "failure",
			withSymbol: true,
		});

		// raw console log since browser allows expanding/collapsing of errors
		console.log(error);
	}

	/**
	 * Get the name of the test.
	 *
	 * @returns the name of the test
	 */
	public getName(): string {
		return this.name;
	}
}
