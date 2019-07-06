const mdl = {
    name: 'httpModule',
    http: {
        route: {
            name: 'index',
            path: '/',
            preRequest(http) {

            },
            preResponse(http) {

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

g.startApp();