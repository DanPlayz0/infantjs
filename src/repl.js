function supportsColor() {
  if (process.env.NO_COLOR) return false
  if (process.env.FORCE_COLOR) return true
  return process.stdout.isTTY
}

const colorEnabled = supportsColor()

const colors = {
  red: (s) => (colorEnabled ? `\x1b[31m${s}\x1b[0m` : s),
  green: (s) => (colorEnabled ? `\x1b[32m${s}\x1b[0m` : s),
  cyan: (s) => (colorEnabled ? `\x1b[36m${s}\x1b[0m` : s),
  gray: (s) => (colorEnabled ? `\x1b[90m${s}\x1b[0m` : s),
  bold: (s) => (colorEnabled ? `\x1b[1m${s}\x1b[0m` : s),
}

export default async function startRepl(outputType) {
  console.log(colors.bold(colors.cyan("InfantJS REPL")) + colors.gray(" (type .exit to quit)"))

  const readline = await import("node:readline/promises")
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: colors.green("> "),
  })

  rl.prompt()

  const exitPhrases = [".exit", ".quit", ":q", ".q", ".e"]

  for await (const line of rl) {
    if (exitPhrases.some((phrase) => phrase === line.trim())) {
      rl.close()
      break
    }

    try {
      const compiled = compile(line, outputType)
      const out = stringify(compiled, "kind") || compiled
      console.log(colors.cyan(out))
    } catch (e) {
      console.error(colors.red(String(e)))
      if (process.argv.includes("--verbose") && e?.stack) {
        console.error(colors.gray(e.stack))
      }
    }

    rl.prompt()
  }
}
