![Logo](./docs/logo.png)

# InfantJS

A programming language for *literal* babies

[🌐 Companion Website](https://infantjs.compiles.me) &nbsp;|&nbsp; [📁 GitHub Repo](https://github.com/DanPlayz0/infantjs)

----------------------------------------------------------------------------------------------------------------


## Story

We were inspired by our professor when he decided to make a programming language called "Baby.js" in our compilers class, we looked at each other and decided why stop with just babies, infants need to program too. That was were InfantJS was born. 
So we built InfantJS a dynamically-flavored language with keywords that only an infant could truly understand, a JavaScript-style structure, and a compiler that translates your babytalk into real runnable JavaScript (and Python) Programs. Our vast team of researchers have poured thousands of hours and millions of university grant money into creating a sacred vocabulary of infants: gibberish to print, mine to declare, peekaboo for conditionals, wawawa for loops, and googoo/gaagaa for your booleans.

It's a completely 100% serious fully functional compiled language, with a real static analyzer, optimizer, and code generator.

Team: Danny Divinsky, Samuel Rambo, Gabriel Garcia

----------------------------------------------------------------------------------------------------------------

Language Features

* Baby-friendly keywords — every reserved word is drawn from infant vocabulary
* Dynamic typing with static checks — variables are dynamically typed at declaration but the analyzer enforces consistent usage
* Type inference — the analyzer infers the type of every expression and variable at compile time
* Type checking — type mismatches (e.g. assigning a boolean to a number variable) are caught before runtime
* Static scope resolution — variables are resolved at compile time with nested lexical scoping
* Functions with typed parameters — parameters are annotated with types (numba, squarehole, babble) and checked at call sites
* Arity checking — calling a function with the wrong number of arguments is a compile-time error
* Type-safe arithmetic — booleans cannot appear in numeric expressions; strings cannot be multiplied or divided
* String concatenation — + is overloaded for strings, but only when both operands are strings
* Conditionals — peekaboo / nuhuh (if / else)
* Loops — wawawa (while)
* Random number generation — flippy(min, max)
* User input — nomnom("prompt")
* Type casting — numba(), babble(), squarehole() with validated cast paths
* Math builtins — crawl() (floor), climb() (ceil), roll() (round)
* Sleep / delay — nap(ms) — validated to be a positive number
* Return statements — bedtime (value or void)
* Dual code generation — compiles to both JavaScript and Python


----------------------------------------------------------------------------------------------------------------

| Check    | Example Error Caught |
| -------- | ------- |
|  Undefined variable reference | <code>gibberish(x)</code> before <code> mine x = ...</code>    |
| Variable redeclaration in same scope |  <code>mine x = 1</code> then <code>mine x = 2 </code> |
| Assignment to undeclared variable    | <code>x = 5 </code> without prior <code> mine x = ... </code>   |




## How do I run this language?

You must run the translator which will automatically translate to javascript and run it.

An example of how to run/use the translator: `npm run translate examples/guess-number-game.infant`

<!-- 
To run an example (e.g `math.infant`): `npm run baby examples/math.infant`
To run tests: `npm test` -->

## This language features:
  - A baby-friendly syntax
  - Javascript style structure
  - Dynamic typing

## Link to Companion Website
 [Link Text](https://infantjs.compiles.me)
