export function asServer(config?: HttpConfiguration): App;
export function asProcess(config?: ProcessConfiguration): App;

export declare interface HttpConfiguration {
    framework?: FrameworkConfig;
    events?: EventsConfig;
    plugins?: object;
    server?: ServerConfig;
    routes?: RoutesConfig;
}

export declare interface ProcessConfiguration {
    framework?: FrameworkConfig;
    events?: EventsConfig;
    plugins?: object;
}

export type FrameworkEnvType = string | 'dev';

export declare interface FrameworkConfig {
    env?: FrameworkEnvType;
    performance?: Performance;
    loggingEnabled?: boolean;
}

export type MemoryWarningLimitType = number | 50;

export declare interface Performance {
    memoryWarningLimit: MemoryWarningLimitType;
}

export type ServerHostType = string | '127.0.0.1';
export type ServerPortType = string | 3000;

export declare interface ServerConfig {
    host?: ServerHostType;
    port?: ServerPortType;
    viewEngine?: ViewEngineConfig
    expressMiddleware: any[]
}

export declare interface ViewEngineConfig {
    view: string;
    ['view engine']: string;
    engine: object;
}

export declare interface EventsConfig {
    onAppStarted(...object);
    catchError(Error, ...object)
}

export declare interface RoutesConfig {
    name: string;
    basePath: string;
    path: string;
    routes: RoutesConfig[],
}

export declare class App {
    addModule(module: IModule): void;
    getModule(name: string): IModule;
    removeModule(name: string): void;
    hasModule(name: string): boolean;
    getModules(): IModule[];

    addPlugin(plugin: IPlugin): void;
    getPlugin(name: string): IPlugin;
    removePlugin(name: string): void;
    hasPlugin(name: string): boolean;
    getPlugins(): IPlugin[];

    startApp(): void;
}

export type MiddlewareType = string | Function | IMiddlewareFunction | Promise<any>;

export interface IModule {
    name: string;
    route?: string;
    modelName?: string;
    mediator?: IMediator;
    init?: MiddlewareType;
    validation?: MiddlewareType;
    security?: MiddlewareType;
    preLogicTransformers?: MiddlewareType;
    moduleLogic?: MiddlewareType;
    postLogicTransformers?: MiddlewareType;
}

export interface IMiddlewareFunction {
    name: string;
    middleware: Function | Promise<any>
}

export interface IPlugin {
    name: string;
    modules?: IModule[];
    mediator?: IMediator;
    exposedMediators?: string[];
}

export interface IMediator {
    [name: string]: Function;
    onError(err: Error, ...args: any): void;
}
