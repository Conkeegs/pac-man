const { config } = require("@swc/core/spack");

module.exports = config({
    entry: {
        web: __dirname + "/src/main/App.ts",
    },
    output: {
        path: __dirname + "/lib",
    }
});