const gabriela = require('./src/index');
const router = require('./src/gabriela/router/router');
const requestPromise = require('request-promise');

const serverAppWithConfig = gabriela.asServer({config: {framework: {}}}, []);

serverAppWithConfig.startApp();
