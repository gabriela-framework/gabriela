const gabriela = require('./src/index');
const requestPromise = require('request-promise');
const path = require('path');

const g = gabriela.asServer({
    events: {
        onAppStarted() {
            throw new Error('Something went wrong');
        },
        catchError(err) {
            console.log(err.message);

            this.gabriela.close();
        }
    }
});

g.startApp();
