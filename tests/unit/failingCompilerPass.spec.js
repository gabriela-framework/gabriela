const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');

describe('Compiler pass failing tests', () => {
    it('should fail to compile a module dependency created in a compiler pass and used in another module', (done) => {
        let mdl1Entered = false;
        let mdl2Entered = false;

        const dep = {
            name: 'compilerPassDep',
            compilerPass: {
                init: function(config, compiler) {
                    compiler.add({
                        name: 'userService',
                        init: function() {
                            function UserService() {}

                            return new UserService();
                        }
                    });
                }
            },
            init: function() {
                return {};
            }
        };

        const mdl1 = {
            name: 'mdl1',
            dependencies: [dep],
            moduleLogic: [function(userService) {
                mdl1Entered = true;

                expect(userService).to.be.a('object');
            }],
        };

        const mdl2 = {
            name: 'mdl2',
            moduleLogic: [function(userService) {
                mdl2Entered = false;
            }],
        };

        const app = gabriela.asProcess({
            config: {},
        });

        app.addModule(mdl1);
        app.addModule(mdl2);

        app.runModule().then(() => {
            assert.fail('This test should fail');
        }).catch(() => {
            expect(mdl1Entered).to.be.equal(true);
            expect(mdl2Entered).to.be.equal(false);

            done();
        });
    });
});