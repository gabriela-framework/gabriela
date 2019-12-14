const gabriela = require('./src/index');

const mdl = {
    name: 'mdl',
    moduleLogic: [
        async function(throwException) {
            console.log('sdčfjasldfkjsf');
        }
    ]
};

const app = gabriela.asProcess({config: {framework: {}}});

app.addModule(mdl);

app.startApp();