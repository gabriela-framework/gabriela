"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.VISIBILITY_TYPES = exports.INJECTION_TYPES = exports.ENV = exports.HTTP_EVENTS = exports.GABRIELA_EVENTS = exports.MANDATORY_ROUTE_PROPS = exports.HTTP_METHODS = exports.ASYNC_FLOW_TYPES = exports.BUILT_IN_MEDIATORS = exports.MIDDLEWARE_TYPES = void 0;
var Util_1 = require("../util/Util");
function _proxifyType(obj) {
    var handlers = {
        set: function (obj, prop) {
            throw new Error("Invalid constant type usage. Trying to change property '" + String(prop) + "' on a constant type");
        }
    };
    return new Proxy(obj, handlers);
}
var VisibilityTypes = (function (_super) {
    __extends(VisibilityTypes, _super);
    function VisibilityTypes() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.PUBLIC = 'public';
        _this.MODULE = 'module';
        _this.PLUGIN = 'plugin';
        return _this;
    }
    return VisibilityTypes;
}(Util_1.IIterator));
var InjectionTypes = (function (_super) {
    __extends(InjectionTypes, _super);
    function InjectionTypes() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.PROPERTY = 'property';
        _this.CONSTRUCTOR = 'constructor';
        _this.METHOD = 'method';
        return _this;
    }
    return InjectionTypes;
}(Util_1.IIterator));
var MiddlewareTypes = (function (_super) {
    __extends(MiddlewareTypes, _super);
    function MiddlewareTypes() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.INIT = 'init';
        _this.SECURITY = 'security';
        _this.PRE_LOGIC_TRANSFORMERS = 'preLogicTransformers';
        _this.VALIDATORS = 'validators';
        _this.MODULE_LOGIC = 'moduleLogic';
        _this.POST_LOGIC_TRANSFORMERS = 'postLogicTransformers';
        return _this;
    }
    return MiddlewareTypes;
}(Util_1.IIterator));
var AsyncFlowTypes = (function (_super) {
    __extends(AsyncFlowTypes, _super);
    function AsyncFlowTypes() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.NEXT = 'next';
        _this.DONE = 'done';
        _this.SKIP = 'skip';
        _this.THROW_EXCEPTION = 'throwException';
        return _this;
    }
    return AsyncFlowTypes;
}(Util_1.IIterator));
var BuiltInMediators = (function (_super) {
    __extends(BuiltInMediators, _super);
    function BuiltInMediators() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ON_MODULE_STARTED = 'onModuleStarted';
        _this.ON_MODULE_FINISHED = 'onModuleFinished';
        _this.ON_PLUGIN_STARTED = 'onPluginStarted';
        _this.ON_PLUGIN_FINISHED = 'onPluginFinished';
        _this.ON_ERROR = 'onError';
        return _this;
    }
    return BuiltInMediators;
}(Util_1.IIterator));
var HttpMethods = (function (_super) {
    __extends(HttpMethods, _super);
    function HttpMethods() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.GET = 'get';
        _this.PUT = 'put';
        _this.POST = 'post';
        _this.PATCH = 'patch';
        _this.DELETE = 'delete';
        _this.HEAD = 'head';
        _this.OPTIONS = 'options';
        return _this;
    }
    return HttpMethods;
}(Util_1.IIterator));
var MandatoryRouteProps = (function (_super) {
    __extends(MandatoryRouteProps, _super);
    function MandatoryRouteProps() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.NAME = 'name';
        _this.PATH = 'path';
        _this.METHOD = 'method';
        return _this;
    }
    return MandatoryRouteProps;
}(Util_1.IIterator));
var GabrielaEvents = (function (_super) {
    __extends(GabrielaEvents, _super);
    function GabrielaEvents() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ON_APP_STARTED = 'onAppStarted';
        _this.ON_CATCH_ERROR = 'catchError';
        _this.ON_EXIT = 'onExit';
        return _this;
    }
    return GabrielaEvents;
}(Util_1.IIterator));
var HttpEvents = (function (_super) {
    __extends(HttpEvents, _super);
    function HttpEvents() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ON_PRE_RESPONSE = 'onPreResponse';
        _this.ON_POST_RESPONSE = 'onPostResponse';
        return _this;
    }
    return HttpEvents;
}(Util_1.IIterator));
var EnvTypes = (function (_super) {
    __extends(EnvTypes, _super);
    function EnvTypes() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.DEVELOPMENT = 'dev';
        _this.PRODUCTION = 'prod';
        return _this;
    }
    return EnvTypes;
}(Util_1.IIterator));
exports.MIDDLEWARE_TYPES = Object.freeze(_proxifyType(new MiddlewareTypes()));
exports.BUILT_IN_MEDIATORS = Object.freeze(_proxifyType(new BuiltInMediators()));
exports.ASYNC_FLOW_TYPES = Object.freeze(_proxifyType(new AsyncFlowTypes()));
exports.HTTP_METHODS = Object.freeze(_proxifyType(new HttpMethods()));
exports.MANDATORY_ROUTE_PROPS = Object.freeze(_proxifyType(new MandatoryRouteProps()));
exports.GABRIELA_EVENTS = Object.freeze(_proxifyType(new GabrielaEvents()));
exports.HTTP_EVENTS = Object.freeze(_proxifyType(new HttpEvents()));
exports.ENV = Object.freeze(_proxifyType(new EnvTypes()));
exports.INJECTION_TYPES = Object.freeze(_proxifyType(new InjectionTypes()));
exports.VISIBILITY_TYPES = Object.freeze(_proxifyType(new VisibilityTypes()));
//# sourceMappingURL=types.js.map