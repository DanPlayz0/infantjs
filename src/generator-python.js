// The code generator exports a single function, generate(program), which
// accepts a program representation and returns the JavaScript translation
// as a string.

// Mostly exists for the required python whitespace code indentation
class PrivateOutput {
  constructor() {
    this.imports = []
    this.output = []
    this.indentLevel = 0
  }

  import(line) {
    this.imports.push(line)
  }

  push(line) {
    this.output.push("  ".repeat(this.indentLevel) + line)
  }

  indent() {
    this.indentLevel++
  }

  dedent() {
    this.indentLevel--
  }

  join(separator = "\n") {
    return [...this.imports, ...this.output].join(separator)
  }
}

export default function generatePython(program) {
  const output = new PrivateOutput()
  let injectedHeaders = new Set()

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

  const moduleVars = new Map()
  const importedBindings = new Map()

  const gen = (node) => {
    if (typeof node === "boolean") return node ? "True" : "False"
    if (typeof node === "string") return JSON.stringify(node)
    if (typeof node === "number") return String(node)
    return generators[node?.kind]?.(node) ?? node
  }

  const generators = {
    Program(p) {
      p.body.forEach((s) => {
        const result = gen(s)
        // Statement generators push to output themselves and return undefined.
        // Expression generators (Random, Cast, Sleep, etc.) return a string —
        // when used as standalone statements we need to push them manually.
        if (typeof result === "string") output.push(`${result}`)
      })
    },

    // Python doesn't have a good syntax for multiline comments other than """, but that would be confusing since it looks like a string literal. Instead, we just ignore comments entirely for python generation.
    Comment(c) {},

    // somehow even though the export is not used, test coverage is uncovered??
    /* c8 ignore next */
    ExportStatement(s) {
      if (s.content) {
        output.push(`${s.content.name} = ${targetName(s.content)}`)
      }
    },

    LetStatement(s) {
      output.push(`${targetName(s.variable)} = ${gen(s.initializer)}`)
    },

    AssignStatement(s) {
      output.push(`${targetName(s.target)} = ${gen(s.source)}`)
    },

    ImportStatement(s) {
      // Use importlib to load modules by file path (supports hyphenated filenames)
      const modPath = s.source
      const sanitized = modPath.replace(/[^A-Za-z0-9]/g, "_")
      const modVar = moduleVars.get(modPath) ?? `__mod_${sanitized}`
      moduleVars.set(modPath, modVar)
      const headerKey = `importlib_${sanitized}`
      if (!injectedHeaders.has(headerKey)) {
        injectedHeaders.add(headerKey)
        output.import(`import importlib.util`)
        // ensure os is available for resolving relative paths at runtime
        if (!injectedHeaders.has("os")) {
          injectedHeaders.add("os")
          output.import(`import os`)
        }
        let pyPathExpr
        if (modPath.startsWith(".") && modPath.endsWith(".infant")) {
          const pyRel = modPath.replace(/\.infant$/, ".py")
          const pyExpr = `os.path.normpath(os.path.join(os.path.dirname(__file__), ${JSON.stringify(pyRel)}))`
          const infExpr = `os.path.normpath(os.path.join(os.path.dirname(__file__), ${JSON.stringify(modPath)}))`
          pyPathExpr = `(${pyExpr} if os.path.exists(${pyExpr}) else ${infExpr})`
        } else if (modPath.startsWith(".")) {
          pyPathExpr = `os.path.normpath(os.path.join(os.path.dirname(__file__), ${JSON.stringify(modPath)}))`
        } else {
          pyPathExpr = JSON.stringify(modPath)
        }
        output.import(`${modVar}_spec = importlib.util.spec_from_file_location("${sanitized}", ${pyPathExpr})`)
        output.import(`assert ${modVar}_spec is not None`)
        output.import(`assert ${modVar}_spec.loader is not None`)
        output.import(`${modVar} = importlib.util.module_from_spec(${modVar}_spec)`)
        output.import(`${modVar}_spec.loader.exec_module(${modVar})`)
      }
      // Determine exported name and requested local name
      let exportedName, requestedLocal
      if (typeof s.identifier === "string") {
        exportedName = s.identifier
        requestedLocal = s.identifier
      } else {
        exportedName = s.identifier.name
        requestedLocal = targetName(s.identifier)
      }
      const key = `${modPath}::${exportedName}`
      if (importedBindings.has(key)) {
        const existingLocal = importedBindings.get(key)
        if (requestedLocal !== existingLocal) {
          output.push(`${requestedLocal} = ${existingLocal}`)
        }
      } else {
        // First time loading this symbol from this module: use getattr
        output.push(`${requestedLocal} = getattr(${modVar}, "${exportedName}")`)
        importedBindings.set(key, requestedLocal)
      }
    },

    PrintStatement(s) {
      const args = s.arguments.map(gen).join(", ")
      output.push(`print(${args})`)
    },

    IfStatement(s) {
      output.push(`if ${gen(s.test)}:`)
      output.indent()
      s.consequent.forEach(gen)
      if (s.alternate.length > 0) {
        output.dedent()
        output.push(`else:`)
        output.indent()
        s.alternate.forEach(gen)
      }
      output.dedent()
    },

    WhileStatement(s) {
      output.push(`while ${gen(s.test)}:`)
      output.indent()
      s.body.forEach(gen)
      output.dedent()
    },

    FunctionDeclaration(s) {
      const params = s.function.params.map((p) => targetName(p)).join(", ")
      output.push(`def ${targetName(s.function)}(${params}):`)
      output.indent()
      s.body.forEach(gen)
      output.dedent()
      if (s.exported) {
        // export alias: module-level name -> generated local name
        output.push(`${s.function.name} = ${targetName(s.function)}`)
      }
    },

    ReturnStatement(s) {
      if (s.value === undefined) {
        output.push(`return`)
      } else {
        output.push(`return ${gen(s.value)}`)
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
      // Map JavaScript operators to Python equivalents
      const operatorMap = {
        "===": "==",
        "!==": "!=",
      }
      const operator = operatorMap[e.operator] ?? e.operator
      return `(${gen(e.left)} ${operator} ${gen(e.right)})`
    },

    UnaryExpression(e) {
      return `(${e.operator}${gen(e.argument)})`
    },

    RandomStatement(s) {
      if (!injectedHeaders.has("randint")) {
        injectedHeaders.add("randint")
        output.import(`from random import randint`)
      }
      // flippy(min, max) → random int between min and max inclusive
      const min = gen(s.minimum)
      const max = gen(s.maximum)
      return `randint(${min}, ${max})`
    },

    InputStatement(s) {
      return `input(${gen(s.prompt)})`
    },

    SleepStatement(s) {
      if (!injectedHeaders.has("sleep")) {
        injectedHeaders.add("sleep")
        output.import(`from time import sleep`)
      }
      // nap(ms) → pause execution for ms milliseconds
      return `sleep(${gen(s.duration)} / 1000)`
    },

    CastStatement(s) {
      // Pre-optimize away identity casts (e.g. numba(42) is already a number)
      if (s.type === typeof s.value) return gen(s.value)
      const castFn = { number: "int", boolean: "bool", string: "str" }[s.type]
      return `${castFn}(${gen(s.value)})`
    },

    FloorStatement(s) {
      if (!injectedHeaders.has("floor")) {
        injectedHeaders.add("floor")
        output.import(`from math import floor`)
      }
      return `floor(${gen(s.value)})`
    },

    CeilStatement(s) {
      if (!injectedHeaders.has("ceil")) {
        injectedHeaders.add("ceil")
        output.import(`from math import ceil`)
      }
      return `ceil(${gen(s.value)})`
    },

    RoundStatement(s) {
      if (!injectedHeaders.has("round")) {
        injectedHeaders.add("round")
        output.import(`from math import round`)
      }
      return `round(${gen(s.value)})`
    },
  }

  gen(program)
  return output.join("\n")
}
