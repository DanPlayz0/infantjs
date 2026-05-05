import * as core from "./core.js"
import parse from "./parser.js"
import * as fs from "node:fs"
import path from "node:path"

/**
 * A context contains a mapping of identifiers to entities.
 * Contexts are nested: a context may have a parent context,
 * and lookups will traverse up the chain of parent contexts.
 */
class Context {
  constructor(parent = null) {
    this.parent = parent
    this.bindings = new Map()
  }

  get(name, at) {
    if (this.bindings.has(name)) {
      return this.bindings.get(name)
    } else if (this.parent) {
      return this.parent.get(name, at)
    } else {
      error(`Undefined variable: ${name}`, at)
    }
  }

  set(name, value, at) {
    if (this.bindings.has(name)) {
      error(`Variable already declared: ${name}`, at)
    }
    this.bindings.set(name, value)
  }
}

/** @param {string} message @param {import('ohm-js').Node['source']} at */
function error(message, at) {
  const prefix = at.getLineAndColumnMessage()
  throw new Error(`${prefix}${message}`)
}

function typeOf(value) {
  return value?.type ?? typeof value
}

function validate(condition, message, at) {
  if (!condition) {
    error(message, at)
  }
}

function validateBoolean(value, at) {
  validate(typeOf(value) === "boolean", `Expected a boolean, but got ${typeOf(value)}`, at)
}

function validateNumber(expression, at) {
  const type = typeOf(expression)
  validate(type === "number", `Expected a number, but got ${type}`, at)
}

function validateSameType(target, source, at) {
  validate(typeOf(target) === typeOf(source), `Type mismatch: cannot assign ${typeOf(source)} to ${typeOf(target)}`, at)
}

function validateFunction(value, at) {
  validate(value.kind === "FunctionObject", `Expected a function, but got ${value.kind}`, at)
}

function validateVariable(value, at) {
  validate(value.kind === "Variable", `Expected a variable, but got ${value.kind}`, at)
}

function validateString(value, at) {
  validate(typeOf(value) === "string", `Expected a string, but got ${typeOf(value)}`, at)
}

function resolvedType(typeName, source) {
  validate(["numba", "squarehole", "babble"].includes(typeName), `Unknown type: ${typeName}`, source)
  const resolvedType = { numba: "number", squarehole: "boolean", babble: "string" }[typeName]
  return resolvedType
}

/** @param {import('ohm-js').MatchResult} match */
export default function translate(match, filename = undefined) {
  let context = new Context()
  const currentFile = filename

  const grammar = match.matcher.grammar

  /** @type {import("ohm-js").ActionDict<any>} */
  const actions = {
    Program(statements) {
      return core.program(statements.children.map((s) => s.translate()))
    },

    PrintStmt(_print, _open, expression, _close) {
      const argument = expression.translate()
      return core.printStmt(argument)
    },

    LetStmt(_let, id, _eq, expression) {
      const source = expression.translate()
      const target = core.variable(id.sourceString, typeOf(source))
      context.set(id.sourceString, target, id.source)
      return core.letStmt(target, source)
    },

    Binding(id, _colon, type) {
      const name = id.sourceString
      const typeName = type.sourceString
      return { name, type: resolvedType(typeName, type.source) }
    },

    FunDecl(_function, id, _open, params, _close, block) {
      const bindings = params.asIteration().children.map((b) => b.translate())
      const funContext = new Context(context)
      const paramList = bindings.map((binding) => {
        const variable = core.variable(binding.name, binding.type)
        funContext.set(binding.name, variable, id.source)
        return variable
      })
      const previousContext = context
      context = funContext
      const body = block.translate()
      const func = core.functionObject(id.sourceString, paramList)
      context = previousContext
      context.set(id.sourceString, func, id.source)
      return core.functionDecl(func, body)
    },

    Block(_open, statements, _close) {
      return statements.children.map((s) => s.translate())
    },

    IfStmt_noelse(_if, expression, block) {
      const test = expression.translate()
      validateBoolean(test, expression.source)
      const consequent = block.translate()
      return core.ifStmt(test, consequent, [])
    },

    IfStmt_else(_if, expression, block1, _else, block2) {
      const test = expression.translate()
      validateBoolean(test, expression.source)
      const consequent = block1.translate()
      const alternate = block2.translate()
      return core.ifStmt(test, consequent, alternate)
    },

    WhileStmt(_while, expression, block) {
      const test = expression.translate()
      validateBoolean(test, expression.source)
      const body = block.translate()
      return core.whileStmt(test, body)
    },

    AssignStmt(id, _eq, expression) {
      const target = context.get(id.sourceString, id.source)
      validateVariable(target, id.source)
      const source = expression.translate()
      validateSameType(target, source, id.source)
      return core.assignStmt(target, source)
    },

    RandomStmt(_random, _open, num1, _comma, num2, _close) {
      const min = num1.translate()
      const max = num2.translate()
      validateNumber(min, num1.source)
      validateNumber(max, num2.source)
      return core.randomStmt(min, max)
    },

    ReturnStmt_value(_return, expression) {
      const value = expression.translate()
      return core.returnStmt(value)
    },

    ReturnStmt_void(_return) {
      return core.returnStmt()
    },

    SleepStmt(_sleep, _open, expression, _close) {
      const duration = expression.translate()
      validateNumber(duration, expression.source)
      validate(duration > 0, "Expected a positive number", expression.source)
      return core.sleepStmt(duration)
    },

    InputStmt(_input, _open, prompt, _close) {
      const promptValue = prompt.translate()
      validateString(promptValue, prompt.source)
      return core.inputStmt(promptValue)
    },

    ExportStmt_variable(_export, id) {
      const exportedValue = context.get(id.sourceString, id.source)
      return core.exportStmt(exportedValue)
    },

    ExportStmt_function(_export, funDecl) {
      // Translate the function declaration, mark it as exported,
      // and return the declaration so the function body is emitted.
      const decl = funDecl.translate()
      decl.exported = true
      return decl
    },

    ImportStmt(_import, id, _from, source) {
      let moduleName = source.translate()
      validateString(moduleName, source.source)
      // Enforce .infant extension
      validate(
        moduleName.endsWith(".infant") || moduleName.endsWith(".infantjs"),
        `Module name must end with .infant or .infantjs`,
        source.source,
      )
      const importName = id.sourceString
      // Resolve module file path (try relative to current file, then cwd)
      const candidates = []
      if (currentFile) candidates.push(path.resolve(path.dirname(currentFile), moduleName))
      candidates.push(path.resolve(process.cwd(), moduleName))
      candidates.push(path.resolve(moduleName))
      let moduleContent = null
      let modulePath = null
      for (const p of candidates) {
        if (fs.existsSync(p) && fs.statSync(p).isFile()) {
          moduleContent = fs.readFileSync(p, "utf-8")
          modulePath = p
          break
        }
      }
      if (!moduleContent) {
        error(`Cannot load module ${moduleName}`, source.source)
      }
      const moduleMatch = parse(moduleContent)
      const moduleProgram = translate(moduleMatch, modulePath)
      // Register exported bindings from module into current context
      let importedEntity = null
      for (const stmt of moduleProgram.body) {
        if (stmt.kind === "ExportStatement") {
          const content = stmt.content
          if (content) {
            if (!context.bindings.has(content.name)) context.set(content.name, content, id.source)
            if (content.name === importName) importedEntity = content
            // also support importing under a different local name
            if (!context.bindings.has(importName)) context.set(importName, content, id.source)
            if (!importedEntity) importedEntity = content
          }
        } else if (stmt.kind === "FunctionDeclaration" && stmt.exported) {
          const funObj = stmt.function
          if (funObj) {
            if (!context.bindings.has(funObj.name)) context.set(funObj.name, funObj, id.source)
            if (funObj.name === importName) importedEntity = funObj
            if (!context.bindings.has(importName)) context.set(importName, funObj, id.source)
            if (!importedEntity) importedEntity = funObj
          }
        }
      }
      // If we found an entity, return it as the import identifier so the
      // generator will map it to the same generated local name used in calls.
      const importIdentifier = importedEntity || importName
      return core.importStmt(importIdentifier, moduleName)
    },

    CastStmt(type, _open, expression, _close) {
      const value = expression.translate()
      const typeName = type.sourceString
      const targetType = resolvedType(typeName, type.source)
      const valueType = typeOf(value)
      const allowedCasts = [
        // identity casts
        ["string", "string"], // "" -> ""
        ["number", "number"], // 42 -> 42
        ["boolean", "boolean"], // true -> true

        // num -> string
        ["number", "string"], // 42 -> "42"
        ["string", "number"], // "42" -> 42

        // bool -> string
        ["boolean", "string"], // true -> "true", false -> "false"
        ["string", "boolean"], // "true" -> true, "false" -> false

        // bool -> number
        ["boolean", "number"], // true -> 1, false -> 0
        // ["number", "boolean"], // 0 -> false, >= 0 -> true
      ]
      validate(
        allowedCasts.some(([from, to]) => from === valueType && to === targetType),
        `Cannot cast ${valueType} to ${targetType}`,
        type.source,
      )
      return core.castStmt(value, targetType)
    },

    FloorStmt(_floor, _open, expression, _close) {
      const value = expression.translate()
      validateNumber(value, expression.source)
      return core.floorStmt(value)
    },

    CeilStmt(_ceil, _open, expression, _close) {
      const value = expression.translate()
      validateNumber(value, expression.source)
      return core.ceilStmt(value)
    },

    RoundStmt(_round, _open, expression, _close) {
      const value = expression.translate()
      validateNumber(value, expression.source)
      return core.roundStmt(value)
    },

    Exp_binary(left, op, right) {
      const x = left.translate()
      const y = right.translate()
      validateNumber(x, left.source)
      validateNumber(y, right.source)
      const operator = { "==": "===", "!=": "!==" }[op.sourceString] ?? op.sourceString
      return core.binaryExp(x, operator, y, "boolean")
    },

    Condition_binary(left, op, right) {
      const x = left.translate()
      const y = right.translate()
      if (typeOf(x) === "string" || typeOf(y) === "string") {
        validate(
          op.sourceString === "+",
          `Unsupported operator ${op.sourceString} found with string, expected +`,
          op.source,
        )
        validate(typeOf(x) === typeOf(y), `Type mismatch: cannot concatenate ${typeOf(y)} with ${typeOf(x)}`, op.source)
        return core.binaryExp(x, "+", y, "string")
      }
      validateNumber(x, left.source)
      validateNumber(y, right.source)
      return core.binaryExp(x, op.sourceString, y, "number")
    },

    Term_binary(left, op, right) {
      const x = left.translate()
      const y = right.translate()
      if (typeOf(x) === "string" || typeOf(y) === "string") {
        error(`Operator ${op.sourceString} is not supported for strings`, op.source)
      }
      validateNumber(x, left.source)
      validateNumber(y, right.source)
      return core.binaryExp(x, op.sourceString, y, "number")
    },

    Factor_exponentiation(base, _starStar, exponent) {
      const x = base.translate()
      const y = exponent.translate()
      validateNumber(x, base.source)
      validateNumber(y, exponent.source)
      return core.binaryExp(x, "**", y, "number")
    },

    Factor_negation(_minus, factor) {
      const x = factor.translate()
      validateNumber(x, factor.source)
      return core.unaryExp("-", x, "number")
    },

    Primary_parens(_open, expression, _close) {
      return expression.translate()
    },

    Primary_id(id) {
      const name = id.sourceString
      return context.get(name, id.source)
    },

    FunCall(id, _open, args, _close) {
      const func = context.get(id.sourceString, id.source)
      validateFunction(func, id.source)
      const argValues = args.asIteration().children.map((arg) => arg.translate())
      if (argValues.length !== func.params.length) {
        error(`Expected ${func.params.length} arguments, but got ${argValues.length}`, id.source)
      }
      for (let i = 0; i < argValues.length; i++) {
        const expectedType = func.params[i].type
        const actualType = typeOf(argValues[i])
        validate(
          expectedType === actualType,
          `Type mismatch in argument ${i + 1}: expected ${expectedType}, but got ${actualType}`,
          id.source,
        )
      }
      return core.functionCall(func, argValues, "number")
    },

    str(_left, _chars, _right) {
      return String(_chars.sourceString)
    },

    num(_digits, _dot, _fraction) {
      return Number(this.sourceString)
    },

    true(_) {
      return true
    },

    false(_) {
      return false
    },

    // This won't be emitted in output but can still be represented for testing purposes
    Comment(_open, content, _close) {
      return core.comment(content.sourceString)
    },
  }
  const semantics = grammar.createSemantics().addOperation("translate", actions)
  return semantics(match).translate()
}
