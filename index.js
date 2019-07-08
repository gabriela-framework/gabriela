const gabriela = require('./gabriela/gabriela');

const mdl = {
    name: 'httpModule',
    http: {
        route: {
            name: 'index',
            path: '/',
            method: 'get',
            preRequest(http) {

            },
            preResponse(state) {

            },
            postResponse() {

            }
        }
    },
    moduleLogic: [function(state) {
        state.response = 'string';
    }],
};

const g = gabriela.asServer();

g.addModule(mdl);

function fn(someArg, second) {
    console.log(someArg);
    console.log(second);
}

const context = {
    obj: {},
};

const bound = fn.bind(null, {});

bound.call(null, null);
