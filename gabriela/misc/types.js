function _proxifyType(obj) {
    const handlers = {
        set(obj, prop) {
            throw new Error(`Invalid constant type usage. Trying to change property '${prop}' on a constant type`);
        }
    };

    return new Proxy(obj, handlers);
}

class Base {
    *[Symbol.iterator]() {
        const entries = Object.values(this);

        for (const entry of entries) {
            yield entry;
        }
    };

    toArray() {
        return Object.values(this);
    }
}

class MiddlewareTypes extends Base {
    SECURITY = 'security';
    PRE_LOGIC_TRANSFORMERS = 'preLogicTransformers';
    VALIDATORS = 'validators';
    MODULE_LOGIC = 'moduleLogic';
    POST_LOGIC_TRANSFORMERS = 'postLogicTransformers';
}

class AsyncFlowTypes extends Base{
    NEXT = 'next';
    DONE = 'done';
    SKIP = 'skip';
    THROW_EXCEPTION = 'throwException';
}

class HttpMethods extends Base{
    GET = 'get';
    PUT = 'put';
    POST = 'post';
    PATCH = 'patch';
    DELETE = 'del';
    HEAD = 'head';
}

class MandatoryRouteProps extends Base{
    NAME = 'name';
    PATH = 'path';
    METHOD = 'method';
}

class GabrielaEvents extends Base {
    ON_APP_STARTED = 'onAppStarted';
    CATCH_ERROR = 'catchError';
}

module.exports = Object.freeze({
    MIDDLEWARE_TYPES: Object.freeze(_proxifyType(new MiddlewareTypes())),
    ASYNC_FLOW_TYPES: Object.freeze(_proxifyType(new AsyncFlowTypes())),
    HTTP_METHODS: Object.freeze(_proxifyType(new HttpMethods())),
    MANDATORY_ROUTE_PROPS: Object.freeze(_proxifyType(new MandatoryRouteProps())),
    GABRIELA_EVENTS: Object.freeze(_proxifyType(new GabrielaEvents())),
});