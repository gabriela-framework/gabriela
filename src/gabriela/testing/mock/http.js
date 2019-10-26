function factory(app, module) {
    async function get() {
        app.addModule(module);

        const response = await app.startApp();

        return response;
    }

    function post() {

    }

    this.get = get;
    this.post = post;
}

module.exports = factory;