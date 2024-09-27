import Logger from "../src/main/Logger.js";
import { pluralize } from "../src/main/utils/Utils.js";
import AudioRegistryTest from "./assets/AudioRegistryTest.js";
import ImageRegistryTest from "./assets/ImageRegistryTest.js";
import JsonRegistryTest from "./assets/JsonRegistryTest.js";
import Test from "./base/Base.js";
import TestException from "./base/TestException.js";
import BoardObjectTest from "./board/boardobject/BoardObjectTest.js";
import BoardTest from "./board/BoardTest.js";

/**
 * Represents an object containing a testing class and its methods
 */
type TestMapping = {
	readonly testFunctionNames: string[];
	readonly test: Test;
};

/**
 * Class used to run tests for the game.
 */
export default class RunTests {
	/**
	 * The number of testing classes to run.
	 */
	private testClassesLength: number;
	/**
	 * The current number of testing classes that have completed successfully.
	 */
	private runTestsCount: number = 0;
	/**
	 * The name of the current testing function being ran.
	 */
	private currentTestFunction: string | undefined;
	/**
	 * The sum of all testing functions across all test classes.
	 */
	private testFunctionCountTotal: number;
	/**
	 * The current number of testing methods that have completed successfully.
	 */
	private testFunctionCountCurrent: number;
	/**
	 * All test class instances to run.
	 */
	private static readonly TEST_CLASSES: Test[] = [
		new AudioRegistryTest(),
		new ImageRegistryTest(),
		new JsonRegistryTest(),
		new BoardTest(),
		new BoardObjectTest(),
	];

	/**
	 * Creates a `RunTest` instance.
	 *
	 * @param specificClassAndFunction optional param for a single test class to run. Can use "::" separator to also
	 * specify a specific function name in the class to run on the right-hand side.
	 */
	constructor(specificClassAndFunction?: string) {
		const testClasses = RunTests.TEST_CLASSES;
		this.testFunctionCountTotal = 0;
		this.testFunctionCountCurrent = 0;
		const specificClassAndFunctionSplit = specificClassAndFunction?.split("::");
		const specifiedClass: string | undefined = specificClassAndFunctionSplit && specificClassAndFunctionSplit[0];
		const testClassesFiltered: Test[] = testClasses.filter((test) => {
			if (specifiedClass) {
				return test.getName() === specifiedClass;
			}

			return true;
		});

		if (!testClassesFiltered.length && specifiedClass) {
			throw new Error(`Specified test class ${specifiedClass} does not exist or was not initialized`);
		}

		const testClassesMap: TestMapping[] = testClassesFiltered.map((test: Test): TestMapping => {
			const specifiedMethod: string | boolean | undefined =
				specificClassAndFunctionSplit &&
				specificClassAndFunctionSplit.length > 1 &&
				specificClassAndFunctionSplit[1];
			// only search for testing functions ending in the word "Test" for convenience
			const testFunctionNames = Object.getOwnPropertyNames(Object.getPrototypeOf(test)).filter((functionName) => {
				let constraint = functionName.endsWith("Test");

				if (specifiedMethod) {
					constraint = constraint && functionName === specifiedMethod;
				}

				return constraint;
			});

			if (!testFunctionNames.length && specifiedMethod) {
				throw new Error(
					`Specified test method ${
						specificClassAndFunctionSplit![1]
					} does not exist on testing class: ${test.getName()}`
				);
			}

			this.testFunctionCountTotal += testFunctionNames.length;

			return {
				testFunctionNames,
				test,
			} as const;
		});

		this.testClassesLength = testClassesMap.length;

		// run through each testing file and run their test functions
		for (const mapping of testClassesMap) {
			this.runTestMapping(mapping);
		}
	}

	/**
	 * Runs a testing class and its methods.
	 *
	 * @param mapping an object containing a testing class and its methods
	 */
	private async runTestMapping(mapping: TestMapping): Promise<void> {
		let testFunctionCount = 0;
		const testClass = mapping.test;
		const testClassName = testClass.getName();
		const testFunctionCountTotal = this.testFunctionCountTotal;

		try {
			if (this.runTestsCount !== 0) {
				Logger.log("\n");
			}

			Logger.log(`Running ${testClassName}...:`);
			Logger.log("\n");

			// run each testing function
			for (const functionName of mapping.testFunctionNames) {
				this.currentTestFunction = functionName;

				await (testClass[functionName as keyof Test] as () => void | Promise<void>)();

				Logger.log(
					`${++testFunctionCount + ")"} ${functionName} successful - ${++this
						.testFunctionCountCurrent}/${testFunctionCountTotal} (${Math.ceil(
						(this.testFunctionCountCurrent / testFunctionCountTotal) * 100
					)}%)`,
					{
						severity: "success",
						tabbed: true,
					}
				);
			}

			const runTestsCount = ++this.runTestsCount;
			const testClassesLength = this.testClassesLength;

			Logger.log("\n");
			Logger.log(`${testClassName} passed: ${Math.ceil((runTestsCount / testClassesLength) * 100)}% complete`, {
				severity: "success",
				withSymbol: true,
			});

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
				testClass.fail(`${this.currentTestFunction}: ${error.message}`, error);

				return;
			}

			Logger.log("Unknown error occurred while running tests:", {
				severity: "failure",
			});
			console.log(error);
		}
	}
}
