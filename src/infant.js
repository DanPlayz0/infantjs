#! /usr/bin/env node

import { parseArgs } from "node:util";
import * as fs from "node:fs/promises"
import { glob } from "glob";
import stringify from "graph-stringify"
import compile from "./compiler.js"
import startRepl from "./repl.js"

const help = `InfantJS compiler

Syntax: infant <filename> <outputType> [options]

<filename> is either a path to an InfantJS source file or "repl" to start a REPL session.

Prints to stdout according to <outputType>, which must be one of:

  parsed     a message that the program was matched ok by the grammar
  analyzed   the statically analyzed representation
  optimized  the optimized semantically analyzed representation
  js         the translation to JavaScript
  py         the translation to Python

Options (Filesystem operations are only supported when a filename is provided, not in REPL mode):
  --help               print this message
  --write              write the output to a file instead of stdout (filename is <filename> with the extension replaced by .js or .py)
  --verbose            print stack traces for errors
  --include <filename> compile additional files (can be used multiple times)
`

async function compileFromFile(filename, outputType, writeFlag) {
  try {
    const buffer = await fs.readFile(filename)
    const compiled = compile(buffer.toString(), outputType, filename)
    if (writeFlag && ["js", "py"].includes(outputType)) {
      const outputFilename = filename.replace(/\.\w+$/, outputType === "py" ? ".py" : ".js")
      await fs.writeFile(outputFilename, compiled)
      console.log(`Output written to ${outputFilename}`)
      return
    }
    console.log(stringify(compiled, "kind") || compiled)
  } catch (e) {
    console.error(`\u001b[31m${e}\u001b[39m`)
    if (process.argv.includes("--verbose")) console.error(e.stack);
    process.exitCode = 1
  }
}

const cliOptions = {
  verbose: { type: "boolean", default: false },
  write: { type: "boolean", default: false },
  include: { type: "string", default: [], multiple: true, short: "i" },
  help: { type: "boolean", default: false },
  outputType: { type: "string", default: "js", short: "o" },
  outputFile: { type: "string", default: "", short: "f" },
};
const parsedArgs = parseArgs({ args: process.argv.slice(2), options: cliOptions, allowPositionals: true });
const { values, positionals } = parsedArgs;
if (values.help || positionals.length < 2) {
  console.log(help)
  process.exitCode = 2
} else {
  const [filePattern, outputType] = positionals;
  const includes = Array.isArray(values.include) ? values.include : (values.include ? [values.include] : []);
  
  if (filePattern === "repl") {
    await startRepl(outputType)
  } else {
    // Check if filePattern contains glob characters
    const hasGlobChars = /[*?[\]]/.test(filePattern);
    let filesToCompile = [];
    
    if (hasGlobChars) {
      // Expand glob pattern
      filesToCompile = await glob(filePattern);
    } else {
      // Single file
      filesToCompile = [filePattern];
    }
    
    // Compile include files first
    for (const inc of includes) {
      await compileFromFile(inc, outputType, values.write);
    }
    
    // Then compile main file(s)
    for (const file of filesToCompile) {
      await compileFromFile(file, outputType, values.write);
    }
  }
}