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

* __Baby-friendly keywords__ — every reserved word is drawn from infant vocabulary
* __Dynamic typing with static checks__ — variables are dynamically typed at declaration but the analyzer enforces consistent usage
* __Type inference__ — the analyzer infers the type of every expression and variable at compile time
* __Type checking__ — type mismatches (e.g. assigning a boolean to a number variable) are caught before runtime
* __Static scope resolution__ — variables are resolved at compile time with nested lexical scoping
* __Functions with typed parameters__ — parameters are annotated with types (<code> numba </code>, <code> squarehole </code>, <code> babble </code>) and checked at call sites
* __Arity checking__ — calling a function with the wrong number of arguments is a compile-time error
* __Type-safe arithmetic__ — booleans cannot appear in numeric expressions; strings cannot be multiplied or divided
* __String concatenation__ — <code> + </code> is overloaded for strings, but only when both operands are strings
* __Conditionals__ — <code> peekaboo </code> / <code> nuhuh </code> (if / else)
* __Loops__ — <code>wawawa</code> (while)
* __Random number generation__ — <code>flippy(min, max) </code>
* __User input__ — <code> nomnom("prompt") </code>
* __Type casting__ — <code> numba() </code>, <code> babble() </code>, <code> squarehole() </code>with validated cast paths
* __Math builtins__ —  <code> crawl() </code> (floor), <code> climb() </ code>(ceil), <code> roll()</code> (round)
* __Sleep / delay__ — <code> nap(ms) </code>— validated to be a positive number
* __Return statements__ — <code> bedtime </code>(value or void)
* __Dual code generation__ — compiles to both JavaScript and Python


----------------------------------------------------------------------------------------------------------------

<h2>Static Checks Performed by the Compiler</h2>
__The analyzer enforces the following constraints at compile time, before any code runs:__

| __Check__    | __Example Error Caught__ |
| -------- | ------- |
|  Undefined variable reference | <code>gibberish(x)</code> before <code> mine x = ...</code>    |
| Variable redeclaration in same scope |  <code>mine x = 1</code> then <code>mine x = 2 </code> |
| Assignment to undeclared variable    | <code>x = 5 </code> without prior <code> mine x = ... </code>   |
|   Type mismatch on assignment  |   <code> mine x = 1 </<code> then <code> x = gaagaa </code>  |
|   Non-boolean in <code>peekaboo </code> /  <code> wawawa  </code> condition   |  <code>  peekaboo 1 { ... } </code> |
|  Non-number in arithmetic expression   | <code> gibberish(gaagaa * 2) </code>   |
|  Non-number in <code> flippy </code> bounds   |  <code> flippy(gaagaa, 10) </code>  |
|  Non-number in math builtins   |  <code> crawl(gaagaa)  </code> |
|  Non-positive number in <code>nap </code>   |   <code nap(0) </code>, <code nap(-100) </code>  |
|  Non-string prompt in <code> nomnom</code>   |  <code> nomnom(42) </code>  |
|   Wrong argument count at call site  |   <code> playtime f() { ... } </code> called as <code> f(1)  </code> |
|   Type mismatch in function arguments  |  <code> f(x: numba) </code> called with a boolean   |
|   Invalid type cast  |  <code> numba(gaagaa) </code> <em> (boolean → number is disallowed)  </em> |
|   String used with non-<code>+ </code>operator  |  <code> "hello" * 3  </code>  |
|  Mixed-type string concatenation   |  <code> "hello" + 1  </code> |
|   Unknown type annotation  |  <code> playtime f(x: unknown)  </code> |
|   Undefined function call  |  <code> foo() </code> without prior <code> playtime foo()  </code>  |



<h2>Keyword Reference </h2>

|   __InfantJS__  |   __Meaning__    |     __JavaScript Equivalent__ |
|  <code> mine </code>   |    declare variable   |   <code> let </code>  |
|   <code> gibberish </code>  |   print to console    |   <code> console.log </code>  |
|   <code> peekaboo </code>  |   if    |   <code> if </code>  |
|   <code> nuhuh </code>  |    else   |   <code> else </code>  |
|   <code> wawawa </code>  |   while    |   <code> while </code>  |
|  <code> playtime </code>   |    functuin declaration   |   <code> function </code>  |
|   <code> bedtime </code>  |   return    |  <code> return </code>   |
|   <code> gaagaa </code>  |   true    |  <code> true </code>   |
|   <code> googoo </code>  |   false    |  <code> false </code>   |
|   <code> flippy </code>  |   random int in range    |  <code> Math.floor(Math.random() *...) </code>   |
|   <code> nomnom </code>  |   read user input    |  <code> readline </code>   |
|   <code> nap </code>  |   sleep / delay / (ms)    |  <code> setTimeout </code>   |
|   <code> crawl </code>  |   floor    |  <code> Math.floor </code>   |
|   <code> climb </code>  |   ceil    |  <code> Math.ceil </code>   |
|   <code> roll </code>  |   round    |  <code> Math.round </code>   |
|   <code> numba </code>  |   number type / cast    |  <code> Number() </code>   |
|   <code> babble </code>  |   string type / cast    |  <code> String() </code>   |
|   <code> squarehole </code>  |   boolean type / cast    |  <code> Boolean() </code>   |


<h2> Example Programs </h2>

<h4> Hello World </h4>

<table><tr><th>InfantJS</th><th>JavaScript</th></tr>
<tr>
<td>
gibberish(100 + 100)
</td>
<td>
jsconsole.log(100 + 100);
</td>
</tr>
</table>

----------------------------------------------------------------------------------------------------------------


<h4> __Variables and Arithmetic__ </h4>


<table>
<tr><th>InfantJS</th><th>JavaScript</th></tr>
<tr>
<td>
mine x = 100 + 100
gibberish(x / 2)
x = x - 50
gibberish(x)
peekaboo x > 100 {
  gibberish(x ** 3)
}
</td>
<td>
jslet x = 100 + 100;
console.log(x / 2);
x = x - 50;
console.log(x);
if (x > 100) {
  console.log(x ** 3);
}
</td>
</tr>
</table>

----------------------------------------------------------------------------------------------------------------

<h4> __Functions__ <h4>

<table>
<tr><th>InfantJS</th><th>JavaScript</th></tr>
<tr>
<td>
playtime example(x: numba, y: squarehole) {
  peekaboo y {
    gibberish(x ** 3)
  } nuhuh {
    gibberish(x ** 2)
  }
}

example(3, googoo)
</td>
<td>
jsfunction example(x, y) {
  if (y) {
    console.log(x ** 3);
  } else {
    console.log(x ** 2);
  }
}

example(3, false);
</td>
</tr>
</table>


----------------------------------------------------------------------------------------------------------------

<h4> __Number Guessing Game__ </h4>

<table>
<tr><th>InfantJS</th><th>JavaScript</th></tr>
<tr>
<td>
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
</td>
<td>
jslet num = Math.floor(Math.random() * 100) + 1;
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
</td>
</tr>
</table>

----------------------------------------------------------------------------------------------------------------

<h4> __While Loop with Variable__ </h4>

<table>
<tr><th>InfantJS</th><th>JavaScript</th></tr>
<tr>
<td>
wawawa googoo {
  gibberish(gaagaa)
}
</td>
<td>
jswhile (false) {
  console.log(true);
}
</td>
</tr>
</table>
 
----------------------------------------------------------------------------------------------------------------

<h4> __Math Builtins and Casting__ </h4>

<table>
<tr><th>InfantJS</th><th>JavaScript</th></tr>
<tr>
<td>
mine pi = 3.14159
gibberish(crawl(pi))
gibberish(climb(pi))
gibberish(roll(pi))

mine asText = babble(pi)
gibberish("Pi is: " + asText)
</td>
<td>
jslet pi = 3.14159;
console.log(Math.floor(pi));
console.log(Math.ceil(pi));
console.log(Math.round(pi));

let asText = String(pi);
console.log("Pi is: " + asText);
</td>
</tr>
</table>

----------------------------------------------------------------------------------------------------------------

<h2>How to Run</h2>
__Install dependencies__




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
