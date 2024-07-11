const typescript = require("@rollup/plugin-typescript");

const terser = require("@rollup/plugin-terser");

const babel = require("@rollup/plugin-babel");

module.exports = {
  input: "index.ts",
  output: [
    {
      file: "dist/pasteword/index.js",
      format: "iife",
      sourcemap: true,
    },
    {
      file: "dist/pasteword/index.mini.js",
      format: "iife",
      sourcemap: true,
      plugins: [terser()],
    },
  ],
  plugins: [typescript(), babel({ babelHelpers: "bundled" })],
};
