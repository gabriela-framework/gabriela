const peter = peterFactory();

peter.addPlugin(userManagmentPlugin);
peter.addPlugin(mongoPlugin);

peter.overridePlugin({
    name: 'somePlugin',
    jobs: []
})

const job = new job(metadata);

const dependencyContainer = new Container();

dependencyContainer.add('depName', new departFocus());

const jobDesc = new jobDesc({
    transformers: function(transformers) {

    }
});

const plugin = {
    jobs: [
        {
            name: 'jobName',
            model: {},
            jobs: [],
        },
        {
            name: 'someOtherJob',
        }
    ],
    name: 'somePlugin'
};

const overridenPlugin = {
    jobs: [
        {
            name: 'jobName',
        }
    ]
}

module.exports = {
    name: '',
    transformers: [],
    validators: [],
    execute: [],
}