import { describe, it } from "node:test";
import parse from "../src/parser.js";
import assert from "node:assert";

const syntaxChecks = [
  ['gibberish(1)', "print statements"],
  ["mine x = 1", "let statements"],
  ["x = 1", "assignment statements"],
  ["peekaboo x { gibberish(x) }", "if statements"],
  ["peekaboo x { gibberish(x) } mine y = 2", "multiple statements"],
  ["", "empty program"],
  ["mine count = 3 * 22 + 1", "arithmetic expressions"],
  ["gibberish(\"hello\" + \" world\")", "string concatenation"],
  // ["gibberish(1+((2*3)) % x ** 2 ** 5)", "parenthesed expresssions"],
];

const syntaxErrors = [
  ["gibberish(1", "missing closing parenthesis"],
  ["peekaboo { gibberish(1) }", "missing condition"],
  ["mine = 1", "missing variable name"],
  ["mine 1 = 1", "invalid variable name"],
  ["mine x 1", "missing equals sign"],
  ["gibberish 1)", "missing opening parenthesis"],
  ["mine x = gibberish(1)", "invalid statement"],
  ["peekaboox { gibberish(x) }", "keyword should be separated from identifier"],
];

describe("The parser", () => {
  for (const [input, scenario] of syntaxChecks) {
    it(`matches ${scenario}`, () => {
      const match = parse(input);
      assert(match.succeeded(), `Expected to parse ${input}, but got ${match.message}`)
    })
  }
  for (const [input, scenario] of syntaxErrors) {
    it(`Correctly finds the ${scenario} error`, () => {
      assert.throws(() => parse(input), `Expected parsing "${input}" to throw a syntax error. But it did not.`)
    })
  }
})