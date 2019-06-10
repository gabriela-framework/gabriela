const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');

const it = mocha.it;
const xit = mocha.xit;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');

describe('Gabriela runner tests', () => {
    it('should create a module and treat it as a collection', () => {
        const name = 'moduleName';
        const mdl = {
            name: name,
            preLogicTransformers: [function() {}, function() {}],
            validators: [function() {}],
            moduleLogic: [function() {}, function() {}, function() {}],
        };

        const g = gabriela.asRunner();

        g.addModule(mdl);

        expect(g.hasModule(name)).to.be.equal(true);
        expect(g.getModule(name)).to.be.a('object');

        mdl.name = 'someOtherName';

        const immutableModule = g.getModule(name);

        expect(immutableModule.name).to.be.equals(name);

        expect(immutableModule.preLogicTransformers).to.be.a('array');
        expect(immutableModule.validators).to.be.a('array');
        expect(immutableModule.moduleLogic).to.be.a('array');

        expect(immutableModule.preLogicTransformers.length).to.be.equal(2);
        
        for (const t of immutableModule.preLogicTransformers) {
            expect(t).to.be.a('function');
        }

        expect(immutableModule.validators.length).to.be.equal(1);
        
        for (const t of immutableModule.validators) {
            expect(t).to.be.a('function');
        }

        expect(immutableModule.moduleLogic.length).to.be.equal(3);
        
        for (const t of immutableModule.moduleLogic) {
            expect(t).to.be.a('function');
        }

        expect(g.removeModule(name)).to.be.equal(true);

        expect(g.hasModule(name)).to.be.false;
        expect(g.getModule(name)).to.be.a('undefined');
    });

    it('should assert that skip skips the single middleware and not all', (done) => {
        const name = 'moduleName';
        const model = {
            name: 'name',
            lastName: 'lastName',
            age: 32
        };

        const modelCreationTransformer = function(state, next) {
            state.model = model;

            next();
        };

        const ageTransformer = function(state, next, skip) {
            return skip();
        };

        const addOption1Property = function(state, next) {
            state.model.option1 = true;

            next();
        };

        const addOption2Property = function(state, next) {
            state.model.option2 = true;

            next();
        };

        const moduleLogic = function(state, next) {
            state.model.executed = true;

            next();
        };

        const mdl = {
            name: name,
            preLogicTransformers: [modelCreationTransformer, ageTransformer, addOption1Property, addOption2Property],
            validators: [],
            moduleLogic: [moduleLogic],
        };

        const g = gabriela.asRunner();

        g.addModule(mdl);

        g.runModule(mdl.name)
        .then((moduleResult) => {
            expect(moduleResult.model.name).to.be.equal(model.name);
            expect(moduleResult.model.lastName).to.be.equal(model.lastName);
            expect(moduleResult.model.age).to.be.equal(32);
            expect(moduleResult.model.executed).to.be.equal(true);

            done();
        });
    });

    it('should assert that done skips all middleware and not just the currently executing', (done) => {
        const name = 'moduleName';
        const model = {
            name: 'name',
            lastName: 'lastName',
            age: 32
        };

        const modelCreationTransformer = function(state, next, skip, done) {
            state.model = model;

            done();
        };

        const ageTransformer = function(state, next, skip) {
            return skip();
        };

        const addOption1Property = function(state, next) {
            state.model.option1 = true;

            next();
        };

        const addOption2Property = function(state, next) {
            state.model.option2 = true;

            next();
        };

        const moduleLogic = function(state, next) {
            state.model.executed = true;

            next();
        };

        const mdl = {
            name: name,
            preLogicTransformers: [modelCreationTransformer, ageTransformer, addOption1Property, addOption2Property],
            validators: [],
            moduleLogic: [moduleLogic],
        };

        const g = gabriela.asRunner();

        g.addModule(mdl);

        g.runModule(mdl.name).then((moduleResult) => {
            expect(moduleResult.model.name).to.be.equal(model.name);
            expect(moduleResult.model.lastName).to.be.equal(model.lastName);
            expect(moduleResult.model.age).to.be.equal(32);
            expect(moduleResult.model).to.not.have.property('executed');
            expect(moduleResult.model).to.not.have.property('option1');
            expect(moduleResult.model).to.not.have.property('option2');

            done();
        });
    });

    it('should assert that preLogicTransformers create and modify the model', () => {
        const name = 'moduleName';
        const model = {
            name: 'name',
            lastName: 'lastName',
            age: 32
        };

        const modelCreationTransformer = function(state, next) {
            state.model = model;

            next();
        };

        const ageTransformer = function(state, next) {
            state.model.age = 25;

            next();
        };

        const mdl = {
            name: name,
            preLogicTransformers: [modelCreationTransformer, ageTransformer],
            validators: [],
            moduleLogic: [],
        };

        const g = gabriela.asRunner();

        g.addModule(mdl);

        g.runModule(mdl.name).then((moduleResult) => {
            expect(moduleResult.model.name).to.be.equal(model.name);
            expect(moduleResult.model.lastName).to.be.equal(model.lastName);
            expect(moduleResult.model.age).to.be.equal(25);
        });
    });

    it('should assert that validators validate the model', () => {
        const name = 'moduleName';
        const model = {
            name: 'name',
            lastName: 'lastName',
            age: 32
        };

        const modelCreationTransformer = function(state, next) {
            state.model = model;

            next();
        };

        const ageValidator = function(state, next) {
            if (state.model.age > 25) {
                throw new Error('Invalid models age');
            }

            return next();
        };

        const mdl = {
            name: name,
            preLogicTransformers: [modelCreationTransformer],
            validators: [ageValidator],
            moduleLogic: [],
        };

        const g = gabriela.asRunner();

        g.addModule(mdl);

        g.runModule(mdl.name).then(() => assert.fail('This test should be an error')).catch((err) => {
            expect(err.message).to.be.equal('Invalid models age');
        });
    });

    it('should assert that the main logic execution is executed', function() {
        const name = 'moduleName';
        const model = {
            name: 'name',
            lastName: 'lastName',
            age: 32
        };

        const modelCreationTransformer = function(state, next) {
            state.model = model;

            next();
        };

        const logicExec = function(state, next) {
            state.model.executed = true;

            next();
        };

        const mdl = {
            name: name,
            preLogicTransformers: [modelCreationTransformer],
            validators: [],
            moduleLogic: [logicExec],
        };

        const g = gabriela.asRunner();

        g.addModule(mdl);

        g.runModule(mdl.name).then((moduleResult) => {
            expect(moduleResult.model.name).to.be.equal(model.name);
            expect(moduleResult.model.lastName).to.be.equal(model.lastName);
            expect(moduleResult.model.age).to.be.equal(32);
            expect(moduleResult.model).to.have.property('executed');
            expect(moduleResult.model.executed).to.be.equal(true);
        });
    });

    xit('should contain all modules in a tree', () => {
        const name = 'user';
        const profileModuleName = 'profile';
        const userSettingsModuleName = 'userSettings';

        const user = {
            email: 'email@gmail.com',
            name: 'name',
            lastName: 'lastName',
            age: 32,
        };

        const profile = {
            hobbie: 'Shitting',
            job: 'Programmer',
            timezone: 'Europe/Dublin',
        };

        const userSettings = {
            colorSetting: 'dark',
            isInNewsletter: true,
        };

        const userCreationTransformer = function(state, next) {
            state.model = user;

            next();
        };

        const logicExec = function(state, next) {
            state.model.executed = true;

            next();
        };

        const profileChanged = function(state, next) {
            state.profile.updatedAt = new Date();

            next();
        };

        const timezoneValidator = function(state, next) {
            if (state.profile.timezone !== 'Europe/Dublin') {
                throw new Error('Timezone has to be Europe/Dublin');
            }

            next();
        };

        const colorSettingChange = function(state, next) {
            state.userSettings.colorSetting = 'light';

            next();
        };

        const colorSettingValidator = function(state, next) {
            const valids = ['light', 'dark'];

            if (!valids.includes(state.userSettings.colorSetting)) {
                throw new Error('color setting can only be light or dark');
            }

            next();
        };

        const profileModule = {
            name: profileModuleName,
            preLogicTransformers: [profileChanged],
            validators: [timezoneValidator],
            moduleLogic: [],
        };

        const userSettingsModule = {
            name: userSettingsModuleName,
            preLogicTransformers: [colorSettingChange],
            validators: [colorSettingValidator],
            moduleLogic: []
        };

        const parentModule = {
            name: name,
            modules: [profileModule, userSettingsModule],
            preLogicTransformers: [userCreationTransformer],
            validators: [],
            moduleLogic: [logicExec],
        };

        const g = gabriela.asRunner();

        g.addModule(parentModule);

        expect(g.parent).to.be.null;
        expect(g.child).to.be.a('object');
        expect(g.child.parent).to.be.a('object');

        expect(g.hasModule(name)).to.be.equal(true);
        expect(g.child.hasModule(profileModuleName)).to.be.equal(true);
        expect(g.child.hasModule(userSettingsModuleName)).to.be.equal(true);
    });

    xit('should run all parent/child modules', () => {
        const name = 'user';
        const profileModuleName = 'profile';
        const userSettingsModuleName = 'userSettings';

        const user = {
            email: 'email@gmail.com',
            name: 'name',
            lastName: 'lastName',
            age: 32,
        };

        const profile = {
            hobbie: 'Shitting',
            job: 'Programmer',
            timezone: 'Europe/Dublin',
        };

        const userSettings = {
            colorSetting: 'dark',
            isInNewsletter: true,
        };

        const userCreationTransformer = function(state, next) {
            state.model = user;

            next();
        };

        const profileCreationTransformer = function(state, next) {
            state.model = profile;

            next();
        };

        const userSettingsCreationTransformer = function(state, next) {
            state.model = userSettings;

            next();
        };

        const logicExec = function(state, next) {
            state.model.executed = true;

            next();
        };

        const profileChanged = function(state, next) {
            state.model.updatedAt = new Date();

            next();
        };

        const timezoneValidator = function(state, next) {
            if (state.model.timezone !== 'Europe/Dublin') {
                throw new Error('Timezone has to be Europe/Dublin');
            }

            next();
        };

        const colorSettingChange = function(state, next) {
            state.model.colorSetting = 'light';

            next();
        };

        const postLogicTransformer = function(state, next) {
            const user = state.model;
            const profile = state.child.profile.model;
            const userSettings = state.child.userSettings.model;

            user.profile = profile;
            user.userSettings = userSettings;

            state.user = user;

            next();
        };

        const colorSettingValidator = function(state, next) {
            const valids = ['light', 'dark'];

            if (!valids.includes(state.model.colorSetting)) {
                throw new Error('color setting can only be light or dark');
            }

            next();
        };

        const profileModule = {
            name: profileModuleName,
            preLogicTransformers: [profileCreationTransformer, profileChanged],
            validators: [timezoneValidator],
            moduleLogic: [logicExec],
        };

        const userSettingsModule = {
            name: userSettingsModuleName,
            preLogicTransformers: [userSettingsCreationTransformer, colorSettingChange],
            validators: [colorSettingValidator],
            moduleLogic: [logicExec]
        };

        const parentModule = {
            name: name,
            modules: [profileModule, userSettingsModule],
            preLogicTransformers: [userCreationTransformer],
            postLogicTransformers: [postLogicTransformer],
            validators: [],
            moduleLogic: [logicExec],
        };

        const g = gabriela.asRunner();

        g.addModule(parentModule);

        g.runModule(parentModule.name).then((moduleResult) => {
            expect(moduleResult).to.have.property('user')
            expect(moduleResult.user.executed).to.be.equal(true);
            expect(moduleResult.user).to.have.property('profile');
            expect(moduleResult.user.profile.executed).to.be.equal(true);
            expect(moduleResult.user).to.have.property('userSettings');
            expect(moduleResult.user.userSettings.executed).to.be.equal(true);
        });
    });

    it('should catch an exception thrown inside the middleware function', (done) => {
        const throwsException = function(state, next, skip, done, throwException) {
            throwException(new Error('my exception'));
        };

        const mdl = {
            name: 'name',
            preLogicTransformers: [throwsException],
        };

        const g = gabriela.asRunner();

        g.addModule(mdl);

        g.runModule(mdl.name).catch((err) => {
            expect(err.message).to.be.equal('my exception');

            done();
        })
    });
});