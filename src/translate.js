// import interpret from "./interpreter.js";
import parse from "./parser.js";
import translate from "./analyzer.js";
import * as fs from "node:fs";
import { spawn } from "node:child_process";

if (process.argv.length < 3) {
  console.log(`Usage: ${process.argv[0]} ${process.argv[1]} <name>`);
  process.exit(1);
}

function translateStatement(statement) {
  if (typeof statement === "string") return "\"" + statement + "\"";
  if (typeof statement === "number" || typeof statement === "boolean") return statement;
  if (!statement) {
    console.log(statement);
    // throw new Error(`Unknown statement: ${statement}`);
    return;
  }
  const kind = statement.kind;
  if (kind === "LetStatement") {
    // console.log(statement);
    return `let ${translateStatement(statement.variable)} = ${translateStatement(statement.initializer)}`;
  }
  if (kind === "PrintStatement") {
    return `console.log(${statement.arguments.map(translateStatement).join(", ")})`;
  }
  if (kind === "Variable") {
    return statement.name;
  }
  if (kind === "RandomStatement") {
    return `Math.floor(Math.random() * (Math.floor(${statement.maximum}) - Math.ceil(${statement.minimum}) + 1) + Math.ceil(${statement.minimum}));`
  }
  if (kind === "WhileStatement") {
    // console.log(statement);
    return [
      `while (${translateStatement(statement.test)}) {`,
      ...statement.body.map(translateStatement),
      `}`
    ].join("\n");
  }
  if (kind === "AssignStatement") {
    return `${translateStatement(statement.target)} = ${translateStatement(statement.source)}`;
  }
  if (kind === "CastStatement") {
    if (statement.type === typeof statement.value) {
      return translateStatement(statement.value); // Optimize away unnecessary casts
    }
    // console.log(statement);
    if (statement.type === "number") {
      return `Number(${translateStatement(statement.value)})`;
    } else if (statement.type === "boolean") {
      return `Boolean(${translateStatement(statement.value)})`;
    } else if (statement.type === "string") {
      return `String(${translateStatement(statement.value)})`;
    } else {
      throw new Error(`Unknown type: ${statement.type}`);
    }
  }
  if (kind === "BinaryExpression") {
    return `${translateStatement(statement.left)} ${statement.operator} ${translateStatement(statement.right)}`;
  }
  if (kind === "IfStatement") {
    const translated = [
      `if (${translateStatement(statement.test)}) {`,
      ...statement.consequent.map(translateStatement),
      `}`
    ]

    if (statement.alternate) translated.push(...[
        `else {`,
        ...statement.alternate.map(translateStatement),
        `}`
      ]);

    return translated.join("\n");
  }
  if (kind === "InputStatement") {
    return `await promptInput(${translateStatement(statement.prompt)})`;
  }
  if (kind === "FloorStatement") {
    return `Math.floor(${translateStatement(statement.value)})`;
  }
  if (kind === "CeilStatement") {
    return `Math.ceil(${translateStatement(statement.value)})`;
  }
  if (kind === "RoundStatement") {
    return `Math.round(${translateStatement(statement.value)})`;
  }
  if (kind === "FunctionDeclaration") {
    return [
      `function ${statement.function.name}(${statement.function.params.map((x) => x.name).join(", ")}) {`,
      ...statement.body.map(translateStatement),
      `}`
    ].join("\n");
  }
  if (kind === "FunctionCall") {
    return `${statement.callee.name}(${statement.arguments.join(", ")})`;
  }
  console.log("Missing", statement);
  // throw new Error(`Unknown statement kind: ${kind}`);
}

try {
  const name = process.argv[2];
  const sourceCode = fs.readFileSync(name, "utf-8");
  const match = parse(sourceCode); // if it failed, it would have thrown
  const translated = translate(match);
  let program = [`import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

function promptInput(prompt) {
  return new Promise(async (res) => {
    const rl = readline.createInterface({ input, output });
    const answer = await rl.question(prompt);
    res(answer);
    rl.close();
  });
}`];
  if (translated.kind === "Program") {
    translated.body.forEach(element => {
      program.push(translateStatement(element));
    });
  }
  // console.log('--- Translated Program ---');
  // console.log(program.join('\n'));
  fs.writeFileSync(name.replace(/\.infant$/, ".js"), program.join("\n"));
  spawn("node", [name.replace(/\.infant$/, ".js")], { stdio: "inherit" });
} catch (e) {
  console.error(e.message);
  console.debug(e.stack);
  process.exit(1);
}