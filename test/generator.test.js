import { describe, it } from "node:test"
import assert from "node:assert"
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"
import generate from "../src/generator.js"

// Helper to run the full pipeline and get JS output
const generateFrom = (source) => generate(analyze(parse(source)))

describe("The generator", () => {
  it("generates a let statement", () => {
    const output = generateFrom("mine x = 5")
    assert.match(output, /let/)
    assert.match(output, /5/)
  })

  it("generates a print statement", () => {
    const output = generateFrom("gibberish(42)")
    assert.match(output, /console\.log/)
    assert.match(output, /42/)
  })

  it("generates a while loop", () => {
    const output = generateFrom("wawawa googoo { gibberish(1) }")
    assert.match(output, /while/)
    assert.match(output, /false/)
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

  it("generates a function declaration and call", () => {
    const output = generateFrom("playtime add(a: numba, b: numba) { bedtime a + b } gibberish(add(1, 2))")
    assert.match(output, /function/)
    assert.match(output, /return/)
  })

  it("generates a floor statement", () => {
    const output = generateFrom("gibberish(crawl(3.7))")
    assert.match(output, /Math\.floor/)
  })

  it("generates a ceil statement", () => {
    const output = generateFrom("gibberish(climb(3.2))")
    assert.match(output, /Math\.ceil/)
  })

  it("generates a round statement", () => {
    const output = generateFrom("gibberish(roll(3.5))")
    assert.match(output, /Math\.round/)
  })

  it("generates a random statement", () => {
    const output = generateFrom("flippy(1, 10)")
    assert.match(output, /Math\.random/)
  })

  it("generates a cast to string", () => {
    const output = generateFrom("babble(42)")
    assert.match(output, /String/)
  })

  it("generates a cast to number", () => {
    const output = generateFrom('numba("42")')
    assert.match(output, /Number/)
  })

  it("generates an identity cast without wrapper", () => {
    // numba(42) should not wrap in Number() since it's already a number
    const output = generateFrom("numba(42)")
    assert.doesNotMatch(output, /Number\(/)
  })

  it("generates a return with value", () => {
    const output = generateFrom("playtime getNum() { bedtime 42 }")
    assert.match(output, /return/)
    assert.match(output, /42/)
  })

  it("generates a void return", () => {
    const output = generateFrom("playtime doThing() { bedtime }")
    assert.match(output, /return;/)
  })

  it("generates a negation", () => {
    const output = generateFrom("gibberish(-5)")
    assert.match(output, /-/)
  })

  it("generates an input statement", () => {
    const output = generateFrom('nomnom("Enter: ")')
    assert.match(output, /__promptInput/)
  })

  it("generates a sleep statement", () => {
    const output = generateFrom("nap(1000)")
    assert.match(output, /setTimeout/)
  })

  it("includes readline helper in output", () => {
    const output = generateFrom('nomnom("Enter: ")')
    assert.match(output, /readline/)
    assert.match(output, /__promptInput/)
  })

  it("generates an assign statement", () => {
    const output = generateFrom("mine x = 5 x = 10")
    assert.match(output, /= 10/)
  })
})