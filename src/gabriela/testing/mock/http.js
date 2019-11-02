function factory(app, mdl) {
    async function get() {
        app.addModule(mdl);

        const response = await app.startApp();

        return response;
    }

    function post() {

    }

    this.get = get;
    this.post = post;
}

module.exports = factory;