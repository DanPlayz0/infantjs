// The code generator exports a single function, generate(program), which
// accepts a program representation and returns the JavaScript translation
// as a string.

export default function generate(program) {
  const output = []
  let inputFunctionInjected = false

  // Each variable/function gets a unique suffix to avoid collisions
  // with JavaScript reserved words (e.g. a variable named "for" becomes "for_1")
  const targetName = ((mapping) => {
    return (entity) => {
      if (!mapping.has(entity)) {
        mapping.set(entity, mapping.size + 1)
      }
      return `${entity.name}_${mapping.get(entity)}`
    }
  })(new Map())

  const gen = (node) => generators[node?.kind]?.(node) ?? node

  const generators = {
    Program(p) {
      p.body.forEach(s => {
        const result = gen(s)
        // Statement generators push to output themselves and return undefined.
        // Expression generators (Random, Cast, Sleep, etc.) return a string —
        // when used as standalone statements we need to push them manually.
        if (typeof result === "string") output.push(`${result};`)
      })
    },

    LetStatement(s) {
      output.push(`let ${targetName(s.variable)} = ${gen(s.initializer)};`)
    },

    AssignStatement(s) {
      output.push(`${targetName(s.target)} = ${gen(s.source)};`)
    },

    PrintStatement(s) {
      const args = s.arguments.map(gen).join(", ")
      output.push(`console.log(${args});`)
    },

    IfStatement(s) {
      output.push(`if (${gen(s.test)}) {`)
      s.consequent.forEach(gen)
      output.push(`}`)
      if (s.alternate.length > 0) {
        output.push(`else {`)
        s.alternate.forEach(gen)
        output.push(`}`)
      }
    },

    WhileStatement(s) {
      output.push(`while (${gen(s.test)}) {`)
      s.body.forEach(gen)
      output.push(`}`)
    },

    FunctionDeclaration(s) {
      const params = s.function.params.map((p) => `${p.name}_${p.name}`).join(", ")
      output.push(`function ${targetName(s.function)}(${params}) {`)
      s.body.forEach(gen)
      output.push(`}`)
    },

    ReturnStatement(s) {
      if (s.value === undefined) {
        output.push(`return;`)
      } else {
        output.push(`return ${gen(s.value)};`)
      }
    },

    FunctionCall(e) {
      const args = e.arguments.map(gen).join(", ")
      return `${targetName(e.callee)}(${args})`
    },

    Variable(v) {
      return targetName(v)
    },

    BinaryExpression(e) {
      return `(${gen(e.left)} ${e.operator} ${gen(e.right)})`
    },

    UnaryExpression(e) {
      return `(${e.operator}${gen(e.argument)})`
    },

    RandomStatement(s) {
      // flippy(min, max) → random int between min and max inclusive
      const min = gen(s.minimum)
      const max = gen(s.maximum)
      return `Math.floor(Math.random() * (Math.floor(${max}) - Math.ceil(${min}) + 1) + Math.ceil(${min}))`
    },

    InputStatement(s) {
      if (!inputFunctionInjected) {
        // optimization: only inject the input function if it's actually used in the program
        inputFunctionInjected = true
        output.unshift(`import * as readline from 'node:readline/promises';`)
        output.unshift(`import { stdin as input, stdout as output } from 'node:process';`)
        output.unshift(``)
        output.unshift(`async function __promptInput(prompt) {`)
        output.unshift(`  const rl = readline.createInterface({ input, output });`)
        output.unshift(`  const answer = await rl.question(prompt);`)
        output.unshift(`  rl.close();`)
        output.unshift(`  return answer;`)
        output.unshift(`}`)
        output.unshift(``)
      }

      return `await __promptInput(${gen(s.prompt)})`
    },

    SleepStatement(s) {
      // nap(ms) → pause execution for ms milliseconds
      return `await new Promise(r => setTimeout(r, ${gen(s.duration)}))`
    },

    CastStatement(s) {
      // Optimize away identity casts (e.g. numba(42) is already a number)
      if (s.type === typeof s.value) return gen(s.value)
      const castFn = { number: "Number", boolean: "Boolean", string: "String" }[s.type]
      return `${castFn}(${gen(s.value)})`
    },

    FloorStatement(s) {
      return `Math.floor(${gen(s.value)})`
    },

    CeilStatement(s) {
      return `Math.ceil(${gen(s.value)})`
    },

    RoundStatement(s) {
      return `Math.round(${gen(s.value)})`
    },
  }

  gen(program)
  return output.join("\n")
}