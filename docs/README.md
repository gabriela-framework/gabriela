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

## 1.2 Dependency injection

Dependency injection is the central component of Gabriela and it makes her a closed system. In order
to create a dependency injection service, you first have to create a DI `definition`. With that definition,
Gabriela will create your service and inject it where ever you need.

Dependency injection is **scoped**. There are 3 scopes: 

- **visibility scope**
- **shared scope**
- and **private scope**

We will first examine the anatomy of a *definition* and then dwelve into scopes.

## DI definition

A *definition*, in its basic form, consists of a *name* and a *init* function that is a factory
for our service. This function has to return an object of some kind, be it a function object
or a object literal.

````javascript
const basicDefinition = {
    name: 'basicDefinition',
    init: function() {
        return {};
    }
};
````

The `name` property determines the argument name when this service is injected. 

````javascript
const myModule = {
    name: 'myModule',
    dependencies: [basicDefinition],
    /**
    * As you can see, the value of the 'name' property in the DI definition is
    * the name of the argument that will hold the return value of the 'init' function
    */
    moduleLogic: [function(basicDefinition) {
        
    }],
}
````

## 1.3 Events

## 1.4 Plugins

## 1.5 Configuration

# Tutorial 1 - Implementing MySQL plugin

# Tutorial 2 - Implementing Spotify API

# 2. Best practices

# 3. Case studies
## 3.1 Implementing layered architecture
## 3.2 Creating third party plugins
