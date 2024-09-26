import { exists } from "../../src/main/utils/Utils.js";
import TestException from "./TestException.js";

/**
 * Turns JavaScript operators into their english-sentence equivalents for test logging
 * readability.
 */
enum OperatorsEnglish {
	"===" = "strictly equal to",
	"typeof" = "of type",
	"exists" = "existing",
	"contains" = "contained in",
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
	 * Asserts that `expected` exists.
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
		let message = `Failed asserting that ${expected} is ${OperatorsEnglish[operator]}`;

		if (actual) {
			message = `${message} ${actual}`;
		}

		throw new TestException(message);
	}
}
