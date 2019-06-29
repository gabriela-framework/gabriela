const gabriela = require('./gabriela/gabriela');

const g = gabriela.asServer({
    server: {
        port: 4000,
    }
});

g.startApp();