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
    it('should call a \'get\' http method on the http mock utility with a simple body', (done) => {
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

        const httpMock = testApp.fakeHttp(mdl);

        httpMock.get().then((response) => {
            const body = response.body();

            expect(body).to.be.equal(body);
            expect(response.statusCode()).to.be.equal(200);

            done();
        });
    });
});