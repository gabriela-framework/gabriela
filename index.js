const gabriela = require('./src/index');
const requestPromise = require('request-promise');
const path = require('path');

const searchServiceInit = {
    name: 'searchService',
    init: function(userRepository) {
        return () => {};
    }
};

const sortServiceInit = {
    name: 'sortService',
    init: function(userRepository) {
        return () => {};
    }
};

const landingPageServiceInit = {
    name: 'landingPage',
    init: function(userRepository) {
        return () => {};
    }
};

const userRepositoryInit = {
    name: 'userRepository',
    init: function() {
        return () => {};
    },
    shared: {
        modules: ['module']
    }
};

const m = gabriela.asProcess({
    events: {
        catchError(err) {
            console.error(err);
        }
    }
});

m.addModule({
    name: 'module',
    dependencies: [searchServiceInit, sortServiceInit, userRepositoryInit, landingPageServiceInit],
    moduleLogic: [function(sortService, next) {
        next();
    }],
});

m.addModule({
    name: 'anotherModule',
    dependencies: [searchServiceInit, sortServiceInit, userRepositoryInit, landingPageServiceInit],
    moduleLogic: [function(sortService, next) {
        next();
    }],
});

m.startApp();
