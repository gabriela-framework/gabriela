class Names {
    #names = [];

    static create() {
        return new Names();
    }

    add(name) {
        this.#names.push(name);
    }

    has(name) {
        return this.#names.includes(name);
    }

    addPluginModules(plugin) {
        if (!plugin.modules) return true;

        const modules = plugin.modules;

        for (const mdl of modules) {
            const name = `${plugin.name}.${mdl.name}`;

            if (this.has(name)) {
                return name;
            }

            this.add(name);
        }

        return true;
    }
}

module.exports = Names;
