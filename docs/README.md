# Introduction<br/><br/>

## What is Gabriela?<br/>

Gabriela is framework that allows you to structure your application logic
in a way that is natural for any application. Depending on your application,
your can run it as a Node process or as an HTTP server or both. Your choice.

## Responsibility and development

Framework software is the engine with which an application is built. That application can be a simple portfolio website, a personal project or
an entire business with which people actually earn their living. In that regard, building a framework,
for me personally, bears a big responsibility. A part of that responsibility is ensuring that the framework
is well tested in different scenarios. Gabriela has over 200 different tests and code coverage is at 98%. The goal
of these tests will always be 100% so you can be sure that what is described in the documentation will work.

The second part is using it in production. Gabriela is currently in alpha stage and is not yet ready
for production. The next stage is beta and, once it gets there, you can be confident enough to use it in production. 
It will also stay in beta until it is absolutely proven in production by multiple applications. And yes, I know
this is counter intuitive but, as I said, building a framework is a responsible business and I cannot make a decision to 
put that number 1 in front of the version number based solely on my subjective opinion. That is a decision that must
be made by all of us together. 

Since testing is, for me, a huge part of making Gabriela production ready, there will also be an accompanying testing
framework designed to write tests for Gabriela. This testing framework will make it possible for you to isolate
parts of you application modules, plugins or DI services and test them separately. It will also have special tools for testing
Gabriela in an HTTP server environment but also using Gabriela with some messaging system like RabbitMQ or with a cache
server like Memcached or Redis. 

I hope that makes sense to you.

## Why another framework when there are so many?

Gabriela is not an MVC framework. I know that that is not very popular since the MVC pattern
holds a large piece of ground in the framework landscape, but in my personal development,
I always thought that the MVC pattern lacks the building blocks for most common application development,
like validation, security, data transformation, dependency injection and the application logic itself.
There is only the Model, Controller and the View (and the usual best practice is to put very little logic
in the controller). Sure, most of the MVC frameworks ship with some kind of validation or security component,
but each framework implements it in its own way. In that regard, Gabriela introduces a different way
of thinking about creating applications.

Central pattern in Gabriela is the middleware pattern which allows you to structure your code
based on what the code actually does. Security handling has its own middleware, validation, data transformation
and others. 

Gabriela also has a unique and intuitive dependency injection system with which you don't have to 
think about requiring your CommonJS modules but how to wire up your dependencies in a way
that makes sense for your application logic. 

Gabriela is also completely reusable. Basic building block in Gabriela is a module which you can make
completely independent from the rest of your application and reuse it in another application. Another building
block of Gabriela is a plugin which is basically a collection of modules. A plugin can be anything; from a simple utility that
creates a public dependency or an entire application which you can initialize with just one line of code.

Another aspect of Gabriela is the event system. Gabriela implements the Mediator pattern as an event system with which
you can transfer the logic of communicating with different components in one place. 

If you find this concepts interesting, read on. It is going to get a lot more interesting.

<br/><br/>

# Installation<br/><br/>

Gabriela is still in alpha stage and you can install it with

`npm install gabriela@alpha`

<br/><br/>

# Architecture<br/><br/>

_**Note: This chapter is not a tutorial. It is only an overview of Gabriela's basic concepts**_




## Modules<br/>

## Plugins<br/>

## Dependency injection<br/>

## Events<br/>

## Configuration<br/>

# Tutorial 1 - Implementing Spotify API

Not yet done, but coming soon

# Tutorial 2 - Simple user management

Not yet done, but coming soon

# Modules

## Your first module
## The middleware pattern
## Structuring your middleware

# Dependency injection

# Events

# Plugins

# Error handling

# API reference