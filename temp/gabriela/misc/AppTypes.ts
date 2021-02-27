import {IIterator} from "../util/Util";

function _proxifyType(obj: IIterator) {
    const handlers: ProxyHandler<IIterator> = {
        set(obj: IIterator, prop: PropertyKey) {
            throw new Error(`Invalid constant type usage. Trying to change property '${String(prop)}' on a constant type`);
        }
    };

    return new Proxy(obj, handlers);
}

class VisibilityTypes extends IIterator {
    readonly PUBLIC = 'public';
    readonly MODULE = 'module';
    readonly PLUGIN = 'plugin';
}

class InjectionTypes extends IIterator {
    readonly PROPERTY = 'property';
    readonly CONSTRUCTOR = 'constructor';
    readonly METHOD = 'method';

}

class MiddlewareTypes extends IIterator {
    readonly INIT = 'init';
    readonly SECURITY = 'security';
    readonly PRE_LOGIC_TRANSFORMERS = 'preLogicTransformers';
    readonly VALIDATORS = 'validators';
    readonly MODULE_LOGIC = 'moduleLogic';
    readonly POST_LOGIC_TRANSFORMERS = 'postLogicTransformers';
}

class AsyncFlowTypes extends IIterator {
    readonly NEXT = 'next';
    readonly DONE = 'done';
    readonly SKIP = 'skip';
    readonly THROW_EXCEPTION = 'throwException';
}

class BuiltInMediators extends IIterator {
    readonly ON_MODULE_STARTED = 'onModuleStarted';
    readonly ON_MODULE_FINISHED = 'onModuleFinished';
    readonly ON_PLUGIN_STARTED = 'onPluginStarted';
    readonly ON_PLUGIN_FINISHED = 'onPluginFinished';
    readonly ON_ERROR = 'onError';
}

class HttpMethods extends IIterator {
    readonly GET = 'get';
    readonly PUT = 'put';
    readonly POST = 'post';
    readonly PATCH = 'patch';
    readonly DELETE = 'delete';
    readonly HEAD = 'head';
    readonly OPTIONS = 'options';
}

class MandatoryRouteProps extends IIterator {
    readonly NAME = 'name';
    readonly PATH = 'path';
    readonly METHOD = 'method';
}

class GabrielaEvents extends IIterator {
    readonly ON_APP_STARTED = 'onAppStarted';
    readonly ON_CATCH_ERROR = 'catchError';
    readonly ON_EXIT = 'onExit';
}

class HttpEvents extends IIterator {
    readonly ON_PRE_RESPONSE = 'onPreResponse';
    readonly ON_POST_RESPONSE = 'onPostResponse';
}

class EnvTypes extends IIterator{
    readonly DEVELOPMENT = 'dev';
    readonly PRODUCTION = 'prod';
}

export const MIDDLEWARE_TYPES = Object.freeze(_proxifyType(new MiddlewareTypes()));
export const BUILT_IN_MEDIATORS = Object.freeze(_proxifyType(new BuiltInMediators()));
export const ASYNC_FLOW_TYPES = Object.freeze(_proxifyType(new AsyncFlowTypes()));
export const HTTP_METHODS = Object.freeze(_proxifyType(new HttpMethods()));
export const MANDATORY_ROUTE_PROPS = Object.freeze(_proxifyType(new MandatoryRouteProps()));
export const GABRIELA_EVENTS = Object.freeze(_proxifyType(new GabrielaEvents())) as GabrielaEvents;
export const HTTP_EVENTS = Object.freeze(_proxifyType(new HttpEvents())) as HttpEvents;
export const ENV = Object.freeze(_proxifyType(new EnvTypes()));
export const INJECTION_TYPES = Object.freeze(_proxifyType(new InjectionTypes()));
export const VISIBILITY_TYPES = Object.freeze(_proxifyType(new VisibilityTypes()))
