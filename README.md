![Logo](./docs/logo.png)

# InfantJS

A programming language for *literal* babies

[🌐 Companion Website](https://infantjs.compiles.me) &nbsp;|&nbsp; [📁 GitHub Repo](https://github.com/DanPlayz0/infantjs)  &nbsp;|&nbsp; [📊 Powerpoint](https://docs.google.com/presentation/d/1nQSZ4yLsXFqFITq5mR-FpJmPMlYlsSw1E7gDLeQ_zuU/edit?usp=sharing) &nbsp;|&nbsp; [📃 Assignment Instructions](https://cs.lmu.edu/~ray/classes/cc/assignment/1/)

----------------------------------------------------------------------------------------------------------------

## Story

We were inspired by our professor when he decided to make a programming language called "Baby.js" in our compilers class, we looked at each other and decided why stop with just babies, infants need to program too. That was were InfantJS was born. 
So we built InfantJS a dynamically-flavored language with keywords that only an infant could truly understand, a JavaScript-style structure, and a compiler that translates your babytalk into real runnable JavaScript (and Python) Programs. Our vast team of researchers have poured thousands of hours and millions of university grant money into creating a sacred vocabulary of infants: gibberish to print, mine to declare, peekaboo for conditionals, wawawa for loops, and googoo/gaagaa for your booleans.

It's a completely 100% serious fully functional compiled language, with a real static analyzer, optimizer, and code generator.

Team: Danny Divinsky, Samuel Rambo, Gabriel Garcia, Parker Jazayeri

----------------------------------------------------------------------------------------------------------------

Language Features

* __Baby-friendly keywords__ — every reserved word is drawn from infant vocabulary
* __Dynamic typing with static checks__ — variables are dynamically typed at declaration but the analyzer enforces consistent usage
* __Type inference__ — the analyzer infers the type of every expression and variable at compile time
* __Type checking__ — type mismatches (e.g. assigning a boolean to a number variable) are caught before runtime
* __Static scope resolution__ — variables are resolved at compile time with nested lexical scoping
* __Functions with typed parameters__ — parameters are annotated with types (`numba`, `squarehole`, `babble`) and checked at call sites
* __Arity checking__ — calling a function with the wrong number of arguments is a compile-time error
* __Type-safe arithmetic__ — booleans cannot appear in numeric expressions; strings cannot be multiplied or divided
* __String concatenation__ — `+` is overloaded for strings, but only when both operands are strings
* __Conditionals__ — `peekaboo` / `nuhuh` (if / else)
* __Loops__ — `wawawa` (while)
* __Random number generation__ — `flippy(min, max)`
* __User input__ — `nomnom("prompt")`
* __Type casting__ — `numba()`, `babble()`, `squarehole()`with validated cast paths
* __Math builtins__ —  `crawl()` (floor), `climb()` (ceil), `roll()` (round)
* __Sleep / delay__ — `nap(ms)`— validated to be a positive number in milliseconds
* __Return statements__ — `bedtime` (with value or void)
* __Dual code generation__ — compiles to both JavaScript and Python

----------------------------------------------------------------------------------------------------------------

## Optional Syntax Highlighting

Install the InfantJS VS Code extension for `.infant` file highlighting.
Download [`infantjs-vsc-extension/infantjs-0.0.1.vsix`](./infantjs-vsc-extension/infantjs-0.0.1.vsix) from the repo, then in VS Code

* Via the extensions tab (`Ctrl+Shift+X`) → Click the three dots (`...`) at the top → Select `Install from VSIX` from the dropdown
* Via Command Pallet (`Ctrl+Shift+P`) → `>Extensions: Install from VSIX`

Once you have the finder/file explorer open, you need to find and select that VSIX extension file

----------------------------------------------------------------------------------------------------------------

## Static Checks Performed by the Compiler

The analyzer enforces the following constraints at compile time, before any code runs:

| __Check__    | __Example Error Caught__ |
| -------- | ------- |
|  Undefined variable reference | `gibberish(x)` before `mine x = ...`    |
| Variable redeclaration in same scope |  `mine x = 1` then `mine x = 2` |
| Assignment to undeclared variable    | `x = 5` without prior `mine x = ...`   |
|   Type mismatch on assignment  |   `mine x = 1` then `x = gaagaa`  |
|   Non-boolean in `peekaboo` /  `wawawa ` condition   |  ` peekaboo 1 { ... }` |
|  Non-number in arithmetic expression   | `gibberish(gaagaa * 2)`   |
|  Non-number in `flippy` bounds   |  `flippy(gaagaa, 10)`  |
|  Non-number in math builtins   |  `crawl(gaagaa)` |
|  Non-positive number in `nap`   |   `nap(0)`, `nap(-100)`  |
|  Non-string prompt in `nomnom`   |  `nomnom(42)`  |
|   Wrong argument count at call site  |   `playtime f() { ... }` called as `f(1)` |
|   Type mismatch in function arguments  |  `f(x: numba)` called with a boolean   |
|   Invalid type cast  |  `numba(gaagaa)` <em> (boolean → number is disallowed)  </em> |
|   String used with non-`+`operator  |  `"hello" * 3`  |
|  Mixed-type string concatenation   |  `"hello" + 1` |
|   Unknown type annotation  |  `playtime f(x: unknown)` |
|   Undefined function call  |  `foo()` without prior `playtime foo()`  |



## Keyword Reference

|   __InfantJS__  |   __Meaning__    |     __JavaScript Equivalent__ |
| :---------------- | :------: | ----: |
|  `mine`   |    declare variable   |   `let`  |
|   `gibberish`  |   print to console    |   `console.log`  |
|   `peekaboo`  |   if    |   `if`  |
|   `nuhuh`  |    else   |   `else`  |
|   `wawawa`  |   while    |   `while`  |
|  `playtime`   |    function declaration   |   `function`  |
|   `bedtime`  |   return    |  `return`   |
|   `gaagaa`  |   true    |  `true`   |
|   `googoo`  |   false    |  `false`   |
|   `flippy`  |   random int in range    |  `Math.floor(Math.random() *...)`   |
|   `nomnom`  |   read user input    |  `readline`   |
|   `nap`  |   sleep / delay / (ms)    |  `setTimeout`   |
|   `crawl`  |   floor    |  `Math.floor`   |
|   `climb`  |   ceil    |  `Math.ceil`   |
|   `roll`  |   round    |  `Math.round`   |
|   `numba`  |   number type / cast    |  `Number()`   |
|   `babble`  |   string type / cast    |  `String()`   |
|   `squarehole`  |   boolean type / cast    |  `Boolean()`   |

## Example Programs

### Hello World

InfantJS:

```js
gibberish("Hello World")
```

JavaScript:

```javascript
console.log("Hello World");
```

----------------------------------------------------------------------------------------------------------------

### Variables and Arithmetic

InfantJS:

```js
mine x = 100 + 100
gibberish(x / 2)
x = x - 50
gibberish(x)
peekaboo x > 100 {
  gibberish(x ** 3)
}
```

JavaScript:

```javascript
let x = 100 + 100;
console.log(x / 2);
x = x - 50;
console.log(x);
if (x > 100) {
  console.log(x ** 3);
}
```

----------------------------------------------------------------------------------------------------------------

### Functions

InfantJS:

```js
playtime example(x: numba, y: squarehole) {
  peekaboo y {
    gibberish(x ** 3)
  } nuhuh {
    gibberish(x ** 2)
  }
}

example(3, googoo)
```

JavaScript:

```javascript
function example(x, y) {
  if (y) {
    console.log(x ** 3);
  } else {
    console.log(x ** 2);
  }
}

example(3, false);
```

----------------------------------------------------------------------------------------------------------------

### Number Guessing Game

InfantJS:

```js
mine num = flippy(1, 100)
mine guess = 0

gibberish("What number am I thinking of?\n")

wawawa num != guess {
  guess = numba(nomnom("Your guess: \n"))

  peekaboo guess > num {
    gibberish("Too high! Try again!\n")
  } nuhuh {
    gibberish("Too low! Try again!\n")
  }
}

gibberish("You got it! It was " + babble(num) + "!")
```

JavaScript:

```javascript
let num = Math.floor(Math.random() * 100) + 1;
let guess = 0;

console.log("What number am I thinking of?\n");

while (num !== guess) {
  guess = Number(await readline("Your guess: \n"));

  if (guess > num) {
    console.log("Too high! Try again!\n");
  } else {
    console.log("Too low! Try again!\n");
  }
}

console.log("You got it! It was " + String(num) + "!");
```

----------------------------------------------------------------------------------------------------------------

### While Loop with Variable

InfantJS:

```js
wawawa googoo {
  gibberish(gaagaa)
}
```

JavaScript:

```javascript
while (false) {
  console.log(true);
}
```

### Math Builtins and Casting

InfantJS:

```js
mine pi = 3.14159
gibberish(crawl(pi))
gibberish(climb(pi))
gibberish(roll(pi))

mine asText = babble(pi)
gibberish("Pi is: " + asText)
```

JavaScript

```javascript
let pi = 3.14159;
console.log(Math.floor(pi));
console.log(Math.ceil(pi));
console.log(Math.round(pi));

let asText = String(pi);
console.log("Pi is: " + asText);
```

## Generated Output

The compiler produces clean, readable JavaScript. Here is what the compiler actually outputs:

InfantJS input:

```js
mine x = 100 + 100
gibberish(x / 2)
```

Compiled JavaScript output:

```javascript
async function __main() {
  let x_1 = 200;
  console.log((x_1 / 2));
}
__main();
```

Note that `100 + 100` is folded to `200` at compile time by the optimizer, and variables get unique numeric suffixes (e.g. `x_1`) to avoid collisions with JavaScript reserved words.

----------------------------------------------------------------------------------------------------------------

InfantJS input:

```js
playtime square(n: numba) {
  bedtime n * n
}
gibberish(square(5))
```

Compiled JavaScript output:

```javascript
function square_1(n_2) {
  return (n_2 * n_2);
}
async function __main() {
  console.log(square_1(5));
}
__main();
```

----------------------------------------------------------------------------------------------------------------

InfantJS input:
```js
mine num = flippy(1, 10)
mine guess = numba(nomnom("Guess: "))
peekaboo guess == num {
  gibberish("Correct!")
}
```

**Compiled JavaScript output:**
```javascript
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

async function __promptInput(prompt) {
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(prompt);
  rl.close();
  return answer;
}

async function __main() {
  let num_1 = Math.floor(Math.random() * (Math.floor(10) - Math.ceil(1) + 1) + Math.ceil(1));
  let guess_2 = Number(await __promptInput("Guess: "));
  if ((guess_2 === num_1)) {
    console.log("Correct!");
  }
}
__main();
```

----------------------------------------------------------------------------------------------------------------

## How to Run

Install dependencies

```bash
npm install
```

Compile and run a `.infant` file (translates to JS and executes):

```bash
node src/infant.js examples/guess-number-game.infant js
```

Use the compiler directly:

```bash
# Check syntax only
node src/infant.js examples/hello.infant parsed

# Run semantic analysis
node src/infant.js examples/hello.infant analyzed

# Run optimizer
node src/infant.js examples/hello.infant optimized

# Generate JavaScript
node src/infant.js examples/hello.infant js

# Generate Python
node src/infant.js examples/hello.infant py

# Write output to javascript file
node src/infant.js examples/hello.infant js --write

# Write output to python file
node src/infant.js examples/hello.infant py --write
```

Run the tests with coverage:

```bash
npm test
```

----------------------------------------------------------------------------------------------------------------

## Repository Structure

```bash
.
├── README.md
├── LICENSE
├── package.json
├── .gitignore
├── docs/                        ← companion website (GitHub Pages)
│   ├── index.html
│   ├── index.css
│   ├── logo.png
│   ├── about/
│   ├── examples/
│   ├── github/
│   ├── story/
│   └── theme/
├── examples/                    ← example .infant programs
│   ├── hello.infant
│   ├── math.infant
│   ├── example.infant
│   ├── guess-number-game.infant
│   ├── class-export.infant
│   └── class-import.infant
├── src/
│   ├── infant.js                ← CLI entrypoint
│   ├── infantjs.ohm             ← Ohm grammar
│   ├── compiler.js              ← pipeline orchestrator
│   ├── parser.js                ← parser (wraps Ohm)
│   ├── core.js                  ← AST node constructors
│   ├── analyzer.js              ← semantic analyzer
│   ├── optimizer.js             ← AST optimizer
│   ├── generator.js             ← JavaScript code generator
│   └── generator-python.js      ← Python code generator
└── test/
    ├── compiler.test.js
    ├── parser.test.js
    ├── analyzer.test.js
    ├── optimizer.test.js
    └── generator.test.js
```

----------------------------------------------------------------------------------------------------------------

## Grammer (abbreviated)

The full grammar lives in [`src/infantjs.ohm.`](./src/infantjs.ohm) 

### Key rules:

```ohm
Statement = PrintStmt | LetStmt | AssignStmt | IfStmt | WhileStmt
          | FunDecl | FunCall | RandomStmt | InputStmt | ReturnStmt
          | SleepStmt | CastStmt

LetStmt    = "mine" id "=" Exp
PrintStmt  = "gibberish" "(" Exp ")"
IfStmt     = "peekaboo" Exp Block ("nuhuh" Block)?
WhileStmt  = "wawawa" Exp Block
FunDecl    = "playtime" id "(" Params ")" Block
ReturnStmt = "bedtime" Exp?
```

----------------------------------------------------------------------------------------------------------------

## Companion Website

Visit [infantjs.compiles.me](https://infantjs.compiles.me) for the full language story, live examples, and developer bios
