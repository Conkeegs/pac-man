import { cpSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import path from "path";

const srcDirectory: "src" = "src";
const srcCopyDirectory: "src-copy" = "src-copy";
const pathsJoined = path.join(srcCopyDirectory, srcDirectory);
const encoding: "utf-8" = "utf-8";
const debugRegex: RegExp = /\/\/ #!DEBUG[\s\S]*?\/\/ #!END_DEBUG/gm;

// copy files since we don't want to run regex removal on actual src files
cpSync(srcDirectory, pathsJoined, {
	force: false,
	errorOnExist: true,
	recursive: true,
});

/**
 * Replaces debug flags in typescript file.
 *
 * @param tsFile the TypeScript file to remove debug code in
 */
function removeDebugCode(tsFile: string): void {
	const tsFileContent = readFileSync(tsFile, {
		encoding,
	});

	// replace debug code instances
	writeFileSync(tsFile, tsFileContent.replace(debugRegex, "").trim(), {
		encoding,
	});
}

/**
 * Reads directories located inside of the copied src files and removes debug code.
 *
 * @param copiedSrcDirectory directory of the copied "src" folder or its child-directories
 */
function readDistFiles(copiedSrcDirectory: string): void {
	const files = readdirSync(copiedSrcDirectory);

	for (const file of files) {
		const filePath = path.join(copiedSrcDirectory, file);
		const fileStats = statSync(filePath);

		if (fileStats.isDirectory()) {
			readDistFiles(filePath);

			continue;
		}

		if (file.endsWith(".ts")) {
			removeDebugCode(filePath);
		}
	}
}

console.log("\nRemoving debug flags in TypeScript files...");

readDistFiles(pathsJoined);

console.log("\nFinished removing debug flags in TypeScript files");
