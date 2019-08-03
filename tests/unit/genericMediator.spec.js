const mocha = require('mocha');
const chai = require('chai');
const requestPromise = require('request-promise');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const GenericMediator = require('../../src/gabriela/events/genericMediator');
const Compiler = require('../../src/gabriela/dependencyInjection/compiler');

describe('Generic mediator concrete tests', function() {
    this.timeout(10000);

    it('should call a synchronous event', () => {
        const compiler = Compiler.create();

        const genericMediator = GenericMediator.create(compiler);

        let eventCalled = false;
        genericMediator.callEvent(function() {
            eventCalled = true;
        });

        expect(eventCalled).to.be.equal(true);
    });

    it('should call a asynchronous event', (done) => {
        const compiler = Compiler.create();

        const genericMediator = GenericMediator.create(compiler);

        let eventCalled = false;
        genericMediator.callEvent(function(next) {
            requestPromise.get('http://goiwouldlike.com').then(() => {
                eventCalled = true;

                next();

                done();
            });
        });

        expect(eventCalled).to.be.equal(true);
    });

    it('should catch a thrown exception from within the event', (done) => {
        const compiler = Compiler.create();

        const genericMediator = GenericMediator.create(compiler);

        let exceptionEntered = false;
        let eventCalled = false;
        try {
            genericMediator.callEvent(function(throwException) {
                requestPromise.get('http://goiwouldlike.com').then(() => {
                    eventCalled = true;

                    throwException(new Error('Something went wrong'));
                });
            });
        } catch (e) {
            exceptionEntered = true;
        }

        expect(eventCalled).to.be.equal(true);
        expect(exceptionEntered).to.be.equal(true);

        done();
    });

    it('should call an event when async handling is explicitly disabled', (done) => {
        const compiler = Compiler.create();

        const genericMediator = GenericMediator.create(compiler);

        let eventCalled = false;
        genericMediator.callEvent(function() {
            eventCalled = true;
        }, null, {enableAsyncHandling: false});

        expect(eventCalled).to.be.equal(true);

        done();
    });

    it('should bind a proper context to an event', () => {
        const compiler = Compiler.create();

        const context = {name: 'name'};

        const genericMediator = GenericMediator.create(compiler);

        let eventCalled = false;
        genericMediator.callEvent(function() {
            eventCalled = true;

            expect(this).to.have.property('name');
            expect(this.name).to.be.equal('name');
        }, context, {enableAsyncHandling: false});

        expect(eventCalled).to.be.equal(true);
    });
});