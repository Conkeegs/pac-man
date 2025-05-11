import Logger from "../../src/main/Logger.js";
import { defined, empty, exists, getCircularReplacer } from "../../src/main/utils/Utils.js";
import TestException from "./TestException.js";

/**
 * Turns JavaScript operators into their english-sentence equivalents for test-assertion logging
 * readability.
 */
enum OperatorsEnglish {
	"===" = "strictly equal to",
	"==" = "loosely equal to",
	"!==" = "not strictly equal to",
	"typeof" = "of type",
	"exists" = "existing",
	"doesntExist" = "not existing",
	"contains" = "contained in",
	"doesntContain" = "not contained in",
	"length" = "the same length as",
	"empty" = "empty",
	"notEmpty" = "not empty",
	"throws" = "a function that throws",
	"changes" = "the changed-to value from",
}

/**
 * The base test class.
 */
export default abstract class Test {
	/**
	 * The name of this test class.
	 */
	private readonly name: string;
	/**
	 * The number of assertions used for the current test function for this test.
	 */
	private currentAssertionCount: number = 0;

	/**
	 * Creates a `Test` instance.
	 */
	constructor() {
		this.name = Object.getPrototypeOf(this).constructor.name;
	}

	/**
	 * Get the number of assertions used for the current test function for this test.
	 */
	public getCurrentAssertionCount(): number {
		return this.currentAssertionCount;
	}

	/**
	 * Set the number of assertions used for the current test function for this test.
	 *
	 * @param count the new count
	 */
	public setCurrentAssertionCount(count: number): void {
		this.currentAssertionCount = count;
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

	/**
	 * Asserts that `expected` is strictly equal to `true`.
	 *
	 * @param expected any Javascript object
	 */
	public assertTrue(expected: unknown): void {
		const actual = true;

		if (expected !== actual) {
			this.formMessageAndThrow(expected, "===", actual);
		}

		this.setCurrentAssertionCount(this.getCurrentAssertionCount() + 1);
	}

	/**
	 * Asserts that `expected` is strictly equal to `false`.
	 *
	 * @param expected any Javascript object
	 */
	public assertFalse(expected: unknown): void {
		const actual = false;

		if (expected !== actual) {
			this.formMessageAndThrow(expected, "===", actual);
		}

		this.setCurrentAssertionCount(this.getCurrentAssertionCount() + 1);
	}

	/**
	 * Asserts that `expected` is of a certain JavaScript type.
	 *
	 * @param expected the expected JavaScript type
	 * @param actual any Javascript object
	 */
	public assertOfType(
		expected: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function",
		actual: unknown
	): void {
		if (expected !== typeof actual) {
			this.formMessageAndThrow(JSON.stringify(actual), "typeof", expected);
		}

		this.setCurrentAssertionCount(this.getCurrentAssertionCount() + 1);
	}

	/**
	 * Asserts that `expected` is strictly equal to `actual`.
	 *
	 * @param expected any Javascript object
	 * @param actual any Javascript object
	 */
	public assertStrictlyEqual(expected: unknown, actual: unknown): void {
		if (expected !== actual) {
			this.formMessageAndThrow(expected, "===", actual);
		}

		this.setCurrentAssertionCount(this.getCurrentAssertionCount() + 1);
	}

	/**
	 * Asserts that `expected` is _not_ strictly equal to `actual`.
	 *
	 * @param expected any Javascript object
	 * @param actual any Javascript object
	 */
	public assertNotStrictlyEqual(expected: unknown, actual: unknown): void {
		if (expected === actual) {
			this.formMessageAndThrow(expected, "!==", actual);
		}

		this.setCurrentAssertionCount(this.getCurrentAssertionCount() + 1);
	}

	/**
	 * Asserts that `expected` is loosely equal to `actual`.
	 *
	 * @param expected any Javascript object
	 * @param actual any Javascript object
	 */
	public assertLooselyEqual(expected: unknown, actual: unknown): void {
		if (expected != actual) {
			this.formMessageAndThrow(expected, "==", actual);
		}

		this.setCurrentAssertionCount(this.getCurrentAssertionCount() + 1);
	}

	/**
	 * Asserts that `expected` exists.
	 *
	 * @param expected any Javascript object
	 */
	public assertExists(expected: unknown): void {
		if (exists(expected) !== true) {
			this.formMessageAndThrow(expected, "exists");
		}

		this.setCurrentAssertionCount(this.getCurrentAssertionCount() + 1);
	}

	/**
	 * Asserts that `expected` doesn't exist.
	 *
	 * @param expected any Javascript object
	 */
	public assertDoesntExist(expected: unknown): void {
		if (exists(expected) === true) {
			this.formMessageAndThrow(expected, "doesntExist");
		}

		this.setCurrentAssertionCount(this.getCurrentAssertionCount() + 1);
	}

	/**
	 * Asserts that `array` contains `expected`.
	 *
	 * @param expected any Javascript object
	 * @param array array to search for `expected` in
	 */
	public assertArrayContains(expected: unknown, array: unknown[]): void {
		if (array.includes(expected) !== true) {
			this.formMessageAndThrow(expected, "contains", array);
		}

		this.setCurrentAssertionCount(this.getCurrentAssertionCount() + 1);
	}

	/**
	 * Asserts that `array` doesn't contain `expected`.
	 *
	 * @param expected any Javascript object
	 * @param array array to search for `expected` in
	 */
	public assertArrayDoesntContain(expected: unknown, array: unknown[]): void {
		if (array.includes(expected) === true) {
			this.formMessageAndThrow(expected, "doesntContain", array);
		}

		this.setCurrentAssertionCount(this.getCurrentAssertionCount() + 1);
	}

	/**
	 * Asserts that `array` contains `expected` number of items.
	 *
	 * @param expected expected number of items
	 * @param array array to get count from
	 */
	public assertArrayLength(expected: number, array: unknown[]): void {
		const arrayLength = array.length;

		if (arrayLength !== expected) {
			this.formMessageAndThrow(expected, "length", arrayLength);
		}

		this.setCurrentAssertionCount(this.getCurrentAssertionCount() + 1);
	}

	/**
	 * Asserts that `expected` is empty.
	 *
	 * @param expected any Javascript object
	 */
	public assertEmpty(expected: object | string | unknown[]): void {
		if (!empty(expected)) {
			this.formMessageAndThrow(expected, "empty");
		}

		this.setCurrentAssertionCount(this.getCurrentAssertionCount() + 1);
	}

	/**
	 * Asserts that `expected` is _not_ empty.
	 *
	 * @param expected any Javascript object
	 */
	public assertNotEmpty(expected: object | unknown[] | string): void {
		if (empty(expected)) {
			this.formMessageAndThrow(expected, "notEmpty");
		}

		this.setCurrentAssertionCount(this.getCurrentAssertionCount() + 1);
	}

	/**
	 * Asserts that `thrower` throws an error with name `errorName` (defaults to "Error").
	 *
	 * @param errorName the name of the error that should be thrown
	 * @param throwerName the actual name of the function that should throw
	 * @param thrower a wrapper-function around the actual function to call
	 */
	public assertThrows(errorName: string, throwerName: string, thrower: () => void): void {
		try {
			thrower.call(undefined);

			this.formMessageAndThrow(throwerName, "throws", "an error");
		} catch (error: any) {
			if (error.constructor.name !== errorName) {
				this.formMessageAndThrow(throwerName, "throws", errorName);
			}

			this.setCurrentAssertionCount(this.getCurrentAssertionCount() + 1);
		}
	}

	/**
	 * Asserts that `expected` is strictly equal to `null`.
	 *
	 * @param expected any Javascript object
	 */
	public assertNull(expected: unknown): void {
		const actual = null;

		if (expected !== actual) {
			this.formMessageAndThrow(expected, "===", actual);
		}

		this.setCurrentAssertionCount(this.getCurrentAssertionCount() + 1);
	}

	/**
	 * Asserts that `expected` is _not_ strictly equal to `null`.
	 *
	 * @param expected any Javascript object
	 */
	public assertNotNull(expected: unknown): void {
		const actual = null;

		if (expected === actual) {
			this.formMessageAndThrow(expected, "!==", actual);
		}

		this.setCurrentAssertionCount(this.getCurrentAssertionCount() + 1);
	}

	/**
	 * Asserts that a property on an object changes value at a future point in time.
	 *
	 * @param expected the expected value that `owner[propertyName]` should change t
	 * @param owner the object which owns the property `propertyName`
	 * @param propertyName the name of the property that should change at some future point in time
	 * @param executionTime the max execution time of this assertion
	 */
	public async assertPropertyChanges(
		expected: unknown,
		owner: any,
		propertyName: string,
		executionTime: number = 3000
	): Promise<void> {
		const ownerName = owner.name ?? owner.constructor.name;
		const retryTime = 100;
		let timeElapsed = 0;

		return new Promise((resolve) => {
			const interval = setInterval(() => {
				timeElapsed += retryTime;

				if (owner[propertyName as keyof typeof owner] === expected) {
					resolve();
					clearInterval(interval);

					this.setCurrentAssertionCount(this.getCurrentAssertionCount() + 1);
				}

				if (timeElapsed >= executionTime) {
					clearInterval(interval);
					this.formMessageAndThrow(expected, "changes", `${ownerName}['${propertyName}']`);
				}
			}, retryTime);
		});
	}

	/**
	 * Forms a user-friendly assertion-failure message to log to the console when the
	 * thrown `TestException` is caught.
	 *
	 * @param expected any Javascript object
	 * @param operator how `expected` should compare to `actual`
	 * @param actual any Javascript object
	 * @throws
	 */
	private formMessageAndThrow(expected: unknown, operator: keyof typeof OperatorsEnglish, actual?: unknown): void {
		let message = `Failed asserting that '${JSON.stringify(expected, getCircularReplacer())}' is ${
			OperatorsEnglish[operator]
		}`;

		if (defined(actual)) {
			message = `${message} '${JSON.stringify(actual, getCircularReplacer())}'`;
		}

		throw new TestException(message);
	}
}
