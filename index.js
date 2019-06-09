const gabriela = require('./gabriela/gabriela');

const mdl = {};

const server = gabriela.asServer();

server.addModule(mdl);

server.runServer();