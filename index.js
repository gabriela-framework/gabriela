const gabriela = require('./src/index');

const myModule = {
    name: 'myModule',
    moduleLogic: [function() {
        this.mediator.emit('onExposedEvent', {
            data: {emittedString: 'myString'}
        });
    }],
};

const myPlugin = {
    name: 'myPlugin',
    exposedMediators: ['onExposedEvent'],
    // 'myModule' is not yet created but we will create it shortly
    modules: [myModule]
};

const reactingModule = {
    name: 'reactingModule',
    mediator: {
        onExposedEvent(data) {
            console.log(data);
        }
    }
};

const app = gabriela.asProcess();

app.addPlugin(myPlugin);
app.addModule(reactingModule);

app.startApp();