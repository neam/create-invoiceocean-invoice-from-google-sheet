// Transpile all code following this line with babel and use 'env' (aka ES6) preset.
require("babel-register")({
  presets: ["env"],
});
require("babel-polyfill");

// Import the rest of our application.
module.exports = require("./index-es6.js");
