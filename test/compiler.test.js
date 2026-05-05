import { describe, it } from "node:test"
import assert from "node:assert/strict"
import compile from "../src/compiler.js"

describe("The compiler", () => {
  // ---------------------------------------------------------------------------
  // Basic pipeline modes
  // ---------------------------------------------------------------------------
  it("parsed mode returns success string", () => {
    const result = compile("gibberish(1)", "parsed")
    assert.equal(result, "Syntax is ok")
  })

  it("analyzed mode returns an AST with kind Program", () => {
    const result = compile("gibberish(1)", "analyzed")
    assert.ok(result)
    assert.equal(result.kind, "Program")
  })

  it("optimized mode returns an AST with kind Program", () => {
    const result = compile("gibberish(1 + 2)", "optimized")
    assert.ok(result)
    assert.equal(result.kind, "Program")
  })

  it("js generation returns a string", () => {
    const result = compile("gibberish(1)", "js")
    assert.equal(typeof result, "string")
  })

  it("py generation returns a string", () => {
    const result = compile("gibberish(1)", "py")
    assert.equal(typeof result, "string")
  })

  it("throws on unknown output type", () => {
    assert.throws(() => compile("gibberish(1)", "wat"), /Unknown output type/)
  })

  // ---------------------------------------------------------------------------
  // Optimization behaviour visible in JS output
  // ---------------------------------------------------------------------------
  it("constant folding: 2 + 3 becomes 5 in output", () => {
    const result = compile("gibberish(2 + 3)", "js")
    assert.match(result, /5/)
  })

  it("nested constant folding: (2 + 3) * 4 becomes 20", () => {
    const result = compile("gibberish((2 + 3) * 4)", "js")
    assert.match(result, /20/)
  })

  it("precedence folding: 2 + 3 * 4 becomes 14", () => {
    // Term (* / %) binds tighter than Condition (+ -), so 3*4=12 then 2+12=14
    const result = compile("gibberish(2 + 3 * 4)", "js")
    assert.match(result, /14/)
  })

  it("while-false loop is removed entirely", () => {
    const result = compile("wawawa googoo { gibberish(1) }", "js")
    // The body should have been optimized away
    assert.doesNotMatch(result, /while/)
  })

  it("while loop with variable condition is kept", () => {
    const result = compile("mine x = 0 wawawa x < 3 { gibberish(x) x = x + 1 }", "js")
    assert.match(result, /while/)
  })

  it("handles multiple statements", () => {
    const result = compile("mine x = 1 gibberish(x)", "js")
    assert.match(result, /let/)
    assert.match(result, /console\.log/)
  })

  // ---------------------------------------------------------------------------
  // JS vs Python output differ
  // ---------------------------------------------------------------------------
  it("python output differs from js output", () => {
    const js = compile("gibberish(1)", "js")
    const py = compile("gibberish(1)", "py")
    assert.notEqual(js, py)
  })

  it("python output contains print", () => {
    const result = compile("gibberish(1)", "py")
    assert.match(result, /print/)
  })

  it("js output contains console.log", () => {
    const result = compile("gibberish(1)", "js")
    assert.match(result, /console\.log/)
  })
})
