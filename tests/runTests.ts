import AudioRegistryTest from "./assets/AudioRegistryTest.js";
import Test from "./base/Base.js";
import Logger from "./base/Logger.js";
import TestException from "./base/TestException.js";
import { pluralize } from "./base/Utils.js";

/**
 * Class used to run tests for the game.
 */
export default class RunTests {
	private static readonly TEST_CLASSES: Test[] = [new AudioRegistryTest()];

	/**
	 * Creates a `RunTest` instance.
	 */
	constructor() {
		const testClasses = RunTests.TEST_CLASSES;
		const testClassesLength = testClasses.length;
		let runTestsCount = 0;
		let currentTestFunction: string | undefined;
		let testFunctionCountTotal = 0;
		let testFunctionCountCurrent = 0;
		let testClassesMap: { readonly testFunctionNames: string[]; readonly test: Test }[] = testClasses.map(
			(test: Test) => {
				// only search for testing functions ending in the word "Test" for convenience
				const testFunctionNames = Object.getOwnPropertyNames(Object.getPrototypeOf(test)).filter(
					(functionName) => {
						return functionName.endsWith("Test");
					}
				);

				testFunctionCountTotal += testFunctionNames.length;

				return {
					testFunctionNames,
					test,
				} as const;
			}
		);

		// run through each testing file and run their test functions
		for (const mapping of testClassesMap) {
			let testFunctionCount = 0;
			const testClass = mapping.test;
			const testClassName = testClass.getName();

			try {
				Logger.log(`Running ${testClassName}:\n`);

				// run each testing function
				for (const functionName of mapping.testFunctionNames) {
					currentTestFunction = functionName;

					(testClass[functionName as keyof Test] as () => void)();

					Logger.log(
						`${
							++testFunctionCount + ")"
						} ${functionName} successful - ${++testFunctionCountCurrent}/${testFunctionCountTotal} (${
							(testFunctionCountCurrent / testFunctionCountTotal) * 100
						}%)`,
						{
							severity: "success",
							tabbed: true,
						}
					);
				}

				runTestsCount++;

				Logger.log("\n");
				Logger.log(
					`${testClassName} passed: ${Math.ceil((runTestsCount / testClassesLength) * 100)}% complete`,
					{
						severity: "success",
						withSymbol: true,
					}
				);

				// if we've reached last test, log that all passed
				if (runTestsCount === testClassesLength) {
					Logger.log(`\n${testClassesLength} ${pluralize("test", testClassesLength)} passed.`, {
						severity: "success",
					});

					return;
				}
			} catch (error: unknown) {
				Logger.log("\n");

				if (error instanceof TestException) {
					testClass.fail(`${currentTestFunction}: ${error.message}`, error);

					return;
				}

				Logger.log("Unknown error occurred while running tests:", {
					severity: "failure",
				});
				Logger.log(error);
			}
		}
	}
}
