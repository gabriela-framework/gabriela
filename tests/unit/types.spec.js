const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');

const it = mocha.it;
const xit = mocha.xit;
const describe = mocha.describe;
const expect = chai.expect;

const {
    MIDDLEWARE_TYPES,
    ASYNC_FLOW_TYPES,
    HTTP_METHODS,
    MANDATORY_ROUTE_PROPS,
    GABRIELA_EVENTS,
    BUILT_IN_MEDIATORS,
} = require('../../src/gabriela/misc/types');

describe('Types test', () => {
    it('should assert that constant types cannot be changed', () => {
        try {
            HTTP_METHODS.GET = 'something else';
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid constant type usage. Trying to change property 'GET' on a constant type`)
        }

        try {
            HTTP_METHODS.toArray = 'something else';
        } catch (e) {
            expect(e.message).to.be.equal(`Invalid constant type usage. Trying to change property 'toArray' on a constant type`)
        }

        expect(HTTP_METHODS.GET).to.be.equal('get');
    });

   it('should have the correct constant types', () => {
       expect(MIDDLEWARE_TYPES.SECURITY).to.be.equal('security');
       expect(MIDDLEWARE_TYPES.VALIDATORS).to.be.equal('validators');
       expect(MIDDLEWARE_TYPES.PRE_LOGIC_TRANSFORMERS).to.be.equal('preLogicTransformers');
       expect(MIDDLEWARE_TYPES.MODULE_LOGIC).to.be.equal('moduleLogic');
       expect(MIDDLEWARE_TYPES.POST_LOGIC_TRANSFORMERS).to.be.equal('postLogicTransformers');

       expect(ASYNC_FLOW_TYPES.DONE).to.be.equal('done');
       expect(ASYNC_FLOW_TYPES.NEXT).to.be.equal('next');
       expect(ASYNC_FLOW_TYPES.THROW_EXCEPTION).to.be.equal('throwException');
       expect(ASYNC_FLOW_TYPES.SKIP).to.be.equal('skip');

       expect(HTTP_METHODS.DELETE).to.be.equal('del');
       expect(HTTP_METHODS.GET).to.be.equal('get');
       expect(HTTP_METHODS.POST).to.be.equal('post');
       expect(HTTP_METHODS.PUT).to.be.equal('put');
       expect(HTTP_METHODS.HEAD).to.be.equal('head');
       expect(HTTP_METHODS.PATCH).to.be.equal('patch');

       expect(MANDATORY_ROUTE_PROPS.METHOD).to.be.equal('method');
       expect(MANDATORY_ROUTE_PROPS.NAME).to.be.equal('name');
       expect(MANDATORY_ROUTE_PROPS.PATH).to.be.equal('path');

       expect(GABRIELA_EVENTS.ON_APP_STARTED).to.be.equal('onAppStarted');
       expect(GABRIELA_EVENTS.ON_CATCH_ERROR).to.be.equal('catchError');

       expect(BUILT_IN_MEDIATORS.ON_PLUGIN_FINISHED).to.be.equal('onPluginFinished');
       expect(BUILT_IN_MEDIATORS.ON_PLUGIN_STARTED).to.be.equal('onPluginStarted');
       expect(BUILT_IN_MEDIATORS.ON_MODULE_FINISHED).to.be.equal('onModuleFinished');
       expect(BUILT_IN_MEDIATORS.ON_MODULE_STARTED).to.be.equal('onModuleStarted');
       expect(BUILT_IN_MEDIATORS.ON_ERROR).to.be.equal('onError');
   });

    it('should be updated with the middleware types list in types.js', () => {
        const type = ['init', 'security', 'preLogicTransformers', 'validators', 'moduleLogic', 'postLogicTransformers'];

        assert.deepEqual(type, Object.values(MIDDLEWARE_TYPES));
    });
});
