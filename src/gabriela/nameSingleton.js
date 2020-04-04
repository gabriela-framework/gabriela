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

    addAndReplacePluginNames(plugin) {
        this.add(plugin.name);

        if (!plugin.modules) return true;

        const modules = plugin.modules;

        for (const mdl of modules) {
            const name = `${plugin.name}.${mdl.name}`;

            if (this.has(name)) {
                return name;
            }

            mdl.name = name;

            this.add(name);
        }

        return true;
    }
}

module.exports = Names;
