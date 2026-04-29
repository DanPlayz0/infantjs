![Logo](./docs/logo.png)

# InfantJS

A programming language for *literal* babies

[🌐 Companion Website](https://infantjs.compiles.me) &nbsp;|&nbsp; [📁 GitHub Repo](https://github.com/DanPlayz0/infantjs)  &nbsp;|&nbsp; [📊 Powerpoint](https://docs.google.com/presentation/d/1nQSZ4yLsXFqFITq5mR-FpJmPMlYlsSw1E7gDLeQ_zuU/edit?usp=sharing)

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

<h2>Static Checks Performed by the Compiler</h2>
__The analyzer enforces the following constraints at compile time, before any code runs:__

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



<h2>Keyword Reference </h2>

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


<h2> Example Programs </h2>

<h4> Hello World </h4>

__InfantJS__
```js
gibberish("Hello World")
```

__JavaScript__
```javascript
console.log("Hello World");
```

----------------------------------------------------------------------------------------------------------------


<h4> Variables and Arithmetic </h4>

__InfantJS__
```js
mine x = 100 + 100
gibberish(x / 2)
x = x - 50
gibberish(x)
peekaboo x > 100 {
  gibberish(x ** 3)
}
```

__JavaScript__
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

<h4> Functions <h4>

__InfantJS__
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

__JavaScript__
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

<h4> Number Guessing Game </h4>

__InfantJS__
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

__JavaScript__
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

<h4> While Loop with Variable </h4>

__InfantJS__
```
wawawa googoo {
  gibberish(gaagaa)
}
```

__JavaScript__
```javascript
while (false) {
  console.log(true);
}
```
 
----------------------------------------------------------------------------------------------------------------

<h4> Math Builtins and Casting </h4>

__InfantJS__
```
mine pi = 3.14159
gibberish(crawl(pi))
gibberish(climb(pi))
gibberish(roll(pi))

mine asText = babble(pi)
gibberish("Pi is: " + asText)
```

__JavaScript__
```JavaScript
let pi = 3.14159;
console.log(Math.floor(pi));
console.log(Math.ceil(pi));
console.log(Math.round(pi));

let asText = String(pi);
console.log("Pi is: " + asText);
```


----------------------------------------------------------------------------------------------------------------

<h2>How to Run</h2>

__Install dependencies__

```ruby
npm install
```
__Compile and run a `.infant` file (translates to JS and executes):__

```bash
node src/infant.js examples/guess-number-game.infant js
```

__Use the compiler directly:__
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

__Run the tests with coverage:__
```bash
npm test
```

----------------------------------------------------------------------------------------------------------------

<h2> Repository Structure <h2>

```
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

<h2> Grammer (abbreviated) </h2>

__The full grammar lives in `src/infantjs.ohm.` Key rules:__
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

<h2> Companion Website </h2>

Visit <u>infantjs.compiles.me</u> for the full language story, live examples, and developer bios

----------------------------------------------------------------------------------------------------------------
