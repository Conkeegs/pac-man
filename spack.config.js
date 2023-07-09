const { config } = require("@swc/core/spack");

module.exports = config({
    entry: {
        web: __dirname + "/src/App.ts",
    },
    output: {
        path: __dirname + "/lib",
    },
    options: {
        test: ".*\\.ts$",
        sourceMaps: true,
        exclude: [
            "**/*.spec.ts",
            "node_modules"
        ],
        jsc: {
            minify: {
                compress: true,
                dead_code: true
            },
            baseUrl: ".",
            parser: {
                syntax: "typescript",
                tsx: false,
                dynamicImport: false,
                decorators: false
                // "decorators": true
            },
            target: "es2015",
            loose: true,
            externalHelpers: true,
            // Requires v1.2.50 or upper and requires target to be es2016 or upper.
            keepClassNames: false,
            transform: {
                constModules: {
                    globals: {
                        "@pacman/env-flags": {
                            DEBUG: "true"
                        },
                        "@pacman/features": {
                            FEATURE_A: "false",
                            FEATURE_B: "true"
                        }
                    }
                }
                //     legacyDecorator: true,
                //     decoratorMetadata: true
            }
        },
        minify: true,
        env: {
            loose: true,
            bugfixes: true
        },
        module: {
            type: "es6",
            // These are defaults.
            strict: false,
            strictMode: true,
            lazy: false,
            noInterop: false
        }
    }
});