#! /usr/bin/env node

import * as fs from "node:fs/promises"
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
  --help      print this message
  --write     write the output to a file instead of stdout (filename is <filename> with the extension replaced by .js or .py)
  --verbose   print stack traces for errors
`

async function compileFromFile(filename, outputType) {
  try {
    const buffer = await fs.readFile(filename)
    const writeFlag = process.argv.includes("--write")
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

if (process.argv.length >= 4 && !process.argv.includes("--help")) {
  if (process.argv[2] === "repl") {
    await startRepl(process.argv[3])
  } else {
    await compileFromFile(process.argv[2], process.argv[3])
  }
} else {
  console.log(help)
  process.exitCode = 2
}