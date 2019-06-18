import babel from "rollup-plugin-babel";

module.exports = {
  input: "src/DiodePublic.js",
  output: {
    file: "lib/DiodePublic.js",
    format: "cjs"
  },
  external: [
    "react",
    "react-is",
    "lodash.mergewith",
    "deep-extend",
    "object-assign",
    "hoist-non-react-statics",
    "lodash.find"
  ],
  plugins: [
    babel({
      exclude: "node_modules/**"
    })
  ]
};
