const gabriela = require('./src/index');

const g = gabriela.asServer({
    config: {
        framework: {},
    }
}, [], {
    events: {
        onAppStarted() {
            this.gabriela.close();
        },
        onExit() {
            done();
        }
    }
});

g.startApp();
