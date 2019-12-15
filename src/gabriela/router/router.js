const Validator = require('./../misc/validator');
const {hasKey} = require('./../util/util');

function _isBaseRoute(route) {
    const keys = Object.keys(route);
    const baseRouteKeys = ['name', 'routes', 'basePath'];

    let matches = 0;
    for (const key of baseRouteKeys) {
        if (keys.includes(key)) matches++;
    }

    return matches === 3;
}

function _isRegularRoute(route) {
    const keys = Object.keys(route);
    const baseRouteKeys = ['name', 'path', 'method'];

    let matches = 0;
    for (const key of baseRouteKeys) {
        if (keys.includes(key)) matches++;
    }

    return matches === 3;
}

function _treeTraversal(routes, constructedRoutes, parents = []) {
    for (const route of routes) {
        if (_isBaseRoute(route)) {
            Validator.validateBaseRoute(route);

            const parent = [...parents];

            parent.push({name: route.name, path: route.basePath});

            _treeTraversal(route.routes, constructedRoutes, parent);
        } else if (_isRegularRoute(route)) {
            Validator.validateRegularRoute(route);

            const routeData = _createRouteData(route, parents);

            constructedRoutes[routeData.name] = routeData;
        } else {
            throw new Error(`Invalid route. Route type could not be recognized.`);
        }
    }
}

function _createRouteData(route, parents) {
    let path = '';
    let parentName = '';

    for (const parent of parents) {
        parentName += parent.name + '.';
        path += parent.path;
    }

    return {
        name: parentName + route.name,
        path: path + route.path,
        method: route.method,
    }
}

function factory() {
    let internalRoutes = {};

    function injectRoutes(routes) {
        _treeTraversal(routes, internalRoutes);
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
