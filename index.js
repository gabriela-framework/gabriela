const gabriela = require('./src/index');

const g = gabriela.asProcess({
    config: {framework: {}}
});

const mdl = {
    name: 'module',
    mediator: {
        onEvent() {

        }
    },
    moduleLogic: [function() {
        this.mediator.emit('onEvent');
    }],
};

g.addModule(mdl);

g.startApp();

