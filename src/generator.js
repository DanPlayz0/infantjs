// The code generator exports a single function, generate(program), which
// accepts a program representation and returns the JavaScript translation
// as a string.

class PrivateOutput {
  constructor() {
    this.output = []
    this.indentLevel = 0
  }
  
  push(line) {
    this.output.push("  ".repeat(this.indentLevel) + line)
  }

  unshift(line) {
    this.output.unshift(line)
  }

  indent() {
    this.indentLevel++
  }

  dedent() {
    this.indentLevel--
  }

  join(separator = "\n") {
    return this.output.join(separator)
  }
}

export default function generate(program) {
  const output = new PrivateOutput();
  let injectedHeaders = new Set();

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

  const gen = (node) => {
  if (typeof node === "string") return `"${node}"`
  if (typeof node === "boolean") return node
  return generators[node?.kind]?.(node) ?? node
  }

  const generators = {
    Program(p) {
      output.push(`async function __main() {`)
      output.indent()
      p.body.forEach(s => {
        const result = gen(s)
        if (typeof result === "string") output.push(`${result};`)
      })
      output.dedent()
      output.push(`}`)
      output.push(`__main();`)
    },

    Comment(c) {
      output.push(`/* ${c.content} */`)
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
      output.indent()
      s.consequent.forEach(gen)
      output.dedent()
      output.push(`}`)
      if (s.alternate.length > 0) {
        output.push(`else {`)
        output.indent()
        s.alternate.forEach(gen)
        output.dedent()
        output.push(`}`)
      }
    },

    WhileStatement(s) {
      output.push(`while (${gen(s.test)}) {`)
      output.indent()
      s.body.forEach(gen)
      output.dedent()
      output.push(`}`)
    },

    FunctionDeclaration(s) {
      const params = s.function.params.map((p) => targetName(p)).join(", ")
      output.push(`function ${targetName(s.function)}(${params}) {`)
      output.indent()
      s.body.forEach(gen)
      output.dedent()
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
      if (!injectedHeaders.has("input")) {
        injectedHeaders.add("input")
        output.unshift([
          `import * as readline from 'node:readline/promises';`,
          `import { stdin as input, stdout as output } from 'node:process';`,
          ``,
          `async function __promptInput(prompt) {`,
          `  const rl = readline.createInterface({ input, output });`,
          `  const answer = await rl.question(prompt);`,
          `  rl.close();`,
          `  return answer;`,
          `}`,
          ``,
        ].join("\n"))
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