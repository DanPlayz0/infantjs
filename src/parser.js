import * as ohm from "ohm-js";
import * as fs from "node:fs/promises";
import path from "path";


const grammarSource = await fs.readFile("./src/babyjs.ohm", "utf-8");
const grammar = ohm.grammar(grammarSource);

export default function parse(sourceCode) {
  const match = grammar.match(sourceCode);
  if (match.failed()) {
    throw new Error(`Parse error: ${match.message}`);
  }
  return match;
}