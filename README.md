[![Build Status](https://travis-ci.com/gabriela-framework/gabriela.svg?branch=master)](https://travis-ci.com/gabriela-framework/gabriela)
[![Code coverage](https://img.shields.io/badge/coverage-99%25-green)](https://github.com/gabriela-framework/gabriela)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/gabriela-framework/gabriela/blob/master/LICENSE)

#### NodeJS middleware pattern framework

Hello, visitor. Every product has its selling points. Framework software is
no exception. When I got the idea for this framework, my goal was to simplify
development with Javascript. If you ever used Express, you know how easy is to create
an HTTP route with it. Its basically a couple of lines of code. Simple. 

But building a functional application is much more that a couple of lines of code.
Express provides the middleware pattern which works great but as the application
grows, in my experience, that pattern needs constant care and refactoring. That tends
to be a tedious and error prone job. With Gabriela, I tried to expand on the middleware
pattern to make it both structured and maintainable. I really hope I succeeded in that.

Gabriela is still in alpha stage of development and using her in production
is not advisable. If you have any questions about it, you can send them to my
email marioskrlec111@gmail.com. Also, every criticism is very welcome. 

## Installing Gabriela

`npm install gabriela@alpha`

## Documentation

You can find the documentation here https://gabriela-framework.github.io/gabriela/#/

The documentation is still in development but the main building blocks and 
explanations are there.

## Contributing

If you wish to contribute to Gabriela, there are a couple of things to consider.

Gabriela is written with [Airbnb code style guide](https://github.com/airbnb/javascript) in mind
but its not a hard requirement. Please, study this guide before you start contributing.

Test coverage is a very important part of Gabriela. Currently, test coverage is done
with [Istanbul](https://github.com/gotwarlost/istanbul) and is at 99%. The only parts
that cannot be covered with test are the ones that kill NodeJS process in certain circumstances.
Since that also kills the process that executes the test, that part of code cannot be tested.
Every other part of code is within test coverage. If you which to contribute, please, test your
code. You can check the uncovered lines with `npm run console-coverage` command. 
