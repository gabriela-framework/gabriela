const gabriela = require('./src/index');

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
            name: 'worldModuleLogic',
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
    config: {
        framework: {}
    }
});

app.addModule(helloWorldModule);

app.startApp();