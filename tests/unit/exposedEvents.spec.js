const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const xit = mocha.xit;
const describe = mocha.describe;
const expect = chai.expect;

const ExposedMediator = require('../../gabriela/events/exposedMediator');
const Compiler = require('../../gabriela/dependencyInjection/compiler');

describe('Exposed (third party) events tests', () => {
    it('should call all events in an replica of the environment that gabriela uses internally', () => {
        const rootCompiler = Compiler.create();

        rootCompiler.add({
            name: 'userService',
            init: function() {
                function UserService() {}

                return new UserService();
            }
        });

        const exposedMediator = new ExposedMediator();

        let event1Called = false;
        let event2Called = false;

        exposedMediator.add('event1');
        exposedMediator.add('event2');

        expect(exposedMediator.isEmitted('event1')).to.be.equal(false);
        expect(exposedMediator.isEmitted('event2')).to.be.equal(false);

        exposedMediator.preBind('event1', function() {
            event1Called = true;
        });

        exposedMediator.preBind('event2', function() {
            event2Called = true;
        });

        expect(exposedMediator.isEmitted('event1')).to.be.equal(false);
        expect(exposedMediator.isEmitted('event2')).to.be.equal(false);

        exposedMediator.emit('event1', rootCompiler, {name: 'name'});

        expect(exposedMediator.isEmitted('event1')).to.be.equal(true);
        expect(exposedMediator.isEmitted('event2')).to.be.equal(false);

        exposedMediator.emit('event2', rootCompiler, {name: 'name'});

        expect(exposedMediator.isEmitted('event1')).to.be.equal(true);
        expect(exposedMediator.isEmitted('event2')).to.be.equal(true);

        expect(event1Called).to.be.equal(true);
        expect(event2Called).to.be.equal(true);
    });
});