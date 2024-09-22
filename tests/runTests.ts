import { readdirSync, statSync } from "fs";
import path from "path";
import Test from "./base/Base";
import Logger from "./base/Logger.ts";
import TestException from "./base/TestException";

/**
 * Files that do not count as "test" files/directories.
 */
const EXCLUDE_FILES: string[] = ["runTests.ts", "base"];

/**
 * Gets a list of each of the test files to run.
 *
 * @param dirPath the directory to search through
 * @param files list of files in each directory
 * @returns list of test files (excluding those in `EXCLUDE_FILES`)
 */
const getAllTestFiles = function (dirPath: string, files: string[] = []) {
	readdirSync(dirPath).forEach(function (file) {
		if (EXCLUDE_FILES.includes(file)) {
			return;
		}

		const filePath = path.join(dirPath, "/", file);

		if (statSync(filePath).isDirectory()) {
			files = getAllTestFiles(filePath, files);

			return;
		}

		if (file.endsWith("Test.ts")) {
			// substring the absolute path since dynamic import will not accept full path, only relative
			files.push(filePath.substring(filePath.indexOf("tests\\")));
		}
	});

	return files;
};

const testFiles = getAllTestFiles(__dirname);
const testFilesCount = testFiles.length;
let runTestsCount = 0;
let currentTestFunction: string | undefined;

// run through each testing file and run their test functions
testFiles.forEach(async (file) => {
	const testFile = await import(file);
	const testClass: Test = new testFile.default();
	const testClassName = testClass.getName();
	/// only search for testing functions ending in the word "Test" for convenience
	const testFunctionNames = Object.getOwnPropertyNames(Object.getPrototypeOf(testClass)).filter((functionName) => {
		return functionName.endsWith("Test");
	});

	try {
		Logger.log(`Running ${chalk.bold(testClassName)}:\n`);

		// run each testing function
		for (const functionName of testFunctionNames) {
			currentTestFunction = functionName;

			(testClass[functionName as keyof Test] as () => void)();

			Logger.log(`${chalk.bold(functionName)} successful`, {
				severity: "success",
				tabbed: true,
			});
		}

		runTestsCount++;

		Logger.log("\n");
		Logger.log(
			`${chalk.bold(testClassName)} passed: ${chalk.bold(
				Math.ceil((runTestsCount / testFilesCount) * 100)
			)}% complete`,
			{
				severity: "success",
				withSymbol: true,
			}
		);

		// if we've reached last test, log that all passed
		if (runTestsCount === testFilesCount) {
			Logger.log(`\nAll ${chalk.bold(testFilesCount)} tests have passed.`, {
				severity: "success",
			});

			return;
		}
	} catch (error: unknown) {
		if (error instanceof TestException) {
			testClass.fail(`${chalk.bold(currentTestFunction)}: ${error.message}`, error.stack);

			return;
		}

		Logger.log("Unknown error occurred while running tests:", {
			severity: "failure",
		});
		Logger.log(error);
	}
});
