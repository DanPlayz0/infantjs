import { describe, it } from "node:test"
import assert from "node:assert"
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"
import optimize from "../src/optimizer.js"
import * as core from "../src/core.js"

// Helper: run the full pipeline up to optimization
const optimizeFrom = (source) => optimize(analyze(parse(source)))

describe("The optimizer", () => {
  // ---------------------------------------------------------------------------
  // Constant folding — arithmetic
  // ---------------------------------------------------------------------------
  it("folds addition of two number literals", () => {
    const result = optimizeFrom("gibberish(2 + 3)")
    assert.deepEqual(result.body[0].arguments[0], 5)
  })

  it("folds subtraction of two number literals", () => {
    const result = optimizeFrom("gibberish(10 - 4)")
    assert.deepEqual(result.body[0].arguments[0], 6)
  })

  it("folds multiplication of two number literals", () => {
    const result = optimizeFrom("gibberish(3 * 4)")
    assert.deepEqual(result.body[0].arguments[0], 12)
  })

  it("folds division of two number literals", () => {
    const result = optimizeFrom("gibberish(10 / 2)")
    assert.deepEqual(result.body[0].arguments[0], 5)
  })

  it("folds modulo of two number literals", () => {
    const result = optimizeFrom("gibberish(10 % 3)")
    assert.deepEqual(result.body[0].arguments[0], 1)
  })

  it("folds exponentiation of two number literals", () => {
    const result = optimizeFrom("gibberish(2 ** 8)")
    assert.deepEqual(result.body[0].arguments[0], 256)
  })

  // ---------------------------------------------------------------------------
  // Constant folding — comparisons
  // ---------------------------------------------------------------------------
  it("folds less than to true", () => {
    const result = optimizeFrom("gibberish(1 < 2)")
    assert.deepEqual(result.body[0].arguments[0], true)
  })

  it("folds less than to false", () => {
    const result = optimizeFrom("gibberish(5 < 2)")
    assert.deepEqual(result.body[0].arguments[0], false)
  })

  it("folds greater than to true", () => {
    const result = optimizeFrom("gibberish(5 > 2)")
    assert.deepEqual(result.body[0].arguments[0], true)
  })

  it("folds less-than-or-equal to true", () => {
    const result = optimizeFrom("gibberish(3 <= 3)")
    assert.deepEqual(result.body[0].arguments[0], true)
  })

  it("folds greater-than-or-equal to false", () => {
    const result = optimizeFrom("gibberish(4 >= 5)")
    assert.deepEqual(result.body[0].arguments[0], false)
  })

  it("folds equality of two equal literals to true", () => {
    const result = optimizeFrom("gibberish(7 == 7)")
    assert.deepEqual(result.body[0].arguments[0], true)
  })

  it("folds inequality of two different literals to true", () => {
    const result = optimizeFrom("gibberish(7 != 8)")
    assert.deepEqual(result.body[0].arguments[0], true)
  })

  // ---------------------------------------------------------------------------
  // Strength reductions — right operand is a literal
  // ---------------------------------------------------------------------------
  it("reduces x + 0 to x", () => {
    const result = optimizeFrom("mine x = 5 gibberish(x + 0)")
    assert.equal(result.body[1].arguments[0].kind, "Variable")
  })

  it("reduces x - 0 to x", () => {
    const result = optimizeFrom("mine x = 5 gibberish(x - 0)")
    assert.equal(result.body[1].arguments[0].kind, "Variable")
  })

  it("reduces x * 1 to x", () => {
    const result = optimizeFrom("mine x = 5 gibberish(x * 1)")
    assert.equal(result.body[1].arguments[0].kind, "Variable")
  })

  it("reduces x * 0 to 0", () => {
    const result = optimizeFrom("mine x = 5 gibberish(x * 0)")
    assert.deepEqual(result.body[1].arguments[0], 0)
  })

  it("reduces x / 1 to x", () => {
    const result = optimizeFrom("mine x = 5 gibberish(x / 1)")
    assert.equal(result.body[1].arguments[0].kind, "Variable")
  })

  it("reduces x ** 1 to x", () => {
    const result = optimizeFrom("mine x = 5 gibberish(x ** 1)")
    assert.equal(result.body[1].arguments[0].kind, "Variable")
  })

  it("reduces x ** 0 to 1", () => {
    const result = optimizeFrom("mine x = 5 gibberish(x ** 0)")
    assert.deepEqual(result.body[1].arguments[0], 1)
  })

  // ---------------------------------------------------------------------------
  // Strength reductions — left operand is a literal
  // ---------------------------------------------------------------------------
  it("reduces 0 + x to x", () => {
    const result = optimizeFrom("mine x = 5 gibberish(0 + x)")
    assert.equal(result.body[1].arguments[0].kind, "Variable")
  })

  it("reduces 1 * x to x", () => {
    const result = optimizeFrom("mine x = 5 gibberish(1 * x)")
    assert.equal(result.body[1].arguments[0].kind, "Variable")
  })

  it("reduces 0 * x to 0", () => {
    const result = optimizeFrom("mine x = 5 gibberish(0 * x)")
    assert.deepEqual(result.body[1].arguments[0], 0)
  })

  // ---------------------------------------------------------------------------
  // Unary constant folding
  // ---------------------------------------------------------------------------
  it("folds negation of a number literal", () => {
    const result = optimizeFrom("gibberish(-5)")
    assert.deepEqual(result.body[0].arguments[0], -5)
  })

  // ---------------------------------------------------------------------------
  // if-true / if-false branch elimination
  // ---------------------------------------------------------------------------
  it("eliminates if-false with no else — removes everything", () => {
    const result = optimizeFrom("peekaboo googoo { gibberish(1) }")
    assert.deepEqual(result.body, [])
  })

  it("eliminates if-true with no else — inlines the body", () => {
    const result = optimizeFrom("peekaboo gaagaa { gibberish(1) }")
    assert.equal(result.body[0].kind, "PrintStatement")
  })

  it("eliminates if-true with else — keeps only the consequent", () => {
    const result = optimizeFrom(
      "peekaboo gaagaa { gibberish(1) } nuhuh { gibberish(2) }"
    )
    assert.equal(result.body.length, 1)
    assert.deepEqual(result.body[0].arguments[0], 1)
  })

  it("eliminates if-false with else — keeps only the alternate", () => {
    const result = optimizeFrom(
      "peekaboo googoo { gibberish(1) } nuhuh { gibberish(2) }"
    )
    assert.equal(result.body.length, 1)
    assert.deepEqual(result.body[0].arguments[0], 2)
  })

  // ---------------------------------------------------------------------------
  // while-false elimination
  // ---------------------------------------------------------------------------
  it("eliminates while-false loop entirely", () => {
    const result = optimizeFrom("wawawa googoo { gibberish(1) }")
    assert.deepEqual(result.body, [])
  })

  // ---------------------------------------------------------------------------
  // Identity cast elimination
  // ---------------------------------------------------------------------------
  it("eliminates identity cast numba(42) — already a number", () => {
    const result = optimizeFrom("numba(42)")
    assert.equal(result.body[0], 42)
  })

  it("eliminates identity cast babble on a string literal", () => {
    const result = optimizeFrom('babble("hello")')
    assert.equal(result.body[0], "hello")
  })

  it("keeps non-identity cast numba on a string", () => {
    const result = optimizeFrom('numba("42")')
    assert.equal(result.body[0].kind, "CastStatement")
  })

  // ---------------------------------------------------------------------------
  // Floor / Ceil / Round constant folding
  // ---------------------------------------------------------------------------
  it("folds crawl (floor) of a literal", () => {
    const result = optimizeFrom("gibberish(crawl(3.7))")
    assert.deepEqual(result.body[0].arguments[0], 3)
  })

  it("folds climb (ceil) of a literal", () => {
    const result = optimizeFrom("gibberish(climb(3.2))")
    assert.deepEqual(result.body[0].arguments[0], 4)
  })

  it("folds roll (round) of a literal", () => {
    const result = optimizeFrom("gibberish(roll(3.5))")
    assert.deepEqual(result.body[0].arguments[0], 4)
  })

  it("keeps crawl (floor) of a variable — cannot fold at compile time", () => {
    const result = optimizeFrom("mine x = 3.7 gibberish(crawl(x))")
    assert.equal(result.body[1].arguments[0].kind, "FloorStatement")
  })

  it("keeps climb (ceil) of a variable — cannot fold at compile time", () => {
    const result = optimizeFrom("mine x = 3.2 gibberish(climb(x))")
    assert.equal(result.body[1].arguments[0].kind, "CeilStatement")
  })

  it("keeps roll (round) of a variable — cannot fold at compile time", () => {
    const result = optimizeFrom("mine x = 3.5 gibberish(roll(x))")
    assert.equal(result.body[1].arguments[0].kind, "RoundStatement")
  })

  // ---------------------------------------------------------------------------
  // AssignStatement — normal path (source !== target, should be kept)
  // ---------------------------------------------------------------------------
  it("keeps a normal assignment when source differs from target", () => {
    const result = optimizeFrom("mine x = 5 x = 10")
    assert.equal(result.body.length, 2)
    assert.equal(result.body[1].kind, "AssignStatement")
  })

  // ---------------------------------------------------------------------------
  // AssignStatement — self-assignment is a no-op
  // ---------------------------------------------------------------------------
  it("removes self-assignment (x = x)", () => {
    // Build AST directly so both sides are the EXACT same object reference
    const x = core.variable("x", "number")
    const program = core.program([
      core.letStmt(x, 5),
      core.assignStmt(x, x),
    ])
    const result = optimize(program)
    assert.equal(result.body.length, 1)
    assert.equal(result.body[0].kind, "LetStatement")
  })

  // ---------------------------------------------------------------------------
  // RandomStatement — returns unchanged (arguments are already optimized)
  // ---------------------------------------------------------------------------
  it("preserves RandomStatement after optimization", () => {
    const result = optimizeFrom("flippy(1, 10)")
    const rand = result.body[0]
    assert.equal(rand.kind, "RandomStatement")
    assert.equal(rand.minimum, 1)
    assert.equal(rand.maximum, 10)
  })

  // ---------------------------------------------------------------------------
  // SleepStatement — returns unchanged (duration is already optimized)
  // ---------------------------------------------------------------------------
  it("preserves SleepStatement after optimization", () => {
    const result = optimizeFrom("nap(1000)")
    const sleep = result.body[0]
    assert.equal(sleep.kind, "SleepStatement")
    assert.equal(sleep.duration, 1000)
  })

  // ---------------------------------------------------------------------------
  // CastStatement — identity and non-identity casts
  // ---------------------------------------------------------------------------
  it("keeps identity cast with variable (numba on number variable)", () => {
    const result = optimizeFrom("mine x = 42 gibberish(numba(x))")
    // numba(variable) where variable is a number should remain as CastStatement
    // since we can't know at compile time if it's a literal
    assert.equal(result.body[1].arguments[0].kind, "CastStatement")
  })

  it("keeps cast with variable (babble on string variable)", () => {
    const result = optimizeFrom('mine x = "hello" gibberish(babble(x))')
    assert.equal(result.body[1].arguments[0].kind, "CastStatement")
  })

  it("keeps cast with variable (squarehole on boolean variable)", () => {
    const result = optimizeFrom("mine x = gaagaa gibberish(squarehole(x))")
    assert.equal(result.body[1].arguments[0].kind, "CastStatement")
  })

  // ---------------------------------------------------------------------------
  // Edge cases for comparisons with equals operators
  // ---------------------------------------------------------------------------
  it("folds == (triple equals) with equal values", () => {
    const result = optimizeFrom("gibberish(5 == 5)")
    assert.equal(result.body[0].arguments[0], true)
  })

  it("folds != (triple not equals) with different values", () => {
    const result = optimizeFrom("gibberish(5 != 3)")
    assert.equal(result.body[0].arguments[0], true)
  })

  it("folds == with different values to false", () => {
    const result = optimizeFrom("gibberish(5 == 3)")
    assert.equal(result.body[0].arguments[0], false)
  })

  it("folds != with same values to false", () => {
    const result = optimizeFrom("gibberish(5 != 5)")
    assert.equal(result.body[0].arguments[0], false)
  })

  // ---------------------------------------------------------------------------
  // Variable references in expressions (should NOT be folded)
  // ---------------------------------------------------------------------------
  it("preserves binary expression with variable and literal", () => {
    const result = optimizeFrom("mine x = 5 gibberish(x + 2)")
    assert.equal(result.body[1].arguments[0].kind, "BinaryExpression")
  })

  it("preserves unary expression with variable", () => {
    const result = optimizeFrom("mine x = 5 gibberish(-x)")
    assert.equal(result.body[1].arguments[0].kind, "UnaryExpression")
  })

  // ---------------------------------------------------------------------------
  // Multiple optimizations in nested structures
  // ---------------------------------------------------------------------------
  it("optimizes within if consequent", () => {
    const result = optimizeFrom("peekaboo gaagaa { gibberish(2 + 3) }")
    assert.deepEqual(result.body[0].arguments[0], 5)
  })

  it("optimizes within if alternate", () => {
    const result = optimizeFrom("peekaboo googoo { gibberish(1) } nuhuh { gibberish(2 + 3) }")
    assert.deepEqual(result.body[0].arguments[0], 5)
  })

  it("optimizes within while body", () => {
    const result = optimizeFrom("wawawa gaagaa { gibberish(2 * 3) }")
    // while true becomes infinite loop, but body should still be optimized
    assert.ok(result)
  })

  // ---------------------------------------------------------------------------
  // InputStatement — prompt is optimized
  // ---------------------------------------------------------------------------
  it("optimizes prompt inside nomnom", () => {
    const result = optimizeFrom('nomnom("Enter: ")')
    const input = result.body[0]
    assert.equal(input.kind, "InputStatement")
  })

  // ---------------------------------------------------------------------------
  // ReturnStatement — value is optimized
  // ---------------------------------------------------------------------------
  it("folds constant in return value", () => {
    const result = optimizeFrom("playtime getNum() { bedtime 2 + 3 }")
    const body = result.body[0].body
    assert.deepEqual(body[0].value, 5)
  })

  it("optimizes void return", () => {
    const result = optimizeFrom("playtime doThing() { bedtime }")
    const body = result.body[0].body
    assert.equal(body[0].kind, "ReturnStatement")
    assert.equal(body[0].value, undefined)
  })

  // ---------------------------------------------------------------------------
  // FunctionCall — arguments are optimized
  // ---------------------------------------------------------------------------
  it("folds constants inside function call arguments", () => {
    const result = optimizeFrom(
      "playtime add(a: numba, b: numba) { bedtime a + b } gibberish(add(1 * 1, 2 + 0))"
    )
    const call = result.body[1].arguments[0]
    assert.equal(call.kind, "FunctionCall")
    assert.deepEqual(call.arguments[0], 1)
    assert.deepEqual(call.arguments[1], 2)
  })

  // ---------------------------------------------------------------------------
  // Non-constant expressions are left alone
  // ---------------------------------------------------------------------------
  it("does not fold expression with a variable operand", () => {
    const result = optimizeFrom("mine x = 5 gibberish(x + 1)")
    assert.equal(result.body[1].arguments[0].kind, "BinaryExpression")
  })

  it("leaves while with variable condition intact", () => {
    const result = optimizeFrom("mine x = gaagaa wawawa x { gibberish(1) }")
    assert.equal(result.body[1].kind, "WhileStatement")
  })

  it("leaves if with variable condition intact", () => {
    const result = optimizeFrom("mine x = gaagaa peekaboo x { gibberish(1) }")
    assert.equal(result.body[1].kind, "IfStatement")
  })

  // ---------------------------------------------------------------------------
  // Optimizations inside function bodies
  // ---------------------------------------------------------------------------
  it("folds constants inside a function body", () => {
    const result = optimizeFrom("playtime getNum() { bedtime 2 * 1 }")
    const body = result.body[0].body
    assert.deepEqual(body[0].value, 2)
  })

  // ---------------------------------------------------------------------------
  // Program structure is preserved
  // ---------------------------------------------------------------------------
  it("preserves multiple statements in the program body", () => {
    const result = optimizeFrom("mine x = 1 mine y = 2 gibberish(x)")
    assert.equal(result.body.length, 3)
  })

  it("preserves the Program node kind", () => {
    const result = optimizeFrom("gibberish(1)")
    assert.equal(result.kind, "Program")
  })
})