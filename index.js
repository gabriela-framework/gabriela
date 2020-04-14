const gabriela = require('./src/index');

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

const app = gabriela.asProcess();

app.addModule(myModule);

app.startApp();