const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');
const ExposedEvents = require('../../gabriela/events/exposedEvents');
const Compiler = require('../../gabriela/dependencyInjection/compiler');

describe('Exposed (third party) events tests', () => {
    it('a concrete exposed events instance should run all common methods of its interface', () => {
        const rootCompiler = Compiler.create();

        rootCompiler.add({
            name: 'userService',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        });

        const exposedEvents = new ExposedEvents(rootCompiler);

        const onEmailInvalidEvent = {
            name: 'onEmailInvalid',
            init: function() {

            },
        };

        const onNameInvalidEvent = {
            name: 'onNameInvalid',
            init: function(userService) {

            }
        };

        exposedEvents.add(onEmailInvalidEvent);
        exposedEvents.add(onNameInvalidEvent);

        expect(exposedEvents.has(onEmailInvalidEvent.name)).to.be.equal(true);
        expect(exposedEvents.has(onNameInvalidEvent.name)).to.be.equal(true);
    });
});