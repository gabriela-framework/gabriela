const gabriela = require('./src/index');
const requestPromise = require('request-promise');

const userServiceInit = {
    name: 'userService',
    scope: 'module',
    isAsync: true,
    init: function(next) {
        function UserService() {
            this.addUser = null;
            this.removeUser = null;
        }

        requestPromise.get('https://www.facebook.com/').then(() => {
            next(() => {
                return new UserService();
            });
        });
    },
};

let entersMiddleware = false;
const mdl = {
    name: 'asyncModuleName',
    dependencies: [userServiceInit],
    preLogicTransformers: [function(userService) {
        entersMiddleware = true;
    }],
};

const g = gabriela.asProcess();

g.addModule(mdl);

g.runModule('asyncModuleName').then(() => {
});