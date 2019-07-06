const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const xit = mocha.xit;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');
const ExposedMediator = require('../../gabriela/events/exposedMediator');
const Compiler = require('../../gabriela/dependencyInjection/compiler');

describe('Exposed (third party) events tests', () => {
    xit('a concrete exposed events instance should run all common methods of its interface', () => {
        const rootCompiler = Compiler.create();

        rootCompiler.add({
            name: 'userService',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        });

        const exposedMediator = new ExposedMediator(rootCompiler);

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

        exposedMediator.add(onEmailInvalidEvent);
        exposedMediator.add(onNameInvalidEvent);

        expect(exposedMediator.has(onEmailInvalidEvent.name)).to.be.equal(true);
        expect(exposedMediator.has(onNameInvalidEvent.name)).to.be.equal(true);

        const compiler = Compiler.create();

        const userServiceDefinition = {
            name: 'userService',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        };

        compiler.add(userServiceDefinition);

        let eventCalled = false;
        const eventDefinition = {
            name: 'event',
            init: function(userService, num, aString) {
                eventCalled = true;

                expect(userService).to.be.a('object');
                expect(num).to.be.equal(5);
                expect(aString).to.be.equal('string');
            }
        };

        exposedMediator.add(eventDefinition);

        exposedMediator.emit('event', compiler, {
            num: 5,
            aString: 'string',
        });
    });
});