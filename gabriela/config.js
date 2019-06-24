class Singleton {
    static create(config) {
        Singleton.config = config;

        Object.defineProperty(Singleton, 'config', {
            writable: false,
        });
    }

    static getProp(prop) {
        if (!Singleton.has(prop)) return undefined;

        return Singleton.config[prop];
    }

    static has(prop) {
        return Singleton.config.hasOwnProperty(prop);
    }
}

Singleton.config = null;

module.exports = Singleton;