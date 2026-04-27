import parse from "./parser.js"
import analyze from "./analyzer.js"
import optimize from "./optimizer.js"
import generate from "./generator.js"
import generatePython from "./generator-python.js"

export default function compile(source, outputType) {
  if (!["parsed", "analyzed", "optimized", "js", "py"].includes(outputType)) {
    throw new Error("Unknown output type")
  }
  const match = parse(source)
  if (outputType === "parsed") return "Syntax is ok"
  const analyzed = analyze(match)
  if (outputType === "analyzed") return analyzed
  const optimized = optimize(analyzed)
  if (outputType === "optimized") return optimized
  if (outputType === "py") return generatePython(optimized)
  return generate(optimized)
}