module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        exclude: ["transform-async-to-generator", "transform-regenerator"]
      }
    ],
    "@babel/preset-react",
    "@babel/preset-flow"
  ],
  plugins: [
    "@babel/plugin-proposal-class-properties",
    "babel-plugin-async-to-promises"
  ],
  env: {
    test: {
      presets: ["@babel/preset-env"],
      plugins: ["@babel/plugin-transform-runtime"]
    }
  }
};
