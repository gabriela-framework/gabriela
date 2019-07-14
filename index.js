const gabriela = require('./gabriela/gabriela');

const g = gabriela.asServer({
    config: {}
}, {
    events: {
        onAppStarted() {
            throw new Error('Something went wrong');
        },
        catchError() {
            this.server.close();
        }
    }
});

g.startApp();