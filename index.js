const gabriela = require('./src/index');
const requestPromise = require('request-promise');

const userService = {
    name: 'UserService',
    init: function(UserRepository) {
        return {};
    }
};

const initDefinition = {
    name: 'init',
    compilerPass: {
        init: function(config, compiler) {
            const def = this.definitionBuilder
                .addName('UserRepository')
                .addScope('public')
                .addInit(function(throwException) {
                    return throwException(new Error('Error in UserRepository'));
                })
                .build();

            compiler.add(def);
        }
    },
    init: function() {
        return {};
    }
};

const initModule = {
    name: 'initModule',
    dependencies: [initDefinition]
};

const workingModule = {
    name: 'workingModule',
    dependencies: [userService],
    moduleLogic: [function(UserService) {
    }],
};

const app = gabriela.asServer({config: {framework: {}}}, {
    events: {
        catchError(e) {

            this.gabriela.close();
        }
    }
});

app.addModule(initModule);
app.addModule(workingModule);

app.startApp();