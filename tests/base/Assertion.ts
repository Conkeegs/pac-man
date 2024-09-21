import TestException from "./TestException.ts";

/**
 * Turns JavaScript operators into their english-sentence equivalents for test logging
 * readability.
 */
enum OperatorsEnglish {
	"===" = "strictly equal",
}

/**
 * Class used for making testing assertions.
 */
export default abstract class Assertion {
	/**
	 * Asserts that `expected` in strictly equal to `true`.
	 *
	 * @param expected any Javascript object
	 */
	public static assertTrue(expected: unknown): void {
		const actual = true;

		if (!expected === actual) {
			Assertion.formMessageAndThrow(expected, "===", actual);
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
		actual: unknown
	): void {
		throw new TestException(`Failed asserting that ${expected} is ${OperatorsEnglish[operator]} to ${actual}`);
	}
}
