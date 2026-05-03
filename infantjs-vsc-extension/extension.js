const vscode = require("vscode");

function activate(context) {
  const completions = [
    ["mine", "let declaration", "mine ${1:name} = ${2:value}"],
    ["gibberish", "print statement", "gibberish(${1:value})"],
    ["peekaboo", "if statement", "peekaboo ${1:condition} {\n\t$2\n}"],
    ["nuhuh", "else block", "nuhuh {\n\t$1\n}"],
    ["wawawa", "while loop", "wawawa ${1:condition} {\n\t$2\n}"],
    ["playtime", "function declaration", "playtime ${1:name}(${2:param}: ${3:numba}) {\n\t$4\n}"],
    ["bedtime", "return statement", "bedtime ${1:value}"],
    ["nomnom", "input", "nomnom(${1:prompt})"],
    ["flippy", "random", "flippy(${1:min}, ${2:max})"],
    ["nap", "sleep", "nap(${1:milliseconds})"],
    ["crawl", "floor", "crawl(${1:value})"],
    ["climb", "ceil", "climb(${1:value})"],
    ["roll", "round", "roll(${1:value})"],
    ["gaagaa", "true", "gaagaa"],
    ["googoo", "false", "googoo"],
    ["numba", "number type", "numba"],
    ["squarehole", "boolean type", "squarehole"],
    ["babble", "string type", "babble"]
  ];

  const provider = vscode.languages.registerCompletionItemProvider(
    "infantjs",
    {
      provideCompletionItems() {
        return completions.map(([label, detail, snippet]) => {
          const item = new vscode.CompletionItem(
            label,
            vscode.CompletionItemKind.Keyword
          );

          item.detail = detail;
          item.documentation = detail;
          item.insertText = new vscode.SnippetString(snippet);

          return item;
        });
      }
    }
  );

  context.subscriptions.push(provider);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};