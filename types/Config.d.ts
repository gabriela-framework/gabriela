declare function asServer(config?: HttpConfiguration): any;
declare function asProcess(config?: ProcessConfiguration): any;

declare interface HttpConfiguration {
    framework?: FrameworkConfig;
    events?: any;
    plugins?: object;
    server?: ServerConfig;
    routes?: any;
}

declare interface ProcessConfiguration {
    framework?: FrameworkConfig;
    events?: any;
    plugins?: object;
}

type FrameworkEnvType = string | 'dev';

declare interface FrameworkConfig {
    env?: FrameworkEnvType;
    performance?: Performance;
    loggingEnabled?: boolean;
}

type MemoryWarningLimitType = number | 50;

declare interface Performance {
    memoryWarningLimit: MemoryWarningLimitType;
}

type ServerHostType = string | '127.0.0.1';
type ServerPortType = string | 3000;

declare interface ServerConfig {
    host?: ServerHostType;
    port?: ServerPortType;
    viewEngine?: ViewEngineConfig
    expressMiddleware: any[]
}

declare interface ViewEngineConfig {
    view: string;
    ['view engine']: string;
    engine: object;
}