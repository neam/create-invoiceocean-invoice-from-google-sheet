require("dotenv").load();

// Parse cli arguments
const ArgumentParser = require("argparse").ArgumentParser;
const packageInfo = require("./package.json");
const parser = new ArgumentParser({
  version: packageInfo.version,
  description: packageInfo.description,
  addHelp: true,
});
/*
parser.addArgument(["-f", "--foo"], {
  help: "Foo",
});
*/
var args = parser.parseArgs();
console.dir(args);

// Initialize settings from .env
const foo = process.env.FOO || "foo";

const run = async () => {};

run();
