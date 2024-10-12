import { readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import path from "path";

const distDirectory: "dist" = "dist";
const encoding: "utf-8" = "utf-8";
const debugRegex: RegExp = /\/\/ #!DEBUG[\s\S]*?\/\/ #!END_DEBUG/gm;

/**
 * Replaces debug flags in an output-JavaScript file.
 *
 * @param jsFile the JavaScript file to remove debug code in
 */
function removeDebugCode(jsFile: string): void {
	const jsFileContent = readFileSync(jsFile, {
		encoding,
	});

	// replace debug code instances
	writeFileSync(jsFile, jsFileContent.replace(debugRegex, "").trim(), {
		encoding,
	});
}

/**
 * Reads directories located inside of the output dist files and its output JavaScript
 * files and removes debug code.
 *
 * @param directoryPath directory of the "dist" folder or its child-directories
 */
function readDistFiles(directoryPath: string): void {
	const files = readdirSync(directoryPath);

	for (const file of files) {
		const filePath = path.join(directoryPath, file);
		const fileStats = statSync(filePath);

		if (fileStats.isDirectory()) {
			readDistFiles(filePath);

			continue;
		}

		if (file.endsWith(".js")) {
			removeDebugCode(filePath);
		}
	}
}

console.log("\nRemoving debug flags in output JavaScript files...");

readDistFiles(distDirectory);

console.log("Finished removing debug flags in output JavaScript files");
