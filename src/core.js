export function program(body) {
  return { kind: "Program", body }
}

export function printStmt(argument) {
  return { kind: "PrintStatement", arguments: [argument] }
}

export function variable(name, type) {
  return { kind: "Variable", name, type }
}

export function functionDecl(fun, body) {
  return { kind: "FunctionDeclaration", function: fun, body, exported: false }
}

export function functionObject(name, params, returnType = "void") {
  return { kind: "FunctionObject", name, params, returnType }
}

export function functionCall(callee, args, type) {
  return { kind: "FunctionCall", callee, arguments: args, type }
}

export function letStmt(variable, initializer) {
  return { kind: "LetStatement", variable, initializer }
}

export function assignStmt(target, source) {
  return { kind: "AssignStatement", target, source }
}

export function ifStmt(test, consequent, alternate) {
  return { kind: "IfStatement", test, consequent, alternate }
}

export function whileStmt(test, body) {
  return { kind: "WhileStatement", test, body }
}

export function binaryExp(left, operator, right, type) {
  return { kind: "BinaryExpression", operator, left, right, type }
}

export function unaryExp(operator, argument, type) {
  return { kind: "UnaryExpression", operator, argument, type }
}

export function randomStmt(minimum, maximum) {
  return { kind: "RandomStatement", type: "number", minimum, maximum }
}

export function returnStmt(value = undefined) {
  return { kind: "ReturnStatement", value }
}

export function inputStmt(prompt = undefined) {
  return { kind: "InputStatement", prompt, type: "string" }
}

export function sleepStmt(duration) {
  return { kind: "SleepStatement", duration }
}

export function castStmt(value, targetType) {
  return { kind: "CastStatement", value, type: targetType }
}

export function floorStmt(value) {
  return { kind: "FloorStatement", value, type: "number" }
}

export function ceilStmt(value) {
  return { kind: "CeilStatement", value, type: "number" }
}

export function roundStmt(value) {
  return { kind: "RoundStatement", value, type: "number" }
}

export function comment(content) {
  return { kind: "Comment", content, type: "string" }
}

export function exportStmt(content) {
  return { kind: "ExportStatement", content }
}

export function importStmt(identifier, source) {
  return { kind: "ImportStatement", identifier, source }
}
