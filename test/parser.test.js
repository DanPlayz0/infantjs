import { describe, it } from "node:test";
import parse from "../src/parser.js";
import assert from "node:assert";

const syntaxChecks = [
  ['print(1)', "print statements"],
  ["let x = 1", "let statements"],
  ["x = 1", "assignment statements"],
  ["if x { print(x) }", "if statements"],
  ["if x { print(x) } let y = 2", "multiple statements"],
  ["", "empty program"],
  ["let count = 3 * 22 + 1", "arithmetic expressions"],
  // ["print(1+((2*3)) % x ** 2 ** 5)", "parenthesed expresssions"],
];

const syntaxErrors = [
  ["print(1", "missing closing parenthesis"],
  ["if { print(1) }", "missing condition"],
  ["let = 1", "missing variable name"],
  ["let 1 = 1", "invalid variable name"],
  ["let x 1", "missing equals sign"],
  ["print 1)", "missing opening parenthesis"],
  ["let x = print(1)", "invalid statement"],
  ["ifx { print(x) }", "keyword should be separated from identifier"],
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