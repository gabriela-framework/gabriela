const gabriela = require('./src/index');
const requestPromise = require('request-promise');
const path = require('path');

const m = gabriela.asProcess({
    events: {
        catchError(err) {
            console.log(err);
        }
    }
});

const sortServiceInit = {
    name: 'sortService',
    init: function(userRepository) {
        return () => {};
    },
    shared: {
        modules: ['module2'],
    },
};

const userRepositoryInit = {
    name: 'userRepository',
    init: function() {
        return () => {};
    },
    shared: {
        modules: ['module1'],
    },
};

const module1 = {
    name: 'module1',
};

const module2 = {
    name: 'module2',
    dependencies: [sortServiceInit, userRepositoryInit],
    moduleLogic: [function(sortService, next) {
        next();
    }],
};

m.addModule(module1);
m.addModule(module2);

m.startApp();
