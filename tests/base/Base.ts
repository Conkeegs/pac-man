import chalk from "chalk";
import Logger from "./Logger.ts";

/**
 * The base test class.
 */
export default abstract class Test {
	/**
	 * The name of this test class.
	 */
	protected abstract name: string;

	/**
	 * Logic to call when this test fails.
	 *
	 * @param message description of the testing failure
	 */
	public fail(message: string, stack?: string): void {
		Logger.log(`${message} in ${chalk.bold(this.getName())}\n`, {
			severity: "failure",
			withSymbol: true,
		});

		if (stack) {
			Logger.log(stack);
		}
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
