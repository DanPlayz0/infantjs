import { describe, it } from "node:test";
import parse from "../src/parser.js";
import assert from "node:assert";
import interpret from "../src/interpreter.js";

describe("interpreter", () => {
  it("evaluates a cool program", () => {
    const sourceCode = `gibberish(1) gibberish(2) mine x = 5 x = 2 
    gibberish((x+3) ** -2)
    peekaboo x { gibberish(x * 1 / 1 % 1) }`;
    const match = parse(sourceCode);
    
    let output = [];
    console.log = (msg) => { output.push(msg); };
    interpret(match);

    assert.deepStrictEqual(output, [1, 2, 0.04, 0]);
  })
  it("throws an error for undefined variables", () => {
    const sourceCode = `gibberish(x)`;
    const match = parse(sourceCode);
    assert.throws(() => interpret(match), /Undefined variable: x/, "Expected an error for undefined variable, but it did not throw.");
  })
})