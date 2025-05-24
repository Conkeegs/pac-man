const { config } = require("@swc/core/spack");
const path = require("path");

module.exports = config({
	target: "browser",
	entry: {
		web: path.join(__dirname, "dist", "main", "app", "App.js"),
	},
	output: {
		path: path.join(__dirname, "dist"),
	},
	module: {
		type: "es6",
		strict: false,
		strictMode: true,
		lazy: false,
		noInterop: false,
	},
	options: {
		module: {
			type: "es6",
			strict: false,
			strictMode: true,
			lazy: false,
			noInterop: false,
		},
		test: ".*\\.ts$",
		sourceMaps: "inline",
		// inlineSourcesContent: true,
		isModule: true,
		exclude: [
			// "**/*.spec.ts",
			"node_modules",
		],
		// env: {
		// 	loose: true,
		// 	bugfixes: true,
		// },
		minify: true,
		script: false,
		jsc: {
			// "minify": {
			//     "compress": true,
			//     "dead_code": true
			// },
			// "baseUrl": "./src",
			parser: {
				syntax: "typescript",
				tsx: false,
				dynamicImport: false,
				decorators: false,
			},
			target: "es2015",
			loose: true,
			externalHelpers: true,
			keepClassNames: false,
			transform: {
				constModules: {
					globals: {
						"@pacman/env-flags": {
							DEBUG: "true",
						},
						"@pacman/features": {
							FEATURE_A: "false",
							FEATURE_B: "true",
						},
					},
				},
			},
		},
	},
});
