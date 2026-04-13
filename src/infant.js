// import interpret from "./interpreter.js";
import parse from "./parser.js";
import translate from "./analyzer.js";
import * as fs from "node:fs";

if (process.argv.length < 3) {
  console.log(`Usage: ${process.argv[0]} ${process.argv[1]} <name>`);
  process.exit(1);
}

try {
  const name = process.argv[2];
  const sourceCode = fs.readFileSync(name, "utf-8");
  const match = parse(sourceCode); // if it failed, it would have thrown
  const translated = translate(match);
  console.log(translated);
} catch (e) {
  console.error(e.message);
  console.debug(e.stack);
  process.exit(1);
}