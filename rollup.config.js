import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

module.exports = {
  input: "src/DiodePublic.js",
  output: {
    file: "lib/DiodePublic.js",
    format: "cjs"
  },
  external: ["react", "react-is"],
  plugins: [
    babel({
      exclude: "node_modules/**",
      runtimeHelpers: true
    }),
    resolve(),
    commonjs()
  ]
};
