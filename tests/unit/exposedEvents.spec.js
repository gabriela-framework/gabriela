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
    it('a concrete exposed event should be pre bound before its emitted in a server route environment', () => {
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

        exposedMediator.preBind('event1', function() {
            event1Called = true;
        });

        exposedMediator.preBind('event2', function() {
            event2Called = true;
        });

        expect(exposedMediator.isEmitted('event1')).to.be.equal(false);
        expect(exposedMediator.isEmitted('event2')).to.be.equal(false);
    });
});