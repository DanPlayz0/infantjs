// The optimizer module exports a single function, optimize(node), which
// performs machine-independent optimizations on the analyzed semantic
// representation before code generation.
//
// Optimizations performed:
//   - constant folding: arithmetic on two literals becomes a single literal
//     (e.g. 2 + 3 becomes 5, 10 / 2 becomes 5)
//   - strength reductions: algebraic identities that simplify expressions
//     (e.g. x + 0 → x, x * 1 → x, x * 0 → 0, x ** 1 → x, x ** 0 → 1)
//   - identity cast elimination: casting a value to its own type is removed
//     (e.g. numba(42) → 42, babble("hi") → "hi")
//   - if-true / if-false: if condition is a literal boolean, keep only the
//     taken branch (e.g. peekaboo gaagaa { ... } → just the body)
//   - while-false: a while loop whose condition is literally false is removed
//     entirely (it would never execute)

import * as core from "./core.js"

export default function optimize(node) {
  return optimizers[node?.kind]?.(node) ?? node
}

const optimizers = {
  Program(p) {
    p.body = p.body.flatMap(optimize)
    return p
  },

  LetStatement(s) {
    s.initializer = optimize(s.initializer)
    return s
  },

  AssignStatement(s) {
    s.source = optimize(s.source)
    // x = x is a no-op — drop it entirely
    if (s.source === s.target) return []
    return s
  },

  PrintStatement(s) {
    s.arguments = s.arguments.map(optimize)
    return s
  },

  IfStatement(s) {
    s.test = optimize(s.test)
    s.consequent = s.consequent.flatMap(optimize)
    s.alternate = s.alternate.flatMap(optimize)
    // if the condition is a boolean literal, keep only the taken branch
    if (s.test === true) return s.consequent
    if (s.test === false) return s.alternate
    return s
  },

  WhileStatement(s) {
    s.test = optimize(s.test)
    // while false never executes — remove it entirely
    if (s.test === false) return []
    s.body = s.body.flatMap(optimize)
    return s
  },

  FunctionDeclaration(s) {
    s.body = s.body.flatMap(optimize)
    return s
  },

  ReturnStatement(s) {
    if (s.value !== undefined) s.value = optimize(s.value)
    return s
  },

  BinaryExpression(e) {
    e.left = optimize(e.left)
    e.right = optimize(e.right)
    const x = e.left
    const y = e.right
    const op = e.operator

    // Constant folding: both operands are number literals
    if (typeof x === "number" && typeof y === "number") {
      if (op === "+") return x + y
      if (op === "-") return x - y
      if (op === "*") return x * y
      if (op === "/") return x / y
      if (op === "%") return x % y
      if (op === "**") return x ** y
      if (op === "<") return x < y
      if (op === ">") return x > y
      if (op === "<=") return x <= y
      if (op === ">=") return x >= y
      if (op === "===") return x === y
      if (op === "!==") return x !== y
    }

    // Strength reductions on the right operand
    if (typeof y === "number") {
      if (op === "+" && y === 0) return x   // x + 0 → x
      if (op === "-" && y === 0) return x   // x - 0 → x
      if (op === "*" && y === 1) return x   // x * 1 → x
      if (op === "*" && y === 0) return 0   // x * 0 → 0
      if (op === "/" && y === 1) return x   // x / 1 → x
      if (op === "**" && y === 1) return x  // x ** 1 → x
      if (op === "**" && y === 0) return 1  // x ** 0 → 1
    }

    // Strength reductions on the left operand
    if (typeof x === "number") {
      if (op === "+" && x === 0) return y   // 0 + x → x
      if (op === "*" && x === 1) return y   // 1 * x → x
      if (op === "*" && x === 0) return 0   // 0 * x → 0
    }

    return e
  },

  UnaryExpression(e) {
    e.argument = optimize(e.argument)
    // Constant folding: -5 → just the number -5
    if (e.operator === "-" && typeof e.argument === "number") return -e.argument
    return e
  },

  FunctionCall(e) {
    e.arguments = e.arguments.map(optimize)
    return e
  },

  RandomStatement(s) {
    s.minimum = optimize(s.minimum)
    s.maximum = optimize(s.maximum)
    return s
  },

  SleepStatement(s) {
    s.duration = optimize(s.duration)
    return s
  },

  InputStatement(s) {
    s.prompt = optimize(s.prompt)
    return s
  },

  CastStatement(s) {
    s.value = optimize(s.value)
    // Identity cast: the value is already the target type — drop the wrapper
    if (s.type === typeof s.value) return s.value
    return s
  },

  FloorStatement(s) {
    s.value = optimize(s.value)
    // Constant folding: crawl(3.7) → 3
    if (typeof s.value === "number") return Math.floor(s.value)
    return s
  },

  CeilStatement(s) {
    s.value = optimize(s.value)
    // Constant folding: climb(3.2) → 4
    if (typeof s.value === "number") return Math.ceil(s.value)
    return s
  },

  RoundStatement(s) {
    s.value = optimize(s.value)
    // Constant folding: roll(3.5) → 4
    if (typeof s.value === "number") return Math.round(s.value)
    return s
  },
}