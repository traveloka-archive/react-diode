import babel from "rollup-plugin-babel";

module.exports = {
  input: "src/DiodePublic.js",
  output: {
    file: "lib/DiodePublic.js",
    format: "cjs"
  },
  external: [
    "deep-extend",
    "hoist-non-react-statics",
    "lodash.find",
    "lodash.mergewith",
    "object-assign",
    "react",
    "react-is"
  ],
  plugins: [
    babel({
      exclude: "node_modules/**"
    })
  ]
};
