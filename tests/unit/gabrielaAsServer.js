const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');

describe('Gabriela server tests', function() {
    it('should start listening to the server', () => {
        const g = gabriela.asServer({
            server: {
                port: 4000,
            }
        });
    })
});