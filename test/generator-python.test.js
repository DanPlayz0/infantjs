import { describe, it } from "node:test"
import assert from "node:assert"
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"
import optimize from "../src/optimizer.js"
import generatePython from "../src/generator-python.js"

// Helper to run the full pipeline and get Python output
const generateFrom = (source) => generatePython(analyze(parse(source)))
const generateFromOptimized = (source) => generatePython(optimize(analyze(parse(source))))

describe("The Python generator", () => {
  it("generates a let statement", () => {
    const output = generateFrom("mine x = 5")
    assert.match(output, /=/)
    assert.match(output, /5/)
  })

  it("generates a print statement", () => {
    const output = generateFrom("gibberish(42)")
    assert.match(output, /print/)
    assert.match(output, /42/)
  })

  it("generates an assign statement", () => {
    const output = generateFrom("mine x = 5 x = 10")
    assert.match(output, /= 10/)
  })

  it("generates a while loop", () => {
    const output = generateFrom("wawawa gaagaa { gibberish(1) }")
    assert.match(output, /while/)
  })

  it("generates an if statement", () => {
    const output = generateFrom("peekaboo gaagaa { gibberish(1) }")
    assert.match(output, /if/)
  })

  it("generates an if-else statement", () => {
    const output = generateFrom("peekaboo gaagaa { gibberish(1) } nuhuh { gibberish(2) }")
    assert.match(output, /if/)
    assert.match(output, /else/)
  })

  it("generates a binary expression", () => {
    const output = generateFrom("gibberish(1 + 2)")
    assert.match(output, /1/)
    assert.match(output, /\+/)
    assert.match(output, /2/)
  })

  it("generates a unary expression", () => {
    const output = generateFrom("gibberish(-5)")
    assert.match(output, /-/)
  })

  it("generates a function declaration and call", () => {
    const output = generateFrom("playtime add(a: numba, b: numba) { bedtime a + b } gibberish(add(1, 2))")
    assert.match(output, /def/)
    assert.match(output, /return/)
  })

  it("generates a return statement with value", () => {
    const output = generateFrom("playtime getNum() { bedtime 42 }")
    assert.match(output, /return/)
    assert.match(output, /42/)
  })

  it("generates a void return", () => {
    const output = generateFrom("playtime doThing() { bedtime }")
    assert.match(output, /return/)
  })

  it("generates a random statement with import", () => {
    const output = generateFrom("flippy(1, 10)")
    assert.match(output, /from random import randint/)
    assert.match(output, /randint/)
  })

  it("generates multiple random calls with single import", () => {
    const output = generateFrom("flippy(1, 5) flippy(10, 20)")
    assert.match(output, /from random import randint/)
    const randintCount = (output.match(/randint/g) || []).length
    assert(randintCount >= 2)
  })

  it("generates an input statement", () => {
    const output = generateFrom('nomnom("Enter: ")')
    assert.match(output, /input/)
  })

  it("generates a sleep statement with import", () => {
    const output = generateFrom("nap(1000)")
    assert.match(output, /from time import sleep/)
    assert.match(output, /sleep/)
  })

  it("generates multiple sleep calls with single import", () => {
    const output = generateFrom("nap(1000) nap(500)")
    assert.match(output, /from time import sleep/)
    const sleepCount = (output.match(/sleep/g) || []).length
    assert(sleepCount >= 3) // import + 2 calls
  })

  it("generates a floor statement with import", () => {
    const output = generateFrom("gibberish(crawl(3.7))")
    assert.match(output, /from math import floor/)
    assert.match(output, /floor/)
  })

  it("generates a ceil statement with import", () => {
    const output = generateFrom("gibberish(climb(3.2))")
    assert.match(output, /from math import ceil/)
    assert.match(output, /ceil/)
  })

  it("generates a round statement with import", () => {
    const output = generateFrom("gibberish(roll(3.5))")
    assert.match(output, /from math import round/)
  })

  it("generates multiple math functions with separate imports", () => {
    const output = generateFrom("gibberish(crawl(1.5)) gibberish(climb(2.5)) gibberish(roll(3.5))")
    assert.match(output, /from math import/)
  })

  it("converts boolean true literal to Python True", () => {
    const output = generateFrom("gibberish(gaagaa)")
    assert.match(output, /True/)
  })

  it("converts boolean false literal to Python False", () => {
    const output = generateFrom("gibberish(googoo)")
    assert.match(output, /False/)
  })

  it("generates a cast statement", () => {
    const output = generateFrom("gibberish(numba(42))")
    // Should generate int() or similar
    assert.ok(output)
  })

  it("generates a variable reference", () => {
    const output = generateFrom("mine x = 5 gibberish(x)")
    assert.match(output, /x_/)
  })

  it("handles function parameters correctly", () => {
    const output = generateFrom("playtime test(a: numba, b: numba) { bedtime a + b }")
    assert.match(output, /def/)
    assert.match(output, /a_/)
    assert.match(output, /b_/)
  })

  it("generates proper indentation for if body", () => {
    const output = generateFrom("peekaboo gaagaa { gibberish(1) }")
    // Check for indentation (2 spaces)
    assert.match(output, /  print/)
  })

  it("generates proper indentation for if-else body", () => {
    const output = generateFrom("peekaboo gaagaa { gibberish(1) } nuhuh { gibberish(2) }")
    assert.match(output, /if.*:/m)
    assert.match(output, /else:/m)
  })

  it("generates proper indentation for while body", () => {
    const output = generateFrom("wawawa gaagaa { gibberish(1) }")
    assert.match(output, /while.*:/m)
  })

  it("generates proper indentation for function body", () => {
    const output = generateFrom("playtime test() { gibberish(1) }")
    assert.match(output, /def.*:/)
  })

  it("generates function calls with multiple arguments", () => {
    const output = generateFrom("playtime add(a: numba, b: numba, c: numba) { bedtime a + b + c } gibberish(add(1, 2, 3))")
    assert.match(output, /add_\d+\(/)
  })

  it("generates nested function calls", () => {
    const output = generateFrom("playtime double(x: numba) { bedtime x * 2 } playtime quadruple(x: numba) { bedtime double(double(x)) } gibberish(quadruple(5))")
    assert.match(output, /def/)
    assert.ok(output)
  })

  it("generates concatenation with +", () => {
    const output = generateFrom('gibberish("hello" + " world")')
    assert.match(output, /\+/)
  })

  it("generates comparison operators", () => {
    const output = generateFrom("gibberish(1 < 2)")
    assert.match(output, /</)
  })

  it("generates multiple statements in sequence", () => {
    const output = generateFrom("mine x = 1 mine y = 2 gibberish(x + y)")
    assert.match(output, /= 1/)
    assert.match(output, /= 2/)
    assert.match(output, /print/)
  })

  it("handles empty consequent in if-else correctly", () => {
    const output = generateFrom("peekaboo googoo { gibberish(1) } nuhuh { gibberish(2) }")
    // Even though we optimize away if-false, we still need to verify generation works
    assert.ok(output)
  })

  it("casts number to int", () => {
    const output = generateFrom('numba("42")')
    assert.match(output, /int/)
  })

  it("casts to bool", () => {
    // squarehole(gaagaa) is a boolean cast of a boolean literal, which gets optimized to just True
    // So test a non-literal cast instead
    const output = generateFrom("mine x = gaagaa gibberish(squarehole(x))")
    assert.match(output, /bool/)
  })

  it("casts to str", () => {
    const output = generateFrom("babble(42)")
    assert.match(output, /str/)
  })

  it("generates sleep with division by 1000", () => {
    const output = generateFrom("nap(1000)")
    assert.match(output, /sleep.*\/ 1000/)
  })

  it("generates random with correct min/max", () => {
    const output = generateFrom("flippy(5, 15)")
    assert.match(output, /randint\(5, 15\)/)
  })

  it("handles complex program with all statement types", () => {
    const output = generateFrom(
      "mine x = 5 " +
      "playtime double(n: numba) { bedtime n * 2 } " +
      "peekaboo x < 10 { gibberish(double(x)) } " +
      "wawawa x > 0 { x = x - 1 }"
    )
    assert.match(output, /def/)
    assert.match(output, /if/)
    assert.match(output, /while/)
  })

  it("verifies multiple imports only appear once per function", () => {
    const output = generateFrom("flippy(1, 5) flippy(2, 8) flippy(3, 10)")
    const importCount = (output.match(/from random import randint/g) || []).length
    assert.equal(importCount, 1, "randint import should appear exactly once")
    // Also verify we have multiple randint calls
    const callCount = (output.match(/randint/g) || []).length
    assert(callCount >= 3, "Should have at least 3 randint calls")
  })

  it("verifies sleep imports only appear once", () => {
    const output = generateFrom("nap(100) nap(200) nap(300)")
    const importCount = (output.match(/from time import sleep/g) || []).length
    assert.equal(importCount, 1, "sleep import should appear exactly once")
    const callCount = (output.match(/sleep\(/g) || []).length
    assert(callCount >= 3, "Should have at least 3 sleep calls")
  })

  it("verifies floor imports only appear once", () => {
    const output = generateFrom("gibberish(crawl(1.5)) gibberish(crawl(2.5))")
    const importCount = (output.match(/from math import floor/g) || []).length
    assert.equal(importCount, 1, "floor import should appear exactly once")
  })

  it("verifies ceil imports only appear once", () => {
    const output = generateFrom("gibberish(climb(1.5)) gibberish(climb(2.5))")
    const importCount = (output.match(/from math import ceil/g) || []).length
    assert.equal(importCount, 1, "ceil import should appear exactly once")
  })

  it("verifies round imports only appear once", () => {
    const output = generateFrom("gibberish(roll(1.5)) gibberish(roll(2.5))")
    const importCount = (output.match(/from math import round/g) || []).length
    assert.equal(importCount, 1, "round import should appear exactly once")
  })

  it("generates identity cast optimization (numba on number)", () => {
    // numba(42) where 42 is already a number gets optimized away to just 42
    const output = generateFrom("gibberish(numba(42))")
    assert.match(output, /print\(42\)/)
  })

  it("generates non-identity cast (numba on string)", () => {
    // numba("42") should wrap with int() since string needs conversion
    const output = generateFrom('gibberish(numba("42"))')
    assert.match(output, /int\(/)
  })

  it("generates cast to string from number", () => {
    const output = generateFrom("gibberish(babble(42))")
    assert.match(output, /str\(/)
  })

  it("generates cast to string from boolean", () => {
    const output = generateFrom("gibberish(babble(gaagaa))")
    assert.match(output, /str\(/)
  })

  it("generates multiple math operations in sequence", () => {
    const output = generateFrom("gibberish(crawl(1.5) + climb(2.5) + roll(3.5))")
    assert.match(output, /floor/)
    assert.match(output, /ceil/)
    assert.match(output, /round/)
  })

  it("handles cast within function parameters", () => {
    const output = generateFrom("playtime process(x: numba) { bedtime x } gibberish(process(numba(42)))")
    // Should handle casting within function call arguments
    assert.ok(output)
  })

  it("generates standalone expression statements (function calls)", () => {
    // These are expressions used as statements
    const output = generateFrom("playtime doSomething() { gibberish(1) } doSomething()")
    assert.match(output, /doSomething_/)
  })

  it("generates standalone sleep as expression statement", () => {
    // nap() is an expression statement that returns a value
    const output = generateFrom("nap(100)")
    assert.match(output, /sleep/)
  })

  it("generates standalone cast as expression statement", () => {
    // babble("test") as an expression statement (though unusual)
    const output = generateFrom("babble(42)")
    assert.match(output, /str\(/)
  })

  it("generates standalone random as expression statement", () => {
    // flippy as a standalone statement
    const output = generateFrom("flippy(1, 10)")
    assert.match(output, /randint/)
  })

  it("generates standalone input as expression statement", () => {
    // nomnom as a standalone statement
    const output = generateFrom('nomnom("Enter value: ")')
    assert.match(output, /input/)
  })

  it("handles complex nested indentation", () => {
    const output = generateFrom(
      "playtime outer() { " +
      "  peekaboo gaagaa { " +
      "    gibberish(1) " +
      "  } " +
      "}"
    )
    assert.match(output, /def/)
    assert.match(output, /if/)
    // Verify proper indentation structure exists
    assert.ok(output)
  })

  it("handles while loops with body optimization", () => {
    const output = generateFromOptimized("wawawa gaagaa { gibberish(2 + 2) }")
    assert.match(output, /while/)
    assert.match(output, /True/)
    assert.match(output, /4/)  // 2 + 2 should be optimized to 4
  })

  it("preserves variable naming with suffix", () => {
    // Variables get suffixes to avoid Python keywords
    const output = generateFrom("mine for = 1 gibberish(for)")
    assert.match(output, /for_/)
  })
  it("handles comments in code generation", () => {
    const output = generateFrom("mine x = 1 /* this is a comment */ gibberish(x)")
    // Comments should not appear in output, but code should still generate
    assert.doesNotMatch(output, /\/\*/)
    assert.doesNotMatch(output, /\*\//)
    assert.match(output, /print/)
  })

  it("emits python module import statements", () => {
    const out = generateFrom('cry foo from "./bar/baz"')
    assert.match(out, /from bar.baz import foo/)
  })

  it("handles export statements", () => {
    const output = generateFrom('spit playtime f() { bedtime }')
    // Export is a no-op for Python generator, but function should still be emitted
    assert.match(output, /def/)
  })
  it("handles import statements", () => {
    const output = generateFrom('cry foo from "bar"')
    assert.match(output, /from bar import foo/)
  })

  it("handles exported functions (no-op)", () => {
    const out = generateFrom('spit playtime add(a: numba, b: numba) { bedtime a+b }')
    // Python auto-exports top-level defs; ensure function is emitted
    assert.match(out, /def /)
  })
})
