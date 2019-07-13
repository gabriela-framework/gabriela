const {IIterator} = require('../util/util');

function _proxifyType(obj) {
    const handlers = {
        set(obj, prop) {
            throw new Error(`Invalid constant type usage. Trying to change property '${prop}' on a constant type`);
        }
    };

    return new Proxy(obj, handlers);
}

class MiddlewareTypes extends IIterator {
    SECURITY = 'security';
    PRE_LOGIC_TRANSFORMERS = 'preLogicTransformers';
    VALIDATORS = 'validators';
    MODULE_LOGIC = 'moduleLogic';
    POST_LOGIC_TRANSFORMERS = 'postLogicTransformers';
}

class AsyncFlowTypes extends IIterator {
    NEXT = 'next';
    DONE = 'done';
    SKIP = 'skip';
    THROW_EXCEPTION = 'throwException';
}

class BuiltInMediators extends IIterator {
    ON_MODULE_STARTED = 'onModuleStarted';
    ON_MODULE_FINISHED = 'onModuleFinished';
    ON_PLUGIN_STARTED = 'onPluginStarted';
    ON_PLUGIN_FINISHED = 'onPluginFinished';
    ON_ERROR = 'onError';
}

class HttpMethods extends IIterator {
    GET = 'get';
    PUT = 'put';
    POST = 'post';
    PATCH = 'patch';
    DELETE = 'del';
    HEAD = 'head';
}

class MandatoryRouteProps extends IIterator {
    NAME = 'name';
    PATH = 'path';
    METHOD = 'method';
}

class GabrielaEvents extends IIterator {
    ON_APP_STARTED = 'onAppStarted';
    CATCH_ERROR = 'catchError';
}

module.exports = Object.freeze({
    MIDDLEWARE_TYPES: Object.freeze(_proxifyType(new MiddlewareTypes())),
    BUILT_IN_MEDIATORS: Object.freeze(_proxifyType(new BuiltInMediators())),
    ASYNC_FLOW_TYPES: Object.freeze(_proxifyType(new AsyncFlowTypes())),
    HTTP_METHODS: Object.freeze(_proxifyType(new HttpMethods())),
    MANDATORY_ROUTE_PROPS: Object.freeze(_proxifyType(new MandatoryRouteProps())),
    GABRIELA_EVENTS: Object.freeze(_proxifyType(new GabrielaEvents())),
});