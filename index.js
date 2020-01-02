const gabriela = require('./src/index');
const router = require('./src/gabriela/router/router');

let init1 = false;
let init2 = false;
let init3 = false;

let ml1 = false;
let ml2 = false;
let ml3 = false;
let ml4 = false;

const mdl = {
    name: 'mdl',
    init: [function() {
        init1 = true;
    }, {
        name: 'initfn1',
        middleware(done) {
            setTimeout(() => {
                done();
            }, 5000);
        }
    }, {
        name: 'initfn2',
        middleware: function() {
            init3 = true;
        }
    }],
    moduleLogic: [
        async function() {
            ml1 = true;
        },
        {
            name: 'ml1',
            async middleware(done) {
                setTimeout(() => {
                    done();
                });
            }
        },
        {
            name: 'ml2',
            middleware: async function() {
                ml3 = true;
            }
        },
        {
            name: 'ml3',
            middleware() {
                ml4 = true;
            }
        }
    ]
};

const g = gabriela.asServer({
    config: {
        server: {
            port: 4000,
        },
        framework: {},
    }
}, [], {
    events: {
        onAppStarted: function() {
            this.gabriela.close();
        }
    }
});

g.addModule(mdl);

g.startApp();
