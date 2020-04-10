const gabriela = require('./src/index');

const handlingMiddlewareBlockModule = {
    name: 'helloWorld',
    validators: [function(state) {
        state.someCondition = true;

        console.log(`'validators' block is executed`)
    }],
    security: [function(done) {
        return done();

        console.log(`'security' block is executed`)
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

const app = gabriela.asProcess();

app.addModule(handlingMiddlewareBlockModule);

app.startApp();