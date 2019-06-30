const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');

describe('Framework usability tests', () => {
    it('should perform a simple db save action', (done) => {
        function KeyValueDb() {
            const store = new Map();
            let increment = 0;

            async function save(value) {
                ++increment;

                store.set(increment, value);

                return {
                    key: increment,
                    value: value,
                };
            }

            async function has(key) {
                return store.has(key);
            }

            this.save = save;
            this.has = has;
        }

        const dbInit = {
            name: 'db',
            init: function() {
                return new KeyValueDb();
            }
        };

        const modelTransformerInit = {
            name: 'modelTransformer',
            init: function() {
                function ModelTransformer() {
                    this.createModel = function(request) {
                        return {
                            name: request.name,
                            lastName: request.lastName,
                            email: request.email,
                            password: request.password,
                        }
                    }
                }

                return new ModelTransformer();
            }
        };

        const request = {
            name: 'Billie',
            lastName: 'Holidy',
            email: 'billie@gmail.com',
            password: 'password',
        };

        const requestModule = {
            name: 'register',
            dependencies: [modelTransformerInit, dbInit],
            preLogicTransformers: [function(modelTransformer, state, next) {
                state.model = modelTransformer.createModel(request);

                next();
            }],
            moduleLogic: [function(db, next, state) {
                db.save(state.model).then((savedValue) => {
                    state.savedModel = savedValue;
                    state.db = db;

                    next();
                });
            }],
        };

        const runnerApp = gabriela.asProcess();

        runnerApp.addModule(requestModule);

        runnerApp.runModule().then((state) => {
            expect(state).to.have.property('register');

            const registerModuleState = state.register;

            expect(registerModuleState).to.have.property('model');
            expect(registerModuleState).to.have.property('savedModel');

            const savedModel = registerModuleState.savedModel;

            done();
        });
    });
});