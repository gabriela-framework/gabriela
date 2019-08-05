# Introduction

## What is Gabriela?

Gabriela is a framework that allows you to structure your application logic
in a way that is natural for any type of application. Depending on what you are creating,
your can run it as a Node process, as an HTTP server or both. Your choice.

Gabriela also strives to be platform independent. She does not know (or cares) if she is executed
as a simple Node process, an HTTP server or a RabbitMQ consumer (or anything else for that matter). 
This unique feature is still in development (Gabriela is still in alpha stage) 
but in the future, you will be able to concentrate on the business logic of your application 
first and then decide whether you want to implement it as an HTTP server or something else.

## Responsibility and development

Framework software is the engine with which an application is built. That application can be a simple portfolio website, a personal project or
an entire business with which people actually earn their living. In that regard, building a framework,
for me personally, bears a big responsibility. A part of that responsibility is ensuring that the framework
is well tested in different scenarios. Gabriela has over 200 different tests and code coverage is at 98%. The goal
of these tests will always be 100% so you can be sure that what is described in the documentation will work.

If you cloned Gabriela, you can run all tests with `npm run test` command. There are also two command for checking out
code coverage. The first one is `npm run console-coverage`. This will output the console coverage of Gabriela in the terminal.
The second one is `npm run coverage`. This will create an html output that you can run in your browser and is more
better for the eye. You can find it in the `coverage/index.html` file. Just open it in your browser and it will work.
I am using [Istanbul](https://istanbul.js.org/) for test coverage, more precisely, [nyc](https://github.com/istanbuljs/nyc) 
for running them.

The second part is using it in production. Gabriela is currently in alpha stage and is not yet ready
for production. The next stage is beta and, once it gets there, you can be confident enough to use it in production. 
It will also stay in beta until it is absolutely proven in production by creating multiple applications. And yes, I know
this is counter intuitive but, as I said, building a framework is a responsible business and I cannot make a decision to 
put that number 1 in front of the version number based solely on my subjective opinion. That is a decision that must
be made by a proven track record by building and running applications in production environment. It is also a decision
that we, as a community (if you choose to adopt it) have to decide, together. 

Since testing is, for me, a huge part of making Gabriela production ready, there will also be an accompanying testing
framework designed to write tests solely for Gabriela. This testing framework will make it possible for you to isolate
parts of you applications modules, plugins or DI services and test them separately. It will also have special tools for testing
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
of thinking about creating and structuring applications.

Central pattern in Gabriela is the middleware pattern which allows you to structure your code
based on what the code actually does. Security handling has its own middleware, validation, data transformation
and others. 

Gabriela also has a unique and intuitive dependency injection system with which you don't have to 
think about requiring your CommonJS modules but how to wire up your dependencies in a way
that makes sense for your application logic. 

Gabriela is also completely reusable. Basic building block in Gabriela is a module (not to be confused with a CommonJS module) which you can make
completely independent from the rest of your application and reuse it in another Gabriela application. Another building
block of Gabriela is a plugin which is basically a collection of modules. A plugin can be anything; from a simple utility that
creates a public dependency or an entire application which you can initialize with just one line of code.

Another aspect of Gabriela is the event system. Gabriela implements the Mediator pattern as an event system with which
you can transfer the logic of communicating with different components in one place. 

If you find these concepts interesting, read on. It is going to get a lot more interesting.

# Installation

Gabriela is still in alpha stage and you can install it with

`npm install gabriela@alpha`

# Primer

This primer is not a quick start, as most libraries and frameworks tend to have. It is more of a shallow overview
of Gabriela features. Kind of like the `Introduction` chapter in the immortal `The C programming language` by Dennis Ritchie and 
Brian Kernighan. It won't teach you Gabriela but you will have a good feel how Gabriela works and what are her features, and 
have a good base point in deciding to create something with Gabriela.

Main components of Gabriela are **modules**, **plugins**, **events** and **dependency injected services**.

___
**Important note**
>Throughout this documentation, I mention that Gabriela modules are not the same as CommonJS modules.
I do this because it is very important to differentiate them.
___

Gabriela can be created as a NodeJS process or as a server app. 

````javascript
const gabriela = require('gabriela');

const processApp = gabriela.asProcess({
    config: {},
});

// or

const serverApp = gabriela.asServer({
    config: {},
});
````

You start your app with 

````javascript
app.startApp();
````

You might notice the empty `config` property. This is mandatory for every Gabriela app. Later on,
you will read about *compiler passes* and will learn that anything you put into this configuration, 
will be passed to every *compiler pass* with which you can configure your services based on what your app
does. 

___
**Side note**
>Since Gabriela is still in alpha stage, you will have to create the empty *config* property every
time you create a Gabriela app. In the future, there will be a command line utility that will do that for
you. There will also be support for multiple environments like *dev*, *test* and *prod* but you will also
be able to create your own, custom environments. For now, please inject this object every time you create an 
app since it will throw an error if you don't.
___

## Your first module

````javascript
const gabriela = require('gabriela');

const processApp = gabriela.asProcess({
    config: {},
});

const myModule = {
    name: 'myModule',
    moduleLogic: [function() {
        console.log('Hello world');
    }],
};

processApp.addModule(myModule);

processApp.startApp();
````

If you copy/paste this and run it, you will see `Hello world` written in your terminal. Since this a a NodeJS process
app, the program will terminate after printing. You can learn more about modules in the 
[Modules](https://gabriela-framework.github.io/gabriela/#/?id=_11-modules), a dedicated chapter on modules.

## A module within a plugin

A plugin is a reusable component which you can use to group multiple modules in. If, for example, you have
a common functionality for handling users, like registration and logging in, you can create a registration module
and a login module, and then group then both into a user managment plugin.

````javascript
const gabriela = require('gabriela');

const registrationModule = {
    name: 'registrationModule',
    http: {
        route: {
            name: 'registration',
            path: '/register',
            method: 'POST',
        },
    },
    moduleLogic: [function() {
        console.log('Handle user registration');
    }],
};

const loginModule = {
    name: 'logicModule',
    http: {
        route: {
            name: 'login',
            path: '/logic',
            method: 'POST',
        }
    },
    moduleLogic: [function() {
        console.log('Handle user login');
    }],
};

const userManagmentPlugin =  {
    name: 'userManagementPlugin',
    modules: [registrationModule, loginModule],
};

const app = gabriela.asServer({config: {}});

app.addPlugin(userManagmentPlugin);

app.startApp();
````

As you can see, you don't have to add modules to `app` if they are part of a plugin.

## Dependency injection

So far, we have just made `console.log` whenever a user trid to login or register. Now, lets 
try to simulate a "real" registration. We will only create the services to do it but not the actual registration.

In order for our code to be more maintainable and reusable, it is better to put the logic into a service and not in the
middleware block. It our case, we can create a `UserService` and a `UserRepository`, where `UserRepository` 
will be used by `UserService`. We do this with Gabrielas dependency injection system. 

In order to create a service, we need to create the **definition** for that service. 

````javascript
const gabriela = require('gabriela');

/**
* This is the UserService definition. The actual UserService is the return value
* of the definitions 'init' function. We inject the UserRepository into our
* UserService and instantiate the UserService with UserRepository as its dependency. 
* 
* The name property is what we use to inject as an argument into another service
* or a middleware block. In the case of UserService, a userRepository variable is injected
* since this is the 'name' property in our UserRepository definition. In the same way, we inject
* userService as an argument whereever we need it. 
*/
const userServiceDefinition = {
    name: 'userService',
    init: function(userRepository) {
        function UserService(userRepository) {
            this.registerUser = function(userModel) {
                userRepository.saveUser(userModel);
            }
        }
        
        return new UserService(userRepository);
    }
};

const userRepositoryDefinition = {
    name: 'userRepository',
    init: function() {
        function UserRepository() {
            this.saveUser = function(userModel) {
                console.log(`Model ${JSON.stringify(userModel)} saved`);
            }
        }
        
        return new UserRepository();
    }
}

const registrationModule = {
    name: 'registrationModule',
    
    // this is where we bind these dependencies to our module. Both definitions are required
    // for this to work. The UserService will be injected in the moduleLogic middleware block
    // with UserRepository as its dependency.
    dependencies: [userServiceDefinition, userRepositoryDefinition],
    http: {
        route: {
            name: 'registration',
            path: '/register',
            method: 'POST',
        },
    },
    // we use the 'name' property of the UserService definition to 
    // inject the actual UserService into this middleware block
    moduleLogic: [function(userService) {
        userService.saveUser({
            name: 'Rolling',
            lastName: 'Stone',
        })
    }],
};

const app = gabriela.asServer({config: {}});

app.addModule(registrationModule);

app.startApp();
````

This is just a simple example of using dependency injection. Dependency injection can also be scoped by visibility i.e. **visibility scope**
and we can use that feature to limit the scope of our dependencies. There are 3 main visibility scopes in
Gabriela: **module**, **plugin** and **public**. **module** scope is scoped only to the module that 
declared it with the *dependencies* module property and it is the default scope if you don't explicitly declare it. 
**plugin** is scoped only to the plugin and **public** is,
as the word says, public to the entire application. You can read more on dependency injection in the section
*1.2 Dependency injection*.

## Events

Gabriela implements the [Mediator pattern](https://en.wikipedia.org/wiki/Mediator_pattern) as its event system.
You can transfer control of communicating with different services to the mediator event system and call it
multiple times within your middleware block.

The simplest example is creating an event and calling the event from a middleware block.

````javascript
const myModule = {
    name: 'myModule',
    dependencies: [userServiceDefinition, commentServiceDefinition, rmqServiceDefinition],
    mediator: {
        /**
        *  This example assumes that you already have a UserService, CommentService
        *  and an RmqService defined. 
        *  
        *  As you can see, we have transferred the logic of sending events 
        *  when a logged in user creates a comment to an external event. 
        *  
        *  This event can be used multiple times within this module
        */
        onCommentCreated(userService, commentService, rmqService) {
            const loggedInUser = userService.getLoggedInUser();
            
            const comments = commentService.getCommentsForUser(loggedInUser);
            
            for (const comment of comments) {
                rmqService.sendCommentCreatedEvent(comment);
            }
        }
    },
    moduleLogic: [function() {
        this.mediator.emit('onCommentCreated');
    }],
}
````

This is just a taste of the event system that Gabriela has. You can also create **emitted events** that are 
asynchronous and **exposed events**. Exposed events are used when creating third party plugins
which the plugin can declare and modules can call. More on this in a dedicated *Events* chapter

## Conclusion

As you can see, Gabriela has features that help you create maintainable and reusable components and I hope
this primer persuaded you to continue looking into Gabriela. Next step is to take a deeper look at the architecture 
of the framework in depth to have a better understanding of all the features of Gabriela. You can also skip the 
chapter about architecture and go right into `Tutorial 1 - Implementing MySQL plugin` or any other tutorial but
my advice would be to read the next part about architecture first, try to create some modules or plugins
and then take a look at different tutorials in this documentation.

# 1. Architecture

Gabrielas main building blocks are **modules**, **plugins**, **events** and the **dependency injection system**.

Gabriela can be created as a NodeJS process or as a NodeJS server. Both have the same interfaces and both are
executed in the same way with the exception that Gabriela server apps have some additional features like
*onPreResponse* or *onPostResponse* events and many others. Generally, your modules logic does not have to care
if it receives and processes data given from an HTTP request or somewhere else. In that regard, modules and plugins
can be reused in any type of apps. 

As we said, *modules* and *plugins* are executed in the order in which you added them. 

````javascript
const gabriela = require('gabriela');

const app = gabriela.asServer({config: {}});

/**
* 'module1', 'module2' etc. are just stubs to make the example more readable
*/
app.add(module1);
app.add(module2);
app.add(plugin1);
app.add(plugin2);

app.startApp();
````

When you run *startApp*, Gabriela starts running every component in the order you added them.
First, *module1* is ran, then *module2* all the way up to *plugin2*.

We haven't talked about plugins yet, but for now, know that plugins are basically collections of modules
in which you can group related modules. Because of that, modules that are added solely as modules
but also as parts of a plugin are executing once as a standalone module and once in every plugin.

````javascript
const gabriela = require('gabriela');

const app = gabriela.asProcess({config: {}});

const myModule = {
    name: 'myModule',
    moduleLogic: [function() {
        console.log('myModule is executed');
    }]
}

const myPlugin = {
    name: 'myPlugin',
    modules: [myModule],
}

app.addModule(myModule);
app.addPlugin(myPlugin);

app.startApp();
````

In the above example, Gabriela starts executing *myModule* first. Then, it starts executing every
module that is part of *myPlugin*. Because of that, you will see `myModule is executed` printed twice.

So, lets start exploring Gabrielas architecture one component at a time. Modules first.

## 1.1 Modules

Gabriela's main building block is called a **module**. A module is an isolated piece of 
functionality that is specific for your application. In an HTTP context, 
this can be a single HTTP route but it can be much much more. 

**Don't confuse Gabriela modules with CommonJS modules because they don't have anything in common.**

### 1.1.1 An introduction example

The best thing to do is to do some code so let's create a Hello World by creating a Gabriela module and running it.

````javascript
const gabriela = require('gabriela');

const helloWorldModule = {
    name: 'helloWorld',
    moduleLogic: [
        {
            name: 'helloModuleLogic',
            middleware: function(state) {
                state.hello = 'Hello';
            },
        },
        {
            name: 'worldModuleLogic,
            middleware: function(state) {
                state.world = 'World';
            },
        },
        {
            name: 'finalMiddleware',
            middleware: function(state) {
                console.log(`${state.hello} ${state.world}`);
            },
        }
    ],
};

const app = gabriela.asProcess({
    config: {}
});

app.addModule(helloWorldModule);

app.startApp();

````

*For readability, in the next examples, I will only use the module declaration object literal. Running it and starting Gabriela
is assumed in all examples*

The first thing you will notice is that a module is just a simple javascript object literal that
has some properties. This is called a module declaration. In a module declaration, only the `name` is
mandatory. Everything else is optional. 

You will also notice that the module declaration has the `moduleLogic` property that accepts an array of 
middleware objects. This is called a **middleware block**. There are 5 middleware blocks in Gabriela: 

- security
- validators
- preLogicTransformers
- moduleLogic
- postLogicTransformers

Every middleware block does the same thing; executes all the functions that you have given to it in the above order.
First, `security` block is executed, then `validators` and then all the way to `postLogicTransformers`. It is important
to note that every middleware block does the same thing: it executes given functions in order. `security` block does not
handle security for you automatically and validators block does not handle validation for you automatically. These blocks
are only logical structures in which you put functions that do a certain thing. For example, if you have a function that checks
if the user has the correct role for a certain resource, you will put it in the `security` block. If the user has access to 
the resource, you will then check if he has the correct data for that resource in the `validators` block. Then, you will process
the request in the `moduleLogic` block and return the response. If you need to do something after you handled modules logic, you can
to that in the `postLogicTransformers` block. 

*It is very important to understand that Gabriela is not an HTTP framework. Middleware blocks don't know that they are executed as a simple
Node process, an HTTP route or a RabbitMQ consumer*

Next thing you will notice is the `state` argument that every middleware function has. `state` is just a plain
javascript object literal that is passed into every declared middleware function. You can attach any value to this object and use 
it to communicate between your middleware functions. 

In our example above, we putted the `state.hello` and `state.world` property on it and used it in our final middleware function to 
print out Hello world to the console. 

You can also write middleware functions with a short syntax by supplying them as just plain
functions. 

````javascript
const helloWorldModule = {
    name: 'helloWorld',
    moduleLogic: [
        function(state) {
            state.hello = 'Hello',
        },
        function(state) {
            state.world = 'World',
        },
        function(state) {
            console.log(`${state.hello} ${state.world}`);
        },
    ],
};

````

The above example will execute in the same way as our first one but the object syntax is more descriptive.
Gabriela modules can also be overriden but only if you are using the object syntax so it is best practice
to always create middleware functions with the object syntax. We will talk more about overriding 
modules middleware blocks later on in the chapter *Modules in depth*. So, lets get back to our previous
example. 

Next piece of code that we see is

````javascript
const app = gabriela.asProcess({
    config: {}
});

````

This will create a Gabriela app as a NodeJS process. We also supply it with a default configuration. The default
configuration object is mandatory and we will talk about it later on. 

If you wanted to create Gabriela app as a server, you would create it like this 

````javascript
const app = gabriela.asServer({
    config: {}
});

````

Next, we start the app with 

````javascript
app.startApp();

````

This code actually starts to run our app. After all middleware functions execute, since Gabriela is created
as a process, the app exists after writing *Hello world* to the console. 
___
#### Side note: Middleware functions<br/>
>As you can see in the previous examples, we haven't declared any middleware as arrow functions. Do not declare middleware functions
with the arrow `=>` syntax. As we will see in the rest of this documentation, `this` is bound to an object that contains
the `mediator` and `emitter` which are part of the Gabriela event system (probably more in the future). Always
declare middleware functions with the `function()` syntax and not arrow `=>` syntax.
___

### 1.1.2 Middleware blocks

As we previously said, there are 5 middleware blocks:  

- security
- validators
- preLogicTransformers
- moduleLogic
- postLogicTransformers

In our previous example, we could have putted the code into any one of them and it would be the same result.

````javascript
const gabriela = require('gabriela');

const helloWorldModule = {
    name: 'helloWorld',
    validators: [
        {
            name: 'helloModuleLogic',
            middleware: function(state) {
                state.hello = 'Hello',
            },
        },
        {
            name: 'worldModuleLogic,
            middleware: function(state) {
                state.world = 'World',
            },
        },
        {
            name: 'finalMiddleware',
            middleware: function(state) {
                console.log(`${state.hello} ${state.world}`);
            },
        }
    ],
};

const app = gabriela.asProcess({
    config: {}
});

app.addModule(helloWorldModule);

app.startApp();

````

In this copy/paste of the previous example, we only changed the `moduleLogic` to `validators`. If you
run this code, it would yield the same result. All middleware blocks have the same functionality; execute
the given functions in the middleware block order. It is only best practice to put your modules logic into
the most appropriate middleware block.

Lets for the sake of this chapter, create a module with all the middleware blocks in it, with a little bit
of logic that is not really important for what we will try to explain in this chapter.

*For the sake of brevity, we will use the middleware function shorthand syntax but the best practice is
to always declare middleware functions as object literals.*

````javascript
const gabriela = require('gabriela');

const handlingMiddlewareBlockModule = {
    name: 'helloWorld',
    security: [function() {
        console.log(`'security' block is executed`)
    }],
    validators: [function() {
        console.log(`'validators' block is executed`)
    }],
    preLogicTransformers: [function() {
        console.log(`'preLogicTransformers' block is executed`)
    }],
    moduleLogic: [function() {
        console.log(`'moduleLogic' block is executed`)
    }],
    postLogicTransformers: [function() {
        console.log(`'postLogicTransformers' block is executed`)
    }],
};

const app = gabriela.asProcess({
    config: {}
});

app.addModule(handlingMiddlewareBlocksModule);

app.startApp();

````

In this example, all the middleware blocks are executed one after the other. After you run this code, you will
get this output.

````
'security' block is executed
'validators' block is executed
'preLogicTransformers' block is executed
'moduleLogic' block is executed
'postLogicTransformers' block is executed
````

In some cases, you will want to go to the next middleware block function, skip an entire block or 
skip all blocks and exit from executing all the blocks. 

If you wish to proceed to the next middleware function, simply place `return` somewhere in your function
and execution will continue in the next middleware block function.

````javascript
const handlingMiddlewareBlockModule = {
    name: 'helloWorld',
    security: [function() {
        console.log(`'security' block is executed`)
    }],
    validators: [function(state) {
        state.someCondition = true;
        
        console.log(`'validators' block is executed`)
    }],
    preLogicTransformers: [function(state) {
        if (state.someCondition) {
            return;
        }
        
        console.log(`'preLogicTransformers' first function is executed`)
    }, function() {
        console.log(`'preLogicTransformers' second function is executed`)
    }],
    moduleLogic: [function() {
        console.log(`'moduleLogic' block is executed`)
    }],
    postLogicTransformers: [function() {
        console.log(`'postLogicTransformers' block is executed`)
    }],
};

````

When you try to run this code, the output will be 

````
'security' block is executed
'validators' block is executed
'preLogicTransformers' second function is executed
'moduleLogic' block is executed
'postLogicTransformers' block is executed

````

As you can see, we created the `state.someCondition` in the `validators` block and simply returned from
the first middleware function in `preLogicTransormers`. 

In case you want to skip the entire middleware block and proceed to the next one, you can use the
`skip` function. 

````javascript
const handlingMiddlewareBlockModule = {
    name: 'helloWorld',
    security: [function() {
        console.log(`'security' block is executed`)
    }],
    validators: [function(state) {
        state.someCondition = true;
        
        console.log(`'validators' block is executed`)
    }],
    preLogicTransformers: [function(state, skip) {
        if (state.someCondition) {
            return skip();
        }
        
        console.log(`'preLogicTransformers' first function is executed`)
    }, function() {
        console.log(`'preLogicTransformers' second function is executed`)
    }],
    moduleLogic: [function() {
        console.log(`'moduleLogic' block is executed`)
    }],
    postLogicTransformers: [function() {
        console.log(`'postLogicTransformers' block is executed`)
    }],
};

````

We have added the `skip` function to be injected into our first function in the `preLogicTransormers` middleware
block and used it to skip the entire `preLogicTransformers` middleware block. The output of our module will then be

````
'security' block is executed
'validators' block is executed
'moduleLogic' block is executed
'postLogicTransformers' block is executed

````

As you can see, `preLogicTransformers` middleware block was completely skipped.

Do not forget to `return skip()`. Skipping middleware blocks is not some javascript magic and if you omit the 
return statement, it will execute the first function but also skip the rest of the middleware block. Use it without
returning `skip()` only if you want to execute the first function and skip the rest of the middleware block.

___
#### Side note: Argument order<br/>
>The order of __state__ and __skip__ (or any other injected argument) is irrelevant. You can invert the argument
order and all the arguments will be injected correctly. This feature is part of the dependency injection
system that we will be talking about more in the section __2.3 Dependency injection__ and again in section
__Dependency injection in depth__.
___

The last function that we will examine here is `done()`. `done()` simply skips and does not execute
all the middleware blocks after it is called. The most clearer example (but also the most useless) is to
put `return done()` in the first function of the `security` middleware block.

````javascript
const handlingMiddlewareBlockModule = {
    name: 'helloWorld',
    security: [function(done) {
        return done();
        
        console.log(`'security' block is executed`)
    }],
    validators: [function(state) {
        state.someCondition = true;
        
        console.log(`'validators' block is executed`)
    }],
    preLogicTransformers: [function(state, skip) {
        if (state.someCondition) {
            return skip();
        }
        
        console.log(`'preLogicTransformers' first function is executed`)
    }, function() {
        console.log(`'preLogicTransformers' second function is executed`)
    }],
    moduleLogic: [function() {
        console.log(`'moduleLogic' block is executed`)
    }],
    postLogicTransformers: [function() {
        console.log(`'postLogicTransformers' block is executed`)
    }],
};

````

Notice that we injected the `done()` function in our `security` middleware block and returned it immediately. If you execute
this code, you will see that none of the functions in all the middleware block will be executed. 

There is also one more middleware handling function called `next()` and we use it to 
control asynchronous code within our middleware functions to ensure that async code is executed
before we proceed to our next middleware function so lets start our next section, `Handling asynchronous code`.

### 1.1.3 Handling asynchronous code

What happens if we try to execute asynchronous code inside one of our middleware functions?

*In our examples, I will use the __request-promise__ package. If you want to use these examples with some other
tool, it will work the same.*

````javascript
const requestPromise = require('request-promise');

const asyncCodeModule = {
    name: 'asyncCodeModule',
    moduleLogic: [
        function() {
           requestPromise.get('https://www.google.com').then(function() {
               console.log('Google request finished');
           });
        }, function() {
           console.log(`'moduleLogic' second function is executed`)
        }
    ],
};

````

If you try to run this example, you will see this printing in your terminal

````
`'moduleLogic' second function is executed`
Google request finished
````

Both of the functions executed one after the other but the second function did not wait for the request
in the first function to finish. In order to fix this, lets introduce `next()`.

````javascript
const requestPromise = require('request-promise');

const asyncCodeModule = {
    name: 'asyncCodeModule',
    moduleLogic: [
        function(next) {
           requestPromise.get('https://www.google.com').then(function() {
               console.log('Google request finished');
               
               next();
           });
        }, function() {
           console.log(`'moduleLogic' second function is executed`)
        }
    ],
};

````

As you can see, we injected the `next` function into our middleware and called it after the request has finished.
Now, the output will be correct.

````
Google request finished
`'moduleLogic' second function is executed`
````

## 1.2 Plugins

Plugins are a way to centralize your modules into one logical place. For example, you can group
modules that handle user management into one place. Although you can create reusable 
third party modules that others can use in their projects, it is better to centralize your
solutions into a plugin since plugins provide more fine grained control over you app.

Plugins also let you create **exposed events** that you can declare from your modules within a plugin
and fire them when something important happens. We have not yet talked about events and this will be just
a sneak peak of how the event system in Gabriela works, but you can go to chapter *1.4 Events* any time
to take a closer look at this feature.

So, lets start exploring plugins.

### 1.2.1 Declaring a plugin

A basic plugin has a **name** and a **modules** property. Both are required.

````javascript
const myPlugin = {
    name: 'myPlugin',
    modules: [/** declare your modules here */]
}
````

You add plugins to your app with *addPlugin* method

````javascript
const gabriela = require('gabriela');

const myPlugin = {
    name: 'myPlugin',
    modules: [/** declare your modules here */]
}

const app = gabriela.asProcess({config: {}});

app.addPlugin(myPlugin);
````

### 1.2.2 Plugin execution

Modules added to a plugin are executed in the order you added them.

````javascript
const myPlugin = {
    name: 'myPlugin',
    // 'module1', 'module2' etc... declarations are ommitted for brevity
    modules: [module1, module2, module3, module4]
};
````

In the above example, *module1* will be executed first, then *module2* all the way to 
*module4*.

### 1.2.3 Exposed events

We haven't covered events up to this point and exposed events are a part of the event system that is 
unique to plugins and could be used to create powerful third party plugins. Exposed events give you the power
to emit events that happen in a plugin giving your application a chance to react. For example, a MySQL plugin
can emit an exposed event when a connection is established or even every time a query is executed.

So lets take a close look at exposed events. Before this chapter, you can go and read a chapter *1.4 Events* but this chapter is composed in a way that you don't have to.

#### Declaring exposed events

Exposed events are declared on the plugin declaration.

````javascript
const myPlugin = {
    name: 'myPlugin',
    // this is where we declare an exposed event
    exposedEvents: ['onExposedEvent'],
    // 'myModule' is not yet created but we will create it shortly
    modules: [myModule]
};
````

Every exposed event is a string declared on the *exposedEvents* array. This event is
not yet emitted and must be emitted within a module that is part of a plugin. In *myPlugin*, we
have *myModule* but we haven't created it. So, lets create it to see how to emit events.

````javascript
const myModule = {
    name: 'myModule',
    moduleLogic: [function() {
        this.mediator.emit('onExposedEvent', {
            data: {}
        });
    }],
}
````

*myModule* is not doing anything special except emit *onExposedEvent* with some custom data. Lets put this all
together to see how it all comes to play.

````javascript
const gabriela = require('gabriela');

const myModule = {
    name: 'myModule',
    moduleLogic: [function() {
        this.mediator.emit('onExposedEvent', {
            data: {}
        });
    }],
};

const myPlugin = {
    name: 'myPlugin',
    exposedEvents: ['onExposedEvent'],
    // 'myModule' is not yet created but we will create it shortly
    modules: [myModule]
};

const app = gabriela.asProcess({config: {}});

app.addPlugin(myPlugin);

app.startApp();
````

This is all great, but we still don't have any code where we react to this event. To do this, lets
create a module that has a mediator event function attached that runs when *myModule* emits *onExposedEvent*.

````javascript
const gabriela = require('gabriela');

const myModule = {
    name: 'myModule',
    moduleLogic: [function() {
        this.mediator.emit('onExposedEvent', {
            data: {}
        });
    }],
};

const myPlugin = {
    name: 'myPlugin',
    exposedEvents: ['onExposedEvent'],
    // 'myModule' is not yet created but we will create it shortly
    modules: [myModule]
};

const reactingModule = {
    name: 'reactingModule',
    mediator: {
        onExposedEvent(data) {
            
        }
    }
}

const app = gabriela.asProcess({config: {}});

app.addPlugin(myPlugin);
app.addModule(reactingModule);

app.startApp();
````

We have added *reactingModule* to our app. Every time *myModule*, that is part of *myPlugin*, emits 
*onExposedEvent*, *reactingModule* will react to that event by running *onExposedEvent* function.

Now, imagine that *myPlugin* is actually a third party plugin that you installed over *npm*. Lets say 
that it is an abstraction over MongoDBs native NodeJS driver. Such a plugin could have an exposed event *onConnectionEstablished*
are your own modules could react to it.

````javascript
const gabriela = require('gabriela');
// this is our fictional plugin that abstracts native mongo driver for NodeJS.
const mongoPlugin = require('gabriela-mongo-plugin');

const app = gabriela.asProcess({config: {}});

app.addPlugin(mongoPlugin);

// this is our custom module with which we do 'something' with mongo
const myModule = {
    name: 'myModule',
    mediator: {
        onConnectionEstablished(conn) {
            
        }
    }
};

app.addModule(myModule);

app.startApp();
````

As you can see, integrating native mongo driver into gabriela is just one line of code.
The connection is created for us and the only thing we have to do is react to events that 
our plugin is creating.


## 1.3 Dependency injection

Dependency injection is the central component of Gabriela and it makes her a closed system. In order
to create a dependency injection service, you first have to create a dependency injection **definition**. With that definition,
Gabriela will create your service and inject it where ever you need.

Dependency injection is **scoped**. There are 3 scopes: 

- **visibility scope**
- **shared scope**
- and **private scope**

We will first examine the anatomy of a *definition* and then dwelve into scopes.

We will also talk about how to resolve services asynchronously, how to create 
**function expressions** and how to create services dynamically with **compiler passes**.

### 1.3.1 DI definition

A *definition*, in its basic form, consists of a **name** and an **init** function that is a factory
for our service. This function has to return an object of some kind, be it a function object
or an object literal. If you don't return either of these values, an error will be thrown.

````javascript
const basicDefinition = {
    name: 'basicDefinition',
    init: function() {
        return {};
    }
};
````

The *name* property determines the argument name when this service is injected. 

````javascript
const myModule = {
    name: 'myModule',
    dependencies: [basicDefinition],
    /**
    * As you can see, the value of the 'name' property in the DI definition is
    * the name of the argument that will hold the return value of the 'init' function
    */
    moduleLogic: [function(basicDefinition) {
        // do something with basicDefinition here
    }],
}
````

Assigning a service to a module via *dependencies* array is called a **service declaration**. Every service declaration
will go into this place including services with *shared scope* and *private scope*. More on those scopes later in this chapter.

Since scopes are an important part of every DI service, lets examine scopes in detail; **visiblity scope**
first.

### 1.3.2 Visibility scopes

There are 3 types of visibility scopes in Gabriela:

- **module** scope
- **plugin** scope
- and **public** scope

#### *module* scope
___

**module** scope is the default scope for every service, so in our example from above we have actually
created a definition for a service with the module scope. A scope is declared with a *scope* property 
on the definition object.

````javascript
const basicDefinition = {
    name: 'basicDefinition',
    // 'module' scope is the default scope so this is redundant if 
    // you know that this service will be in 'module' scope only.
    scope: 'module',
    init: function() {
        return {};
    }
};
````

With the *module* scope, the service can only be used within a module in which it is declared in 
(with the *dependencies* property).

So in our *myModule* module, *basicDefinition* could only be used within that *myModule* module. If you would
create another module, but you do not place its definition into that module, an error will be thrown that a dependency
cannot be found. 

````javascript
const myModule = {
    name: 'myModule',
    dependencies: [basicDefinition],
    /**
    * As you can see, the value of the 'name' property in the DI definition is
    * the name of the argument that will hold the return value of the 'init' function
    */
    moduleLogic: [function(basicDefinition) {
        // do something with basicDefinition here
    }],
}
````

___
**Best practice**
>Only declare a dependency with a *module* visibility scope if that service will only be used
in that module. If the service will be used in more that one module, declare it as *public* or
*plugin*, if your module is part of a plugin.
___

___
**About state in services**
>Do not store state in your services. Your services should be a reusable stateless 'things'. For example,
in a UserRepository service, you would have a UserRepository::getUserByName(name: string) method. 
If, for some reason, you cache the user within this service and use the cached user in subsequent calls, the same reference of this service
will be used. Always create pure functions in your services (functions that, when given some input, always
return the same output) and don't store any state in them. If you need to store state, use the 'state' object
in any of the middleware blocks.
___

It is also very important to note that if you declare the same dependency in multiple modules,
resolved services will be different references.

````javascript
const gabriela = require('gabriela');

const basicDefinition = {
    name: 'basicDefinition',
    scope: 'module',
    init: function() {
        return {};
    }
};

const myModuleOne = {
    name: 'myModuleOne',
    dependencies: [basicDefinition],
    moduleLogic: [function(basicDefinition) {
    }],
};

const myModuleTwo = {
    name: 'myModuleTwo',
    dependencies: [basicDefinition],
    moduleLogic: [function(basicDefinition) {
    }],
};

const app = gabriela.asProcess({config: {}});

app.addModule(myModuleOne);
app.addModule(myModuleTwo);

app.startApp();
````

Since these modules will run one after the other, each module would receive a new reference to `basicDefinition`.
One reference for *myModuleOne* and one for *myModuleTwo*. That means that the *init* function is executed 
once for every module in which the definition is used. 
 
But if you used *basicDefinition* in any other place within the same module, you would get the same reference.
That means that definitions with *module* scope are a single instance troughout the lifetime of that module. 

````javascript
const myModule = {
    name: 'myModule',
    dependencies: [basicDefinition],
    moduleLogic: [function(basicDefinition) {
        // for this middleware functions, basic definition is created one
    }, function(basicDefinition) {
        // basicDefinition here is the same reference as in the first middleware function
    }],
};
````

#### **Important note: module scope references**
>When declaring services with *module* scope, service is instantiated only once. After that, the same reference
is used in all subsequent injections, but only within the module they are declared in. For every other module,
a new reference is created.

#### *plugin* scope

*plugin* scope works in the same way as *module* scope but in regards to plugins. If a module declares a service
with the *plugin* visibility scope, every module in that plugin has access to that service. The service is always
created only once so the same reference is shared between all modules within a plugin.

````javascript
const gabriela = require('gabriela');

const pluginService = {
    name: 'pluginService',
    scope: 'plugin',
    init: function() {
        return {};
    }
};


const declaringModule = {
    name: 'declaringModule',
    declarations: [pluginService],
};

const moduleOne = {
    name: 'moduleOne',
    moduleLogic: [function(pluginService) {
        // use the pluginService here
    }, function(pluginService) {
        // pluginService is the same reference as in the first function of this middleware function
    }]
};

const moduleTwo = {
    name: 'moduleTwo',
    moduleLogic: [function(pluginService) {
        // pluginService is the same reference as in moduleOne
    }]
};

const myPlugin = {
    name: 'myPlugin',
    modules: [declaringModule, moduleOne, moduleTwo],
};

const app = gabriela.asProcess({config: {}});

app.addPlugin(myPlugin);

app.startApp();
````

We use a little trick here with which we can declare dependencies with a blank module. Not every module 
has to have middleware or any logic to it. In this case, we only use *declaringModule* to declare our *plugin*
dependency (or multiple dependencies). You can use this trick to declare your *plugin* and *public* dependencies
in one place and then declare dependencies with *module* scope, only in modules where you actually need them. Declaring
a *module* scope dependency in *declaringModule* would have no effect since it would not be used anywhere.

It is also important to note that if we had created another plugin, a new instance of *pluginService* would be created
and would not be the same reference as in other plugins. Keep that in mind when creating services that are shared within a plugin.
If you need to create a service that is shared only between certain plugins, use **shared** scope. We will talk about
shared scope shortly. 

#### *public* scope

Plain and simple, *public* scope is available everywhere. 

````javascript
const gabriela = require('gabriela');

const publicService = {
    name: 'pluginService',
    scope: 'public',
    init: function() {
        return {};
    }
};


const declaringModule = {
    name: 'declaringModule',
    declarations: [publicService],
};

const moduleOne = {
    name: 'moduleOne',
    moduleLogic: [function(publicService) {
        // use the publicService here
    }, function(publicService) {
        // publicService is the same reference as in the first function of this middleware function
    }]
};

const moduleTwo = {
    name: 'moduleTwo',
    moduleLogic: [function(publicService) {
        // publicService is the same reference as in moduleOne
    }],
};

const app = gabriela.asProcess({config: {}});

app.addModule(declaringModule);
app.addModule(moduleOne);
app.addModule(moduleTwo);

app.startApp();
````

As you can see, *publicService* is available in every module as the same reference to an object.
If we created multiple plugins and modules, they would all share the same reference to *publicService*.
Use public services when you need a shared functionality troughout your project. 

Public services are also a great way for third party plugins to expose a service to the client code. 
For example, for a MySQL plugin, there could be a public *mysqlConnection* service that our client code can use while
the details of connecting to the database are handled by this third party plugin.

### 1.3.3 Shared scope

**shared** scope is somewhat similar to public scope but in shared scope, you choose the modules and
plugins that will be able to inject the service.

The best thing to do is see it by example.

````javascript

const gabriela = require('gabriela');

const sharedService = {
    name: 'sharedService',
    shared: {
        modules: ['moduleOne', 'moduleTwo'],
        plugins: ['sharedPlugin'],
    },
    init: function() {
        return {};
    }
};

const declaringModule = {
    name: 'declaringModule',
    dependencies: [sharedService]
};

const moduleOne = {
    name: 'moduleOne',
    moduleLogic: [function(sharedService) {
        // use the sharedService here
    }],
};

const moduleTwo = {
    name: 'moduleTwo',
    moduleLogic: [function(sharedService) {
        // sharedService is the same instance, the same reference to an object from
        // the first moduleTwo
    }]
};

/**
* Please, take note that this plugin uses moduleOne
*/
const sharedPlugin = {
    name: 'sharedPlugin',
    modules: [moduleOne]
};

const app = gabriela.asProcess({config: {}});

app.addModule(declaringModule);
// this module is added here but is also part of a plugin
app.addModule(moduleOne);
app.addModule(moduleTwo);
app.addPlugin(sharedPlugin);

app.startApp();
````

There are a couple of things to explain here.

First, two modules share the *sharedService*; *moduleOne* and *moduleTwo*. They share the same reference
to this service. Also, *sharedPlugin* is also using *sharedService* with the same reference as 
*moduleOne* and *moduleTwo*.

Lets explore this concept more in depth. Gabriela executes modules and plugins in the order in which they are added.
First, *declaringModule* is executed, then *moduleOne*, all the way to *sharedPlugin*. When *moduleOne*
is executed, the service is created for the first time. After that, *moduleTwo* uses the same service reference as 
*moduleOne*.

Our *sharedPlugin* has *moduleOne* as its module and *sharedService* is also the same reference as in *moduleOne* and
*moduleTwo*. If we had added a third module, *moduleThree* and declared *sharedService* as its dependency, Gabriela
would throw an error saying that it cannot find this dependency. 

````javascript
// This module would throw an error
const moduleThree = {
    name: 'moduleThree',
    dependencies: [sharedService],
    moduleLogic: [function(sharedService) {
        
    }],
};
````

As said previously, *shared scope* is similar to *public* visibility scope but it allows you to 
explicitly name your modules and plugins with which you want to share your services.

### 1.3.4 Private scope

Private scopes are a way of encapsulating dependencies of a service to be only visible to 
that service. They are a great way for keeping your dependencies hidden from the application
and used only in the service where you need them.

````javascript
const userRepositoryDefinition = {
    name: 'userRepository',
    init: function() {
        function UserRepository() {}
        
        return new UserRepository();
    }
};

const basicDefinition = {
    name: 'basicDefinition',
    dependencies: [userRepositoryDefinition],
    init: function(userRepository) {
        // userRepository is only visible in basicDefinition
    }
};
````

As you can see, private dependencies are declared within a definition, in the same way
you would declare it in a module. 

If you make *userRepository* a private dependency of another service, *userRepository* will be
created again (*init* function on *userRepositoryDefinition* will be called again) and you will
get a new reference to it.

````javascript
const userRepositoryDefinition = {
    name: 'userRepository',
    init: function() {
        function UserRepository() {}
        
        return new UserRepository();
    }
};

const basicDefinition = {
    name: 'basicDefinition',
    dependencies: [userRepositoryDefinition],
    init: function(userRepository) {
        // userRepository is only visible in basicDefinition
    }
};

const someOtherDefinition = {
    name: 'basicDefinition',
    dependencies: [userRepositoryDefinition],
    init: function(userRepository) {
        // this is a new reference of the userRepository
    }
};
````

But this does not mean that *userRepository* cannot be used anywhere else. You can have any
scope attached to a *private* scope dependency. What makes a service private is only the 
way you declare it. If you declare it in the service *definition*, that will make the dependency
private but if you declare the same private service on a module, you can use it there too.

````javascript
const userRepositoryDefinition = {
    name: 'userRepository',
    // notice the 'public' scope
    scope: 'public',
    init: function() {
        function UserRepository() {}
        
        return new UserRepository();
    }
};

const basicDefinition = {
    name: 'basicDefinition',
    dependencies: [userRepositoryDefinition],
    init: function(userRepository) {
    }
};

const userModule = {
    name: 'userModule',
    // notice that both 'basicDefinition' and 'userRepositoryDefinition' are declared
    // on this module
    dependencies: [basicDefinition, userRepositoryDefinition],
    moduleLogic: [function(basicDefinition, userRepository) {
        
    }],
}
````

Here, *userRepository* has a *public* scope (and you can use it anywhere in your application) but is also privately scoped only for *basicDefinition*. That means that for *basicDefinition*,
a new *userRepository* is created that has a different reference than that of *userRepository* used in 
a *userModule*. 

#### **Side note: Private dependencies**
___
>Private dependencies are the same as any other dependency. They have the same definition as any other
dependency. The only difference is where you declare it. If you declare a dependency on a definition, you
declared a private dependency. 

### 1.3.5 Asynchronous services

What if you need to create a service with data from some third party API? 

````javascript
const apiService = {
    name: 'apiService',
    // thirdPartyApiService is just a stub for a service 
    // that fetches data from somewhere else other 
    // than your application. It does not have anything 
    // to do with Gabriela
    init: function(thirdPartyApiService) {
        thirdPartyApiService.getData().then(() => {
            
        });
        
        // the code exits here and an error is raised saying 
        // that you have to return an object from the 'init' function
    }
};
````

In the example above, we have to wait until *thirdPartyApiService* has finished fetching data
and then resolve our service. If you remember the chapter on modules, modules have a special
*next* function that is used to signal to Gabriela that she needs to wait until async code is finished
so she can continue to execute other middleware block functions. The same function is available
for dependency injection but only slightly differently. 

````javascript
const apiService = {
    name: 'apiService',
    init: function(thirdPartyApiService, next) {
        thirdPartyApiService.getData().then((data) => {
            next(() => {
                function ApiService(data) {
                    // use data here
                }
                
                return new ApiService(data);
            });
        });
    }
};

const apiModule = {
    name: 'apiModule',
    moduleLogic: [function(apiService) {
        
    }],
}
````

The only difference between *next* when used in a *module* and *next* within a definition is
that *next* within a definition accepts a function argument that, when called, needs to return 
a service. In our example above, when *thirdPartyApiService* has finished fetching data, we create
our *ApiService* with *next* and return it. *apiModule* does not know or cares how the service
is created. Only that it is there.

### 1.3.6 Function expressions

Function expressions are a way to execute functions created as service with the dependency injection
system. It's a little hard to explain it with words, so lets see an example.

````javascript
const gabriela = require('gabriela');

const functionExpressionDefinition = {
    name: 'functionExpression',
    init: function() {
        return function() {
            console.log('This is a function expression');
        }
    }
};

const myModule = {
    name: 'myModule',
    dependencies: [functionExpressionDefinition],
    // functionExpression is executed here
    moduleLogic: ['functionExpression()']
};

const app = gabriela.asProcess({config: {}});

app.addModule(myModule);

app.startApp();
````

Function expressions are executed as strings in a middleware block. They work in the same way as if you
declared a regular function within a middleware block. Use them to make your modules middleware functions less verbose and more readable. 

### 1.3.7 Compiler passes

Compiler passes are a feature of the dependency injection system that lets you create your services
dynamically depending on your configuration or some other factors. They are also a perfect way to create
services when you are creating third party plugins. 

````javascript
const basicDefinition = {
    name: 'basicDefinition',
    compilerPass: {
        init: function(compiler) {
            
        }
    },
    init: function() {
        return {};
    }
};
````

Compiler passes are declared on the *definition* and they too have an *init* function. This function
**is called before the service is instantiated; before the service _init_ function is called**. 
Compiler pass *init* function accepts the *compiler* instance. This compiler is the same compiler that Gabriela
uses in its internals to create and resolve services but you **cannot** resolve (compile) services in a compiler
pass, only add them to the compiler. 

This is the interface of Gabrielas compiler: 

**Compiler::add(definition: object)**<br/>
Adds a definition to the compiler. This is the same as declaring a definition on a module with 
the *dependencies* array. 

**Compiler::has(name: string): boolean**</br>
Checks if a definition with *name* exists

**Compiler::isResolved(name: string): boolean**<br/>
Checks if a definition is already resolved into a service. 

You can use these methods to add more definitions to the compiler that can be resolved later on in your modules.

````javascript
const basicDefinition = {
    name: 'basicDefinition',
    compilerPass: {
        init: function(compiler) {
            const dynamicDefinition = {
                name: 'dynamicDefinition',
                init: function() {
                    return {};
                }
            }
            
            compiler.add(dynamicDefinition);
        }
    },
    init: function() {
        return {};
    }
};
````

Compiler passes also accept a *config* argument with which you can configure your services. If you remember,
Gabriela *asProcess* and *asServer* methods accept a *config* object literal. That object can be passed
to a compiler pass to create a service based on that config.

````javascript
const gabriela = require('gabriela');

const app = gabriela.asServer({
    config: {
        validation: {
            email: {
                type: String,
                domains: ['com', 'org'],
            }
        }
    }
});

const declaringDefinition = {
    compilerPass: {
        init: function(config, compiler) {
            // this is the validation property from Gabriela::asServer() above
            const validation = config.validation;
            
            // if this property exists, create an 'emailValidator' service
            if (validation.email) {
                const emailValidatorDefinition = {
                    name: 'emailValidator',
                    scope: 'public',
                    init: function() {
                        function EmailValidator(emailConstraints) {
                            // use email config here
                        }
                        
                        // EmailValidator receives email constraints from config
                        return new EmailValidator(validation.email);
                    }
                }
                
                compiler.add(emailValidatorDefinition);
            }
        }
    }
}
````

Here, we create an *EmailValidator* only if config has an email validation constraint. If it doesn't,
there is no need to create it. *emailValidator*s visibility scope is *public* so you can use it anywhere in
your application. To recap, declaring services with compiler passes is the same as declaring within a module with
*dependencies* array but compiler passes offer us a way of declaring services on the fly based on our 
configuration. 

## 1.4 Events

As we said in the Primer, event system implements the [Mediator pattern](https://en.wikipedia.org/wiki/Mediator_pattern).
The mediator pattern defines how a set of objects should interact, and that is also how Gabriela implements it, but it is also used
to send out events that are important to your application so you can react to them.

There are two types of events: **mediator** event and **emitter** event. The only difference between the two
is that **emitter** events are asynchronous. In that regard, they are kind of an asynchronous job
queue with which you can send events that you don't want to wait for.

### 1.4.1 Using events in modules
Lets take a look at a basic example.

````javascript
const userServiceDefinition = {
    name: 'userService',
    init: function() {
        function UserService() {
            this.saveUser = function(user) {
                // your own logic for saving users
            }
        }
        
        return new UserService();
    }
};

const userRegistrationModule = {
    name: 'userRegistration',
    dependencies: [userServiceDefinition],
    mediator: {
        onUserCreated: function(user) {
            // you can do something when the user is created
        }
    },
    moduleLogic: [function(state, userService) {
        const user = state.user;
        
        userService.saveUser(user);
       
        this.mediator.emit('onUserCreated', {
            user: user
        });
    }]
};
````

The event is registered with the *mediator* property on the module definition. Every property on the
*mediator* object is the name of the event you emit. In our example above, that event is *onUserCreated*.
After emit is sent, *mediator.onUserCreated* function is executed. *onUserCreated* receives a custom *user* argument
from the *emit* function. You can use this mechanism to pass your custom arguments to the event function.

___
**On custom arguments**
>Custom arguments are resolved as a key/value pair where the key is the name of the argument and the value is its value. 
In our example, the key value pair is *user* -> *user*. You can also inject anything you want in it

````javascript
this.mediator.emit('onSomeEvent', {
    value1: 'value1',
    value2: 'value2',
});
````

>In an event function, this would resolve like this

````javascript
onSomeEvent: function(value1, value2) {
    
}
````

>The order of the arguments is not important and you can mix it with already declared services

````javascript
onSomeEvent: function(value2, userService, value1) {
    
}
````
___

You can also inject your services that you declared with the dependency injection system just like you would
with modules.

````javascript
const userServiceDefinition = {
    name: 'userService',
    init: function() {
        function UserService() {
            this.saveUser = function(user) {
                // your own logic for saving users
            }
        }
        
        return new UserService();
    }
};

const userRegistrationModule = {
    name: 'userRegistration',
    dependencies: [userServiceDefinition],
    mediator: {
        onUserCreated: function(user, userService) {
            // you can do something when the user is created
        }
    },
    moduleLogic: [function(state, userService) {
        const user = state.user;
        
        userService.saveUser(user);
       
        this.mediator.emit('onUserCreated', {
            user: user
        });
    }]
};
````

This example is the same as the previous one but we injected the *UserService* into 
*onUserCreated* mediator event as we did in the *moduleLogic* middleware block function.
They work in the same way. The order of arguments is not important. You can switch them however
you like and it will still work.

*emitting* an event is the same as emitting with a mediator, only you don't use the *mediator* object
but the *emitter* object. The same rules apply for *emitter* as for the *mediator*.

````javascript
const userServiceDefinition = {
    name: 'userService',
    init: function() {
        function UserService() {
            this.saveUser = function(user) {
                // your own logic for saving users
            }
        }
        
        return new UserService();
    }
};

const userRegistrationModule = {
    name: 'userRegistration',
    dependencies: [userServiceDefinition],
    mediator: {
        onUserCreated: function(user, userService) {
            // you can do something when the user is created
        }
    },
    moduleLogic: [function(state, userService) {
        const user = state.user;
        
        userService.saveUser(user);
        
        this.emitter.emit('onUserCreated', {
            user: user
        });
    }]
};
````

Notice that we only changed *mediator* to *emitter* and it works. The only difference is that
*emitter* emits events asynchronously and the code after *emit* is executed right after. In other words,
*emitted* events are sent to the event queue whiled *mediator* events are not and are executed
synchronously.

### 1.4.2 Using events in plugins

Plugins use the same syntax as modules. You use the *mediator* property to declare events and catch them
when they are emitted in modules.

````javascript
const myModule = {
    name: 'myModule',
    moduleLogic: [function() {
        this.mediator.emit('onEvent');
    }],
};

const myPlugin = {
    name: 'myPlugin',
    mediator: {
        onEvent: function() {
            
        }
    }
};
````

*onEvent* is not declared on *myModule* but on *myPlugin*, therefor, *myPlugin* *onEvent* is called. You can use this
to control events of modules that are part of a single plugin. 

If you had declared *onEvent* both on the module level and plugin level, module *onEvent* would take precendence.

````javascript
const myModule = {
    name: 'myModule',
    mediator: {
        onEvent: function() {
            // module 'onEvent' takes precendence
        }
    },
    moduleLogic: [function() {
        this.mediator.emit('onEvent');
    }],
};

const myPlugin = {
    name: 'myPlugin',
    mediator: {
        onEvent: function() {
            // this 'onEvent' function is never called
        }
    }
};
````

You can use the third argument of *Mediator::emit()* to propagate the event to both functions.

````javascript
const myModule = {
    name: 'myModule',
    mediator: {
        onEvent: function() {
            // module 'onEvent' is called and execution proceeds to plugins
            // 'onEvent'
        }
    },
    moduleLogic: [function() {
        // we put 'null' as the second argument since that argument 
        // is what we use when we want to inject custom arguments into
        // the event function. The third argument is what tells the 
        // mediator whether to propagate the event to the module and the plugin
        this.mediator.emit('onEvent', null, true);
    }],
};

const myPlugin = {
    name: 'myPlugin',
    mediator: {
        onEvent: function() {
            // after module 'onEvent' is called, 'myPlugin' 'onEvent' is called
        }
    }
};
````

If you use event propagation, both module and plugin events are called. First the event declared on the
module level and then the event on the plugin level. Please note that for event propagation to work, the ony
thing you have to do is supply the *emit* functions third argument to *true*.

___
#### **Important note: On dependency injection...**
>Dependency injection in events works differently on the plugin level. On the plugin
level, you can only inject dependencies that are not defined with *module* visibility scope.
Every other scope will work in events declared on a plugin. Of course, if you use *shared* scope,
the plugin has to be declared to be within that shared scope.
___

### 1.4.3 Built in events

Gabriela has some built in events that can help you in your development flow. Those
include ones on the module, plugin and global events.

#### Module events

There are 2 module events: **onModuleStarted** and **onModuleFinished**. Both are declared
on the *mediator* key of your module declaration.

````javascript
const myModule = {
    name: 'myModule',
    mediator: {
        onModuleStarted() {
            
        },
        onModuleFinished() {
            
        }
    }
};
````

Both events are fired only once. The first time *myModule* has started executing, *onModuleStarted*
will be fired. The first time *myModule* has finished executing, *onModuleFinished* will be fired.

Both events accept injecting services with any dependency scope.

#### Plugin events

Plugin events work the same as module events, only they are called differently.

````javascript
const myModule = {
    name: 'myModule',
    mediator: {
        onModuleStarted() {
            
        },
        onModuleFinished() {
            
        }
    }
};

const myPlugin = {
    name: 'myPlugin',
    mediator: {
        onPluginStarted() {
            
        },
        onPluginFinished() {
            
        }
    },
    modules: [myModule],
}
````

In the same way as module events, **onPluginStarted** and **onPluginFinished** are executed only once.
The first time *myPlugin* is executed, *onPluginStarted* is fired. The first time *myPlugin* has finished
executing, *onPluginFinished* is fired.

Both events accept injecting services with any dependency injection scope except *module* scope since
plugins do not have access to services with *module* visibility scope.

#### **Side note: On built-in events**
>Don't forget that *onModuleStarted*, *onModuleFinished*, *onPluginStarted* and *onPluginFinished*
are all executed only once, when module or plugin start and finish executing for the first time.

#### **Side note: On dependency injection**
>Dependency injection works the same way for built-in events as in any other Gabriela component except
that plugin events do not accept injecting services with *module* visibility scope.

#### Global events

There are two global events in Gabriela: **onAppStarted** and **catchError**. Both are declared
when creating an app with *asProcess* or *asServer*.

````javascript
const gabriela = require('gabriela');

const processApp = gabriela.asProcess({
    config: {},
    events: {
        onAppStarted () {
        },
        catchError(e) {
        }
    }
});

// or

const serverApp = gabriela.asProcess({
    config: {},
    events: {
        onAppStarted () {
        },
        catchError(e) {
        }
    }
});
````

For now, we will explain **onAppStarted**. **catchError** will be covered in chapter
*1.5 Error handling*. 

*onAppStarted* is fired only once, when all modules and plugins finish executing. It accepts
only services with *public* visibility scope. 

*onAppStarted* and *catchError* also have a special *gabriela* variable bound to *this*.
The only variable bound to this is *gabriela* object and it has only one method: **close**.

````javascript
const gabriela = require('gabriela');

const processApp = gabriela.asProcess({
    config: {},
    events: {
        onAppStarted () {
            this.gabriela.close();
        },
        catchError(e) {
        }
    }
});
````

The interface for this *gabriela* object bound to *this* is the same when you create gabriela
*asProcess* and *asServer*.

## 1.5 Error handling

Gabrielas error handling mechanism is controlled in two ways: by using the **throwException**
function and reacting to them by using mediator events, and by using the global **catchError** event that catches all native javascript errors.
Errors handled by Gabriela can be caught on the module level or plugin level or both.

### 1.5.1 Using events in modules

````javascript
const myModule = {
    name: 'myModule',
    mediator: {
        onError: function(err) {
            // err.message === 'Something bad happened'
        }
    },
    moduleLogic: [function(throwException) {
        throwException(new Error('Something bad happened'));
    }],
};
````

___
**Important note: The error object**
>When using *onError* event, *Error* object that is thrown must always be the first argument
to *onError*. You can call it whatever you like but it must be the first argument in this function.
___

*throwException* is the same as *next*, *skip* or *done* functions and can be injected almost anywhere. 
After you *throwException*, the *onError* event is called with the first argument being the error itself.

Notice that this is not the native javascript error handling since you do not throw an error but just create the
*Error* instance itself. If you used `throw new Error()`, *onError* would not be called. 

___
**Important note: On error handling**
>Try to use *throwException* instead of the native javascript, `throw new Error`. It allows you
to have fine grained control over how you handle your errors and is more flexible, both on the module
and plugin level
___

You can use the dependency injection mechanism in the *onError* event in the same way you use it anywhere else
with the sole exception that the error instance must be the first argument in this function. You can also use the
*next* function to control asynchronous code. 

````javascript
const service = {
    name: 'service',
    init: function() {
        return {};
    }
};

const myModule = {
    name: 'myModule',
    dependencies: [service],
    mediator: {
        onError: function(err, service, next) {
            service.asyncFn().then(() => {
                next();
            });
        }
    },
    moduleLogic: [function(throwException) {
        throwException(new Error('Something bad happened'));
    }],
};
````

### 1.5.2 Plugin error handling

Catching errors on the plugin level uses the same *onError* event but works a little differently.

If your module is within a plugin and you don't declare an *onError* event on a module but declare it
on the plugin, the plugin *onError* event will be called. You can understand it as a catch all mechanism
if you put your module within a plugin.

````javascript
const myModule = {
    name: 'myModule',
    moduleLogic: [function(throwException) {
        throwException(new Error('Something wrong happened'));
    }],
};

const myPlugin = {
    name: 'myPlugin',
    mediator: {
        onError(err) {
            // err::Error is thrown from 'myModule' module but caught here
        }
    },
    modules: [myModule],
};
````

*onError* is called within the plugins mediator but thrown on the module level. Any module that is part
of *myPlugin* can use this plugins *onError* event to catch all errors within that plugin. Note again that
this only works if you use *throwException* function. 

### 1.5.3 Global errors processing

#### Handling global error: asProcess()

When using Gabriela as a NodeJS process, a critical error that is not caught terminates the process.
This is very important because you might not want this default behaviour.

You can override this behaviour by using the *catchError* event that is raised if *onError* does not exist
either on the module or plugin level, or when an error is thrown with native javascript error handling i.e.
`throw new Error()` instead of using `throwException` function.

````javascript
const gabriela = require('gabriela');

gabriela.asProcess({
    config: {},
    events: {
        catchError(e) {
            
        }
    }
})
````

The first argument you declare in this function will always be the thrown error, whatever you call it.

*catchError* event will catch every error that is not handled by Gabrielas event system whether you used
*throwException* function or not. 

*catchError* has a *gabriela* instance that is bound to *this* so you can use it to terminate the process if necessary,
or continue execution.

`````javascript
catchError(e) {
    if (yourCondition) {
        // terminate the process
        this.gabriela.close();
    } else {
        // otherwise, continue running the app
    }
}
`````

#### Handling global errors: asServer()

Handling errors *asServer* is the same as handling errors *asProcess* and will
terminate the server if you don't override this default behaviour.

## 1.6 Configuration

As we said previously, Gabriela is still in alpha stage so configuration is a feature that I still don't know what to do with. 
As I said in the Primer, you have to add the initial configuration when creating Gabriela *asProcess* and *asServer*.

````javascript
const gabriela = require('gabriela');

const app = gabriela.asProcess({config: {}});

// or

const app = gabriela.asServer({config: {}});
````

Supplying `{config: {}}` is mandatory. For now, **anything** you put into `config` will 
be injected into compiler passes. This is the only place where config is injected and used.

This feature is still under development but you can use it however you like. In the future, there will
be multiple environments and setting up custom environments. There will also be support for the `.env` 
file to declare environment variables that could be used inside alongside configuration.

There will also be a *gabriela* command line utility that will be able to do much of the effort of
working with configuration for you.

Until then, use this feature only with compiler passes.

## 1.7 HTTP

We haven't talked about running and using Gabriela as a server. The reason for that is that Gabriela tries to
be decoupled from HTTP. The idea is for your modules and plugins to not know whether they are executed in a 
HTTP request. That road is still being paved but I hope I'm coming close.

Gabriela uses [restify](http://restify.com/docs/home/) so the request and response objects
from restify are the same in Gabriela.

So lets explore how to use Gabriela as a server.

### 1.7.1 Declaring an HTTP module

Declaring an HTTP module is the same as declaring a process module with the difference of adding
the **http** property.

````javascript
const gabriela = require('gabriela');

const httpModule = {
    name: 'httpModule',
    http: {
        route: {
            name: 'routeName',
            path: '/route-path',
            method: 'get',
        }
    },
    moduleLogic: [function() {
        console.log('Executed when you create a request to /route-path');
    }],
};

const app = gabriela.asServer({config: {}});

app.addModule(httpModule);

app.startApp();
````

It's simple as that. After you start the app, you can go to */route-path* and process your route.

### Special **http** argument

The question now is, how do we get the data from the request or send a response?

Just like the *state* argument, Gabriela has an **http** argument that can be injected
when Gabriela is executed in an HTTP context.

````javascript
const gabriela = require('gabriela');

const httpModule = {
    name: 'httpModule',
    http: {
        route: {
            name: 'routeName',
            path: '/route-path',
            method: 'get',
        }
    },
    moduleLogic: [function(http) {
        console.log(`Request arrived from ${http.req.href}`);
    }],
};

const app = gabriela.asServer({config: {}});

app.addModule(httpModule);

app.startApp();
````

This object contains two properties: **req** and **res** who correspond to the current request
and response. These are the same objects that you would use with restify.

### 1.7.3 Default response body

If you remember the chapter *1.1.1 Modules*, you can inject a *state* object to every middleware function
with which you can communicate between middleware functions.

This *state* object has a special meaning within an HTTP context. Every information that *state* object
holds is returned automatically as the response body. In our previous example, a json response (`application/json`) will
be returned with a body of an empty object `{}` since the *state* is set by default to be an empty object.

Let's try a different example from the real world where we will try to get a user by its `id`.

````javascript
const gabriela = require('gabriela');

const httpModule = {
    name: 'getUser',
    http: {
        route: {
            name: 'getUser',
            path: '/user/:id',
            method: 'get',
        }
    },
    // 'userService' is not part of Gabriela. It is only used here for brevity
    validators: [function(http, state, userService, next, throwException) {
        const id = http.req.params.id;
        userService.getUserById(id).then((err, user) => {
            if (err) return throwException(`User with id ${id} does not exist`);

            state.user = user;
            
            next();
        });
    }],
};

const app = gabriela.asServer({config: {}});

app.addModule(httpModule);

app.startApp();
````

We don't actually need any other middleware block like *moduleLogic* here because the value of *state* is 
automatically sent as the response body. Simple as that.

You can, of course, use the *restify* response object to send the response which will override
the default response sending mechanism.

````javascript
const gabriela = require('gabriela');

const httpModule = {
    name: 'getUser',
    http: {
        route: {
            name: 'getUser',
            path: '/user/:id',
            method: 'get',
        }
    },
    // 'userService' is not part of Gabriela. It is only used here for brevity
    validators: [function(http, state, userService, next, throwException) {
        const id = http.req.params.id;
        userService.getUserById(id).then((err, user) => {
            if (err) return throwException(`User with id ${id} does not exist`);

            state.user = user;
            
            // this will override the default mechanism of sending the 'state' object
            http.res.send(state);
        });
    }],
};

const app = gabriela.asServer({config: {}});

app.addModule(httpModule);

app.startApp();
````

We also only use the *validators* middleware block since we don't need any other but it would
be structurally more accurate to use the *moduleLogic* block to actually send a response.

````javascript
const gabriela = require('gabriela');

const httpModule = {
    name: 'getUser',
    http: {
        route: {
            name: 'getUser',
            path: '/user/:id',
            method: 'get',
        }
    },
    // 'userService' is not part of Gabriela. It is only used here for brevity
    validators: [function(http, state, userService, next, throwException) {
        const id = http.req.params.id;
        userService.getUserById(id).then((err, user) => {
            if (err) return throwException(`User with id ${id} does not exist`);

            state.user = user;
        });
    }],
    moduleLogic: [function(http, state) {
        // this will override the default mechanism of sending the 'state' object
        http.res.send(state);
    }]
};

const app = gabriela.asServer({config: {}});

app.addModule(httpModule);

app.startApp();
````

A good practice is to put what the code actually does in its own structural middleware block.

### 1.7.4 HTTP response events

When an HTTP response is sent, it triggers two built-in events: **onPreResponse** and **onPostResponse**.
As the name applies, *onPreResponse* is triggered before the response is sent and *onPostResponse* is 
triggered after the response is sent; after the `http.res.send()` is called.

````javascript
const gabriela = require('gabriela');

const httpModule = {
    name: 'getUser',
    mediator: {
        onPreResponse() {
            // act here before the response is sent
        },
        onPostResponse() {
            // act here after the response is sent
        }
    },
    http: {
        route: {
            name: 'getUser',
            path: '/user/:id',
            method: 'get',
        }
    },
    // 'userService' is not part of Gabriela. It is only used here for brevity
    validators: [function(http, state, userService, next, throwException) {
        const id = http.req.params.id;
        userService.getUserById(id).then((err, user) => {
            if (err) return throwException(`User with id ${id} does not exist`);

            state.user = user;
            
            // this will override the default mechanism of sending the 'state' object
            http.res.send(state);
        });
    }],
};

const app = gabriela.asServer({config: {}});

app.addModule(httpModule);

app.startApp();
````

You can also send the response in *onPreResponse* since it also accepts the *http* argument. If you choose to do that,
the default mechanism will also be overriden. If you already sent a response in any middleware
functions and try to send it in *onPreResponse*, **an error will be raised**.

### 1.7.5 On dependency injection

Dependency injection mechanism works the same way in an HTTP module as in a module
executed as a process. It also works in *onPreResponse* and *onPostResponse* events.
You also have access to *next* and *throwException* to control asynchronous code and 
handling errors, respectively.

# Tutorial 1 - Implementing MySQL plugin

To be created.

# Tutorial 2 - Implementing Spotify API

To be created.

# 2. Best practices

## 2.1 Declaring dependencies

For readability, it is always best to declare every dependency scope except, *module*
and *plugin*, within a single declaring module.

````javascript
const declaringModule = {
    name: 'declaringModule',
    dependencies: [publicDependency, sharedDependency]
};
````

This makes your code easily readable and you can quickly know where your *public* and *shared*
dependencies are declared.

## 2.2 Dynamic dependencies with compiler passes

Keep all of your compiler passes in this single module.

````javascript
const declaringModule = {
    compilerPass: {
        init: function(config, compiler) {
            // all your dynamic dependencies go here
        }
    },
    name: 'declaringModule',
    dependencies: [publicDependency, sharedDependency]
};
````

This way, all your dynamic dependencies will be created in one place where you can 
easily find them.

## 2.3 Structure

Always structure your middleware blocks with what makes sense for your code.
Put the validation logic into the *validators* block. If you need to create a model to work on
before anything else, create it in the *preLogicTransformers* block. If you need to do some
cleanup after you executed your modules logic, do it in *postLogicTransformers*. If you need
to secure your module before anything else, do it in the *security* block.

## 2.4 Wiring dependencies

Always try to declare every dependency with the *module* visibility scope and if your logic demands it,
upgrade it to *public* or some other scope. Kind of like in OOP where one always declares a property
on an object private by default and protected if required. This makes your modules more
reusable and decoupled from the rest of the application.

## 2.5 Using prefixes in third party plugins

If you need to create a reusable plugin, create a *prefix* config property to avoid
naming collisions when creating dynamic dependencies.

````javascript
// config.js

{
    config: {
        myPlugin: {
            prefix: uniqueName,
        }
    }
}

// declaring module with a compiler pass

const declaringModule = {
    compilerPass: {
        init: function(config, compiler) {
            const prefix = config.myPlugin.prefix;
            let name;
            
            if (prefix) {
                name = `${prefix}dependencyName`;
            } else {
                name = 'dependencyName';
            }
            
            const someDependencyDefinition = {
                name: name,
                init: function() {
                    
                }
            }
            
            compiler.add(someDependencyDefinition);
        }
    },
    name: 'declaringModule',
    dependencies: [publicDependency, sharedDependency]
};
````

`dependencyName` could be a name that you use to name one of your own service. If that is the case, this third party
plugin gives you the possibility to name his dependencies with value of the *prefix*
property in front of it.

# 3. Case studies
## 3.1 Decoupling from HTTP
## 3.2 Implementing layered architecture
## 3.3 Dynamically creating configurable DI services
## 3.4 Creating third party plugins
