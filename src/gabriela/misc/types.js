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
    constructor() {
        super();

        this.SECURITY = 'security';
        this.PRE_LOGIC_TRANSFORMERS = 'preLogicTransformers';
        this.VALIDATORS = 'validators';
        this.MODULE_LOGIC = 'moduleLogic';
        this.POST_LOGIC_TRANSFORMERS = 'postLogicTransformers';
    }
}

class AsyncFlowTypes extends IIterator {
    constructor() {
        super();

        this.NEXT = 'next';
        this.DONE = 'done';
        this.SKIP = 'skip';
        this.THROW_EXCEPTION = 'throwException';
    }
}

class BuiltInMediators extends IIterator {
    constructor() {
        super();

        this.ON_MODULE_STARTED = 'onModuleStarted';
        this.ON_MODULE_FINISHED = 'onModuleFinished';
        this.ON_PLUGIN_STARTED = 'onPluginStarted';
        this.ON_PLUGIN_FINISHED = 'onPluginFinished';
        this.ON_ERROR = 'onError';
    }
}

class HttpMethods extends IIterator {
    constructor() {
        super();

        this.GET = 'get';
        this.PUT = 'put';
        this.POST = 'post';
        this.PATCH = 'patch';
        this.DELETE = 'del';
        this.HEAD = 'head';
    }
}

class MandatoryRouteProps extends IIterator {
    constructor() {
        super();

        this.NAME = 'name';
        this.PATH = 'path';
        this.METHOD = 'method';
    }
}

class GabrielaEvents extends IIterator {
    constructor() {
        super();

        this.ON_APP_STARTED = 'onAppStarted';
        this.ON_CATCH_ERROR = 'catchError';
        this.ON_EXIT = 'onExit';
    }
}

class HttpEvents extends IIterator {
    constructor() {
        super();

        this.ON_PRE_RESPONSE = 'onPreResponse';
        this.ON_POST_RESPONSE = 'onPostResponse';
    }
}

class EnvTypes extends IIterator{
    constructor() {
        super();

        this.DEVELOPMENT = 'dev';
        this.PRODUCTION = 'prod';
        this.TESTING = 'test';
    }
}

module.exports = Object.freeze({
    MIDDLEWARE_TYPES: Object.freeze(_proxifyType(new MiddlewareTypes())),
    BUILT_IN_MEDIATORS: Object.freeze(_proxifyType(new BuiltInMediators())),
    ASYNC_FLOW_TYPES: Object.freeze(_proxifyType(new AsyncFlowTypes())),
    HTTP_METHODS: Object.freeze(_proxifyType(new HttpMethods())),
    MANDATORY_ROUTE_PROPS: Object.freeze(_proxifyType(new MandatoryRouteProps())),
    GABRIELA_EVENTS: Object.freeze(_proxifyType(new GabrielaEvents())),
    HTTP_EVENTS: Object.freeze(_proxifyType(new HttpEvents())),
    ENV: Object.freeze(_proxifyType(new EnvTypes())),
});