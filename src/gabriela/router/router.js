const Validator = require('./../misc/validator');
const {hasKey} = require('./../util/util');

function makeObjectOfRoutes(routes) {
    const routesObject = {};

    for (const route of routes) {
        routesObject[route.name] = route;
    }

    return routesObject;
}

function factory() {
    let internalRoutes = null;

    function injectRoutes(routes) {
        if (routes) {
            Validator.validateRoutes(routes);

            internalRoutes = makeObjectOfRoutes(routes);
        }
    }

    function get(name) {
        if (!has(name)) throw new Error(`Route with name '${name}' not found`);

        return internalRoutes[name];
    }

    function has(name) {
        return hasKey(internalRoutes, name);
    }

    this.injectRoutes = injectRoutes;
    this.get = get;
    this.has = has;
}

module.exports = new factory();