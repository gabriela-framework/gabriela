const gabriela = require('./src/gabriela/gabriela');

const handlingMiddlewareBlockModule = {
    name: 'helloWorld',
    security: [function(done) {
        return done();
        console.log(`'security' block is executed`)
    }],
    validators: [function() {
        console.log(`'validators' block is executed`)
    }],
    preLogicTransformers: [function(state, skip) {
        if (true) {
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

const app = gabriela.asProcess({
    config: {},
});

app.addModule(handlingMiddlewareBlockModule);

app.startApp();