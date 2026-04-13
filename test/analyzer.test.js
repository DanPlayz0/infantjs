import { describe, it } from "node:test"
import assert from "node:assert"
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"
import * as core from "../src/core.js"

const semanticChecks = [
  ["number variable declaration", "mine x = 1"],
  ["boolean true declaration", "mine x = gaagaa"],
  ["boolean false declaration", "mine x = googoo"],
  ["declare and print", "mine x = 1 gibberish(x)"],
  ["number reassignment", "mine x = 1 x = 2"],
  ["boolean reassignment", "mine x = gaagaa x = googoo"],
  ["print a number literal", "gibberish(1)"],
  ["print true", "gibberish(gaagaa)"],
  ["print false", "gibberish(googoo)"],
  ["multiplication", "gibberish(2 * 3)"],
  ["division", "gibberish(6 / 2)"],
  ["modulo", "gibberish(7 % 3)"],
  ["exponentiation", "gibberish(2 ** 8)"],
  ["negation", "gibberish(-5)"],
  ["addition", "gibberish(1 + 2)"],
  ["string concatenation", 'gibberish("hello" + " world")'],
  ["string concatenation with variable", 'mine x = "hello" gibberish(x + " world")'],
  ["subtraction", "gibberish(5 - 3)"],
  ["less than", "gibberish(1 < 2)"],
  ["greater than", "gibberish(2 > 1)"],
  ["equality", "gibberish(1 == 1)"],
  ["inequality", "gibberish(1 != 2)"],
  ["variable in multiplication", "mine x = 2 gibberish(x * 3)"],
  ["variable in comparison", "mine x = 5 gibberish(x <= 10)"],
  ["if statement with boolean literal", "peekaboo gaagaa { gibberish(1) }"],
  ["if-else statement", "peekaboo googoo { gibberish(1) } nuhuh { gibberish(((0))) }"],
  ["while statement", "wawawa googoo { gibberish(1) }"],
  ["if with comparison condition", "mine x = 1 peekaboo x < 2 { gibberish(x) }"],
  ["while with comparison condition", "mine x = 1 wawawa x < 10 { x = 2 }"],
  ["multiple declarations", "mine x = 1 mine y = 2"],
  ["variable used in while body", "mine x = 1 wawawa googoo { gibberish(x) }"],
  ["variable used in if body", "mine x = 1 peekaboo gaagaa { gibberish(x) }"],
  ["chained comparisons", "mine x = 3 mine y = 5 gibberish(x < y)"],
  [
    "function declaration and call",
    "playtime add(a: numba, b: numba) { bedtime a + b } gibberish(add(5, 7))",
  ],
  [
    "Can look up variable in parent scope",
    "mine x = 1 playtime f() { bedtime x } gibberish(f())",
  ],
  [
    "boolean parameter and argument",
    "playtime isTrue(x: squarehole) { bedtime x } gibberish(isTrue(gaagaa))",
  ],
  ["print float literal", "gibberish(3.14)"],
  ["print string literal", 'gibberish("hello world")'],
  ["print string literal with variable", 'mine x = "hello" gibberish(x)'],
  ["random number generation", "flippy(1, 10)"],
  ["random number generation with float bounds", "flippy(0.5, 2.5)"],
  ["random number generation with negative bounds", "flippy(-1, -5)"],
  ["print result of function call", "playtime add(a: numba, b: numba) { bedtime a + b } gibberish(add(2, 3))"],
]

// Programs that are syntactically correct but have semantic errors
const semanticErrors = [
  ["use of undeclared variable", "gibberish(x)", /Undefined variable/],
  [
    "redeclaration of variable",
    "mine x = 1 mine x = 2",
    /Variable already declared/,
  ],
  ["assign to undeclared variable", "x = 1", /Undefined variable/],
  ["non-boolean condition in if", "peekaboo 1 { gibberish(1) }", /Expected a boolean/],
  [
    "non-boolean condition in if-else",
    "peekaboo 1 { gibberish(1) } nuhuh { gibberish(2) }",
    /Expected a boolean/,
  ],
  [
    "non-boolean condition in while",
    "wawawa 1 { gibberish(1) }",
    /Expected a boolean/,
  ],
  [
    "number variable as if condition",
    "mine x = 1 peekaboo x { gibberish(x) }",
    /Expected a boolean/,
  ],
  [
    "number variable as while condition",
    "mine x = 1 wawawa x { gibberish(x) }",
    /Expected a boolean/,
  ],
  [
    "type mismatch assigning boolean to number variable",
    "mine x = 1 x = gaagaa",
    /Type mismatch/,
  ],
  [
    "type mismatch assigning number to boolean variable",
    "mine x = gaagaa x = 1",
    /Type mismatch/,
  ],
  [
    "boolean in multiplication left operand",
    "gibberish(gaagaa * 1)",
    /Expected a number/,
  ],
  [
    "boolean in multiplication right operand",
    "gibberish(1 * gaagaa)",
    /Expected a number/,
  ],
  ["boolean in division", "gibberish(gaagaa / 1)", /Expected a number/],
  ["boolean in modulo", "gibberish(gaagaa % 1)", /Expected a number/],
  ["boolean in exponentiation base", "gibberish(gaagaa ** 2)", /Expected a number/],
  [
    "boolean in exponentiation exponent",
    "gibberish(2 ** gaagaa)",
    /Expected a number/,
  ],
  ["boolean in negation", "gibberish(-gaagaa)", /Expected a number/],
  ["boolean in addition left operand", "gibberish(gaagaa + 1)", /Expected a number/],
  ["boolean in addition right operand", "gibberish(1 + gaagaa)", /Expected a number/],
  ["boolean in subtraction", "gibberish(gaagaa - 1)", /Expected a number/],
  ["boolean in less than", "gibberish(gaagaa < 1)", /Expected a number/],
  ["boolean in greater than", "gibberish(1 > gaagaa)", /Expected a number/],
  ["boolean in equality", "gibberish(gaagaa == 1)", /Expected a number/],
  ["boolean in inequality", "gibberish(gaagaa != 1)", /Expected a number/],
  [
    "redeclaration in while body",
    "mine x = 1 wawawa gaagaa { mine x = 2 }",
    /Variable already declared/,
  ],
  [
    "redeclaration in if body",
    "mine x = 1 peekaboo gaagaa { mine x = 2 }",
    /Variable already declared/,
  ],
  [
    "undeclared variable in binary expression",
    "gibberish(x + 1)",
    /Undefined variable/,
  ],
  ["undeclared variable in comparison", "gibberish(x < 1)", /Undefined variable/],
  [
    "undeclared variable with multiple scopes",
    "mine x = 3 playtime f(x: numba) { bedtime y }",
    /Undefined variable/,
  ],
  [
    "wrong number of arguments in function call",
    "playtime f() { bedtime 1 } gibberish(f(1))",
    /Expected 0 arguments/,
  ],
  [
    "type mismatch in function call argument",
    "playtime f(x: numba) { bedtime 1 } gibberish(f(gaagaa))",
    /Type mismatch in argument 1/,
  ],
  [
    "string and number addition",
    'gibberish("hello" + 1)',
    /cannot concatenate number with string/,
  ],
  [
    "string and boolean addition",
    'gibberish("hello" + gaagaa)',
    /cannot concatenate boolean with string/,
  ],
  [
    "string multiplication",
    'gibberish("hello" * 3)',
    /is not supported for strings/,
  ],
  [
    "string division",
    'gibberish("hello" / 3)',
    /is not supported for strings/,
  ],
  [
    "string modulo",
    'gibberish("hello" % 3)',
    /is not supported for strings/,
  ],
  [
    "string exponentiation",
    'gibberish("hello" ** 3)',
    /expected a number/i,
  ],
  [
    "string negation",
    'gibberish(-"hello")',
    /expected a number/i,
  ],
  [
    "string subtraction",
    'gibberish("hello" - 3)',
    /unsupported operator/i,
  ],
  [
    "string less than",
    'gibberish("hello" < 3)',
    /Expected a number/i,
  ],
  [
    "random number generation with non-number bounds",
    "flippy(1, gaagaa)",
    /Expected a number/,
  ]
]

describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(parse(source)))
    })
  }
  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(parse(source)), errorMessagePattern)
    })
  }
  it("produces the expected representation for a trivial program", () => {
    assert.deepEqual(
      analyze(parse("mine x = 1")),
      core.program([core.letStmt(core.variable("x", "number"), 1)]),
    )
  })
})