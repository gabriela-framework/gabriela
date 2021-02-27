var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var Validator = require('./../misc/validator');
var hasKey = require('./../util/util').hasKey;
function _isBaseRoute(route) {
    var keys = Object.keys(route);
    var baseRouteKeys = ['name', 'routes', 'basePath'];
    var matches = 0;
    for (var _i = 0, baseRouteKeys_1 = baseRouteKeys; _i < baseRouteKeys_1.length; _i++) {
        var key = baseRouteKeys_1[_i];
        if (keys.includes(key))
            matches++;
    }
    return matches === 3;
}
function _isRegularRoute(route) {
    var keys = Object.keys(route);
    var baseRouteKeys = ['name', 'path', 'method'];
    var matches = 0;
    for (var _i = 0, baseRouteKeys_2 = baseRouteKeys; _i < baseRouteKeys_2.length; _i++) {
        var key = baseRouteKeys_2[_i];
        if (keys.includes(key))
            matches++;
    }
    return matches === 3;
}
function _treeTraversal(routes, constructedRoutes, parents) {
    if (parents === void 0) { parents = []; }
    for (var _i = 0, routes_1 = routes; _i < routes_1.length; _i++) {
        var route = routes_1[_i];
        if (_isBaseRoute(route)) {
            Validator.validateBaseRoute(route);
            var parent_1 = __spreadArray([], parents);
            parent_1.push({ name: route.name, path: route.basePath });
            _treeTraversal(route.routes, constructedRoutes, parent_1);
        }
        else if (_isRegularRoute(route)) {
            Validator.validateRegularRoute(route);
            var routeData = _createRouteData(route, parents);
            constructedRoutes[routeData.name] = routeData;
        }
        else {
            throw new Error("Invalid route. Route type could not be recognized.");
        }
    }
}
function _createRouteData(route, parents) {
    var path = '';
    var parentName = '';
    for (var _i = 0, parents_1 = parents; _i < parents_1.length; _i++) {
        var parent_2 = parents_1[_i];
        parentName += parent_2.name + '.';
        path += parent_2.path;
    }
    var builtRoute = {
        name: parentName + route.name,
        path: path + route.path,
        method: route.method
    };
    if (hasKey(route, 'static')) {
        builtRoute.static = route.static;
    }
    return builtRoute;
}
function factory() {
    var internalRoutes = {};
    function injectRoutes(routes) {
        _treeTraversal(routes, internalRoutes);
    }
    function get(name) {
        if (!has(name))
            throw new Error("Route with name '" + name + "' not found");
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
//# sourceMappingURL=router.js.map