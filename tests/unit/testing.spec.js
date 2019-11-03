const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');
const gabriela = require('./../../src/index');
const mockResponseFn = require('./../../src/gabriela/testing/mock/response');

const it = mocha.it;
const xit = mocha.xit;
const describe = mocha.describe;
const expect = chai.expect;

describe('Testing utilities', () => {
    it('should not execute a post method if a get method is mocked', (done) => {
        const testApp = gabriela.asTest({
            config: {framework: {}}
        });

        const bodyString = "This is the body";

        const mdl = {
            name: 'testingModule',
            http: {
                route: {
                    name: 'route',
                    path: '/path',
                    method: 'GET',
                }
            },
            init: [function(http) {
                http.res.send(200, bodyString);
            }],
        };

        testApp.addModule(mdl);

        testApp.post('testingModule').catch(() => {
            done();
        });
    });

    it('should call a \'get\' http method on the http mock utility using a module with a simple body', (done) => {
        const testApp = gabriela.asTest({
            config: {framework: {}}
        });

        const bodyString = "This is the body";

        const mdl = {
            name: 'module',
            http: {
                route: {
                    name: 'route',
                    path: '/path',
                    method: 'GET',
                }
            },
            init: [function(http) {
                http.res.send(200, bodyString);
            }],
        };

        testApp.addModule(mdl);

        testApp.get('module').then((res) => {
            expect(bodyString).to.be.equal(res.body());

            done();
        });
    });
});