import interpret from "./interpreter.js";
import parse from "./parser.js";
import * as fs from "node:fs";

if (process.argv.length < 3) {
  console.log('Usage: node baby.js <name>');
  process.exit(1);
}

try {
  const name = process.argv[2];
  const sourceCode = fs.readFileSync(name, "utf-8");
  const match = parse(sourceCode); // if it failed, it would have thrown
  interpret(match);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}