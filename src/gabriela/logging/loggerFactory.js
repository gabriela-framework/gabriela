const DevLogger = require('./devLogger');
const ProdLogger = require('./prodLogger');

const {ENV} = require('../misc/types');

function create(config) {
    switch (config.config.framework.env) {
        case ENV.DEVELOPMENT: return DevLogger;
        case ENV.PRODUCTION: return ProdLogger;
        default: throw new Error(`Internal Gabriela error. Cannot create logger from config`);
    }
}

function factory() {}

factory.create = create;

module.exports = factory;

