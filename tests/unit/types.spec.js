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
    HTTP_EVENTS,
    ENV,
    INJECTION_TYPES,
    BUILT_IN_MEDIATORS,
    VISIBILITY_TYPES,
    LOGGING_TYPES,
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
       let types = ['init', 'security', 'preLogicTransformers', 'validators', 'moduleLogic', 'postLogicTransformers'];
       assert.deepEqual(types, Object.values(MIDDLEWARE_TYPES));

       expect(MIDDLEWARE_TYPES.INIT).to.be.equal('init');
       expect(MIDDLEWARE_TYPES.SECURITY).to.be.equal('security');
       expect(MIDDLEWARE_TYPES.VALIDATORS).to.be.equal('validators');
       expect(MIDDLEWARE_TYPES.PRE_LOGIC_TRANSFORMERS).to.be.equal('preLogicTransformers');
       expect(MIDDLEWARE_TYPES.MODULE_LOGIC).to.be.equal('moduleLogic');
       expect(MIDDLEWARE_TYPES.POST_LOGIC_TRANSFORMERS).to.be.equal('postLogicTransformers');

       types = ['next', 'done', 'skip', 'throwException'];
       assert.deepEqual(types, Object.values(ASYNC_FLOW_TYPES));

       expect(ASYNC_FLOW_TYPES.DONE).to.be.equal('done');
       expect(ASYNC_FLOW_TYPES.NEXT).to.be.equal('next');
       expect(ASYNC_FLOW_TYPES.THROW_EXCEPTION).to.be.equal('throwException');
       expect(ASYNC_FLOW_TYPES.SKIP).to.be.equal('skip');

       types = ['get', 'put', 'post', 'patch', 'delete', 'head', 'options'];
       assert.deepEqual(types, Object.values(HTTP_METHODS));

       expect(HTTP_METHODS.DELETE).to.be.equal('delete');
       expect(HTTP_METHODS.GET).to.be.equal('get');
       expect(HTTP_METHODS.POST).to.be.equal('post');
       expect(HTTP_METHODS.PUT).to.be.equal('put');
       expect(HTTP_METHODS.HEAD).to.be.equal('head');
       expect(HTTP_METHODS.PATCH).to.be.equal('patch');
       expect(HTTP_METHODS.OPTIONS).to.be.equal('options');

       types = ['name', 'path', 'method'];
       assert.deepEqual(types, Object.values(MANDATORY_ROUTE_PROPS));

       expect(MANDATORY_ROUTE_PROPS.METHOD).to.be.equal('method');
       expect(MANDATORY_ROUTE_PROPS.NAME).to.be.equal('name');
       expect(MANDATORY_ROUTE_PROPS.PATH).to.be.equal('path');

       types = ['onAppStarted', 'catchError', 'onExit'];
       assert.deepEqual(types, Object.values(GABRIELA_EVENTS));

       expect(GABRIELA_EVENTS.ON_APP_STARTED).to.be.equal('onAppStarted');
       expect(GABRIELA_EVENTS.ON_CATCH_ERROR).to.be.equal('catchError');
       expect(GABRIELA_EVENTS.ON_EXIT).to.be.equal('onExit');

       types = ['onModuleStarted', 'onModuleFinished', 'onPluginStarted', 'onPluginFinished', 'onError'];
       assert.deepEqual(types, Object.values(BUILT_IN_MEDIATORS));

       expect(BUILT_IN_MEDIATORS.ON_PLUGIN_FINISHED).to.be.equal('onPluginFinished');
       expect(BUILT_IN_MEDIATORS.ON_PLUGIN_STARTED).to.be.equal('onPluginStarted');
       expect(BUILT_IN_MEDIATORS.ON_MODULE_FINISHED).to.be.equal('onModuleFinished');
       expect(BUILT_IN_MEDIATORS.ON_MODULE_STARTED).to.be.equal('onModuleStarted');
       expect(BUILT_IN_MEDIATORS.ON_ERROR).to.be.equal('onError');

       types = ['public', 'module', 'plugin'];
       assert.deepEqual(types, Object.values(VISIBILITY_TYPES));

       expect(VISIBILITY_TYPES.PUBLIC).to.be.equal('public');
       expect(VISIBILITY_TYPES.MODULE).to.be.equal('module');
       expect(VISIBILITY_TYPES.PLUGIN).to.be.equal('plugin');

       types = ['onPreResponse', 'onPostResponse'];
       assert.deepEqual(types, Object.values(HTTP_EVENTS));

       expect(HTTP_EVENTS.ON_PRE_RESPONSE).to.be.equal('onPreResponse');
       expect(HTTP_EVENTS.ON_POST_RESPONSE).to.be.equal('onPostResponse');

       types = ['dev', 'prod'];
       assert.deepEqual(types, Object.values(ENV));

       expect(ENV.DEVELOPMENT).to.be.equal('dev');
       expect(ENV.PRODUCTION).to.be.equal('prod');

       types = ['property', 'constructor', 'method'];
       assert.deepEqual(types, Object.values(INJECTION_TYPES));

       expect(INJECTION_TYPES.PROPERTY).to.be.equal('property');
       expect(INJECTION_TYPES.CONSTRUCTOR).to.be.equal('constructor');
       expect(INJECTION_TYPES.METHOD).to.be.equal('method');

       types = ['warning', 'notice', 'deprecation'];
       assert.deepEqual(types, Object.values(LOGGING_TYPES));

       expect(LOGGING_TYPES.WARNING).to.be.equal('warning');
       expect(LOGGING_TYPES.NOTICE).to.be.equal('notice');
       expect(LOGGING_TYPES.DEPRECATION).to.be.equal('deprecation');
   });

    it('should be updated with the middleware types list in types.js', () => {
        const type = ['init', 'security', 'preLogicTransformers', 'validators', 'moduleLogic', 'postLogicTransformers'];

        assert.deepEqual(type, Object.values(MIDDLEWARE_TYPES));
    });
});
