const gabriela = require('./src/index');

const app = gabriela.asServer({
    routes: [
        {
            name: 'signUp',
            path: '/sign-up',
            method: 'POST',
        },
        {
            name: 'signIn',
            path: '/sign-in',
            method: 'POST',
        },
    ]
});

const signUpModule = {
    name: 'signUpModule',
    route: 'signUp',
    moduleLogic: [function() {
        console.log('Handle user sign up');
    }],
};

const signInModule = {
    name: 'signInModule',
    route: 'signIn',
    moduleLogic: [function() {
        console.log('Handle user sign in');
    }],
};

const userManagmentPlugin =  {
    name: 'userManagementPlugin',
    modules: [signUpModule, signInModule],
};

app.addPlugin(userManagmentPlugin);

app.startApp();