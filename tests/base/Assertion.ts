import { defined, empty, exists, getCircularReplacer } from "../../src/main/utils/Utils.js";
import TestException from "./TestException.js";

/**
 * Turns JavaScript operators into their english-sentence equivalents for test logging
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
 * Class used for making testing assertions.
 */
export default abstract class Assertion {
	/**
	 * Asserts that `expected` is strictly equal to `true`.
	 *
	 * @param expected any Javascript object
	 */
	public static assertTrue(expected: unknown): void {
		const actual = true;

		if (expected !== actual) {
			Assertion.formMessageAndThrow(expected, "===", actual);
		}
	}

	/**
	 * Asserts that `expected` is strictly equal to `false`.
	 *
	 * @param expected any Javascript object
	 */
	public static assertFalse(expected: unknown): void {
		const actual = false;

		if (expected !== actual) {
			Assertion.formMessageAndThrow(expected, "===", actual);
		}
	}

	/**
	 * Asserts that `expected` is of a certain JavaScript type.
	 *
	 * @param expected the expected JavaScript type
	 * @param actual any Javascript object
	 */
	public static assertOfType(
		expected: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function",
		actual: unknown
	): void {
		if (expected !== typeof actual) {
			Assertion.formMessageAndThrow(expected, "typeof", actual);
		}
	}

	/**
	 * Asserts that `expected` is strictly equal to `actual`.
	 *
	 * @param expected any Javascript object
	 * @param actual any Javascript object
	 */
	public static assertStrictlyEqual(expected: unknown, actual: unknown): void {
		if (expected !== actual) {
			Assertion.formMessageAndThrow(expected, "===", actual);
		}
	}

	/**
	 * Asserts that `expected` is _not_ strictly equal to `actual`.
	 *
	 * @param expected any Javascript object
	 * @param actual any Javascript object
	 */
	public static assertNotStrictlyEqual(expected: unknown, actual: unknown): void {
		if (expected === actual) {
			Assertion.formMessageAndThrow(expected, "!==", actual);
		}
	}

	/**
	 * Asserts that `expected` is loosely equal to `actual`.
	 *
	 * @param expected any Javascript object
	 * @param actual any Javascript object
	 */
	public static assertLooselyEqual(expected: unknown, actual: unknown): void {
		if (expected != actual) {
			Assertion.formMessageAndThrow(expected, "==", actual);
		}
	}

	/**
	 * Asserts that `expected` exists.
	 *
	 * @param expected any Javascript object
	 */
	public static assertExists(expected: unknown): void {
		if (exists(expected) !== true) {
			Assertion.formMessageAndThrow(expected, "exists");
		}
	}

	/**
	 * Asserts that `expected` doesn't exist.
	 *
	 * @param expected any Javascript object
	 */
	public static assertDoesntExist(expected: unknown): void {
		if (exists(expected) === true) {
			Assertion.formMessageAndThrow(expected, "doesntExist");
		}
	}

	/**
	 * Asserts that `array` contains `expected`.
	 *
	 * @param expected any Javascript object
	 * @param array array to search for `expected` in
	 */
	public static assertArrayContains(expected: unknown, array: unknown[]): void {
		if (array.includes(expected) !== true) {
			Assertion.formMessageAndThrow(expected, "contains", array);
		}
	}

	/**
	 * Asserts that `array` doesn't contain `expected`.
	 *
	 * @param expected any Javascript object
	 * @param array array to search for `expected` in
	 */
	public static assertArrayDoesntContain(expected: unknown, array: unknown[]): void {
		if (array.includes(expected) === true) {
			Assertion.formMessageAndThrow(expected, "doesntContain", array);
		}
	}

	/**
	 * Asserts that `array` contains `expected` number of items.
	 *
	 * @param expected expected number of items
	 * @param array array to get count from
	 */
	public static assertArrayLength(expected: number, array: unknown[]): void {
		const arrayLength = array.length;

		if (arrayLength !== expected) {
			Assertion.formMessageAndThrow(expected, "length", arrayLength);
		}
	}

	/**
	 * Asserts that `expected` is empty.
	 *
	 * @param expected any Javascript object
	 */
	public static assertEmpty(expected: object | unknown[]): void {
		if (!empty(expected)) {
			Assertion.formMessageAndThrow(expected, "empty");
		}
	}

	/**
	 * Asserts that `expected` is _not_ empty.
	 *
	 * @param expected any Javascript object
	 */
	public static assertNotEmpty(expected: object | unknown[] | string): void {
		if (empty(expected)) {
			Assertion.formMessageAndThrow(expected, "notEmpty");
		}
	}

	/**
	 * Asserts that `thrower` throws an error with name `errorName` (defaults to "Error").
	 *
	 * @param errorName the name of the error that should be thrown
	 * @param throwerName the actual name of the function that should throw
	 * @param thrower a wrapper-function around the actual function to call
	 */
	public static assertThrows(errorName: string, throwerName: string, thrower: () => void): void {
		try {
			thrower.call(undefined);

			Assertion.formMessageAndThrow(throwerName, "throws", "an error");
		} catch (error: any) {
			if (error.constructor.name !== errorName) {
				Assertion.formMessageAndThrow(throwerName, "throws", errorName);
			}
		}
	}

	/**
	 * Asserts that `expected` is strictly equal to `null`.
	 *
	 * @param expected any Javascript object
	 */
	public static assertNull(expected: unknown): void {
		const actual = null;

		if (expected !== actual) {
			Assertion.formMessageAndThrow(expected, "===", actual);
		}
	}

	/**
	 * Asserts that `expected` is _not_ strictly equal to `null`.
	 *
	 * @param expected any Javascript object
	 */
	public static assertNotNull(expected: unknown): void {
		const actual = null;

		if (expected === actual) {
			Assertion.formMessageAndThrow(expected, "!==", actual);
		}
	}

	/**
	 * Asserts that a property on an object changes value at a future point in time.
	 *
	 * @param expected the expected value that `owner[propertyName]` should change t
	 * @param owner the object which owns the property `propertyName`
	 * @param propertyName the name of the property that should change at some future point in time
	 * @param executionTime the max execution time of this assertion
	 */
	public static async assertPropertyChanges(
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
				}

				if (timeElapsed >= executionTime) {
					clearInterval(interval);
					Assertion.formMessageAndThrow(expected, "changes", `${ownerName}['${propertyName}']`);
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
	private static formMessageAndThrow(
		expected: unknown,
		operator: keyof typeof OperatorsEnglish,
		actual?: unknown
	): void {
		let message = `Failed asserting that '${JSON.stringify(expected, getCircularReplacer())}' is ${
			OperatorsEnglish[operator]
		}`;

		if (defined(actual)) {
			message = `${message} '${JSON.stringify(actual, getCircularReplacer())}'`;
		}

		throw new TestException(message);
	}
}
