const commonjs = require("@rollup/plugin-commonjs");

const typescript = require("@rollup/plugin-typescript");

const babel = require("@rollup/plugin-babel");

module.exports = {
  input: "index.ts",
  output: [
    {
      file: "dist/index.js",
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "dist/index.esm.js",
      format: "es",
      sourcemap: true,
    },
  ],
  external: ["dva-core", "dva-loading", "react", "redux", "react-redux"],
  plugins: [commonjs(), typescript(), babel({ babelHelpers: "bundled" })],
};
