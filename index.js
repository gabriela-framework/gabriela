const gabriela = require('./gabriela/gabriela');

const module1 = {
    name: 'module1',
    moduleLogic: [function(next) {
        next();
    }],
};

const module2 = {
    name: 'module2',
    moduleLogic: [function(next) {
        next();
    }],
};

const g  = gabriela.asRunner().module;

g.addModule(module1);
g.addModule(module2);

g.run().then(() => {
    console.log('stoka');
});

