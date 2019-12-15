const Validator = require('./../misc/validator');
const {hasKey} = require('./../util/util');

function isBaseRoute(route) {
    const keys = Object.keys(route);
    const baseRouteKeys = ['name', 'routes', 'basePath'];

    let matches = 0;
    for (const key of baseRouteKeys) {
        if (keys.includes(key)) matches++;
    }

    return matches === 3;
}

function treeTraversal(routes, constructedRoutes, parents = []) {
    for (const route of routes) {
        if (isBaseRoute(route)) {
            const parent = [...parents];

            parent.push({name: route.name, path: route.basePath});

            treeTraversal(route.routes, constructedRoutes, parent);
        } else {
            const routeData = createRouteData(route, parents);

            constructedRoutes[routeData.name] = routeData;
        }
    }
}

function createRouteData(route, parents) {
    let path = '';
    let parentName = '';

    for (const parent of parents) {
        parentName += parent.name + '.';
        path += parent.path;
    }

    return {
        name: parentName + route.name,
        path: path + route.path,
        methods: route.methods,
    }
}

function factory() {
    let internalRoutes = {};

    function injectRoutes(routes) {
        treeTraversal(routes, internalRoutes);
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
