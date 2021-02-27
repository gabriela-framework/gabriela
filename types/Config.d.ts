declare function asServer(config?: HttpConfiguration): any;
declare function asProcess(config?: ProcessConfiguration): any;

interface HttpConfiguration {
    framework?: FrameworkConfig;
    events?: AppEvents;
    plugins?: object;
    server?: ServerConfig;
    routes?: any;
}

interface ProcessConfiguration {
    framework?: FrameworkConfig;
    events?: AppEvents;
    plugins?: object;
}

type FrameworkEnvType = string | 'dev';

interface FrameworkConfig {
    env?: FrameworkEnvType;
    performance?: Performance;
    loggingEnabled?: boolean;
}

interface AppEvents {
    onAppStarted(fn: () => void): void;
    catchError(err: Error): void;
    onPostResponse(): void;
    onPreResponse(): void;
}

type MemoryWarningLimitType = number | 50;

interface Performance {
    memoryWarningLimit: MemoryWarningLimitType;
}

type ServerHostType = string | '127.0.0.1';
type ServerPortType = string | 3000;

interface ServerConfig {
    host?: ServerHostType;
    port?: ServerPortType;
    viewEngine?: ViewEngineConfig
    expressMiddleware: any[]
}

interface ViewEngineConfig {
    view: string;
    ['view engine']: string;
    engine: object;
}