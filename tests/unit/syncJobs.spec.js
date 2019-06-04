const mocha = require('mocha');
const chai = require('chai');
const requestPromise = require('request-promise');
const assert = require('assert');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../gabriela/gabriela');

describe('Job tests | ', () => {
    it('should create a job and treat it as a collection', () => {
        const name = 'jobName';
        const job = {
            name: name,
            preLogicTransformers: [function() {}, function() {}],
            validators: [function() {}],
            jobLogic: [function() {}, function() {}, function() {}],
        };

        const g = gabriela.createBasicJob();

        g.addJob(job);

        expect(g.hasJob(name)).to.be.true;
        expect(g.getJob(name)).to.be.a('object');

        job.name = 'someOtherName';

        const immutableJob = g.getJob(name);

        expect(immutableJob.name).to.be.equals(name);

        expect(immutableJob.preLogicTransformers).to.be.a('array');
        expect(immutableJob.validators).to.be.a('array');
        expect(immutableJob.jobLogic).to.be.a('array');

        expect(immutableJob.preLogicTransformers.length).to.be.equal(2);
        
        for (const t of immutableJob.preLogicTransformers) {
            expect(t).to.be.a('function');
        }

        expect(immutableJob.validators.length).to.be.equal(1);
        
        for (const t of immutableJob.validators) {
            expect(t).to.be.a('function');
        }

        expect(immutableJob.jobLogic.length).to.be.equal(3);
        
        for (const t of immutableJob.jobLogic) {
            expect(t).to.be.a('function');
        }

        expect(g.removeJob(name)).to.be.true;

        expect(g.hasJob(name)).to.be.false;
        expect(g.getJob(name)).to.be.a('undefined');
    });

    it('should assert that next proceedes to next middleware with an async function inside middleware', (done) => {
        const name = 'googleCall';

        const googleRequest = function(state, next) {
            requestPromise.get('https://www.google.com/').then((body) => {
                state.googleBody = body;

                next();
            });
        }

        const module = {
            name: name,
            jobLogic: [googleRequest]
        };

        const g = gabriela.createBasicJob();

        g.addJob(module);

        g.runJob(g.getJob(name)).then((jobResult) => {
            expect(jobResult).to.have.property('googleBody');

            done();
        });
    });

    it('should assert that skip skips the single middleware and not all', (done) => {
        const name = 'jobName';
        const model = {
            name: 'name',
            lastName: 'lastName',
            age: 32
        }

        const modelCreationTransformer = function(state, next) {
            state.model = model;

            next();
        }

        const ageTransformer = function(state, next, skip) {
            return skip();
        }

        const addOption1Property = function(state, next) {
            state.model.option1 = true;

            next();
        }

        const addOption2Property = function(state, next) {
            state.model.option2 = true;

            next();
        }

        const jobLogic = function(state, next) {
            state.model.executed = true;

            next();
        }

        const job = {
            name: name,
            preLogicTransformers: [modelCreationTransformer, ageTransformer, addOption1Property, addOption2Property],
            validators: [],
            jobLogic: [jobLogic],
        };

        const g = gabriela.createBasicJob();

        g.addJob(job);

        g.runJob(g.getJob(name)).then((jobResult) => {
            expect(jobResult.model.name).to.be.equal(model.name);
            expect(jobResult.model.lastName).to.be.equal(model.lastName);
            expect(jobResult.model.age).to.be.equal(32);
            expect(jobResult.model.executed).to.be.true;

            done();
        });
    });

    it('should assert that done skips all middleware and not just the currently executing', (done) => {
        const name = 'jobName';
        const model = {
            name: 'name',
            lastName: 'lastName',
            age: 32
        }

        const modelCreationTransformer = function(state, next, skip, done) {
            state.model = model;

            done();
        }

        const ageTransformer = function(state, next, skip) {
            return skip();
        }

        const addOption1Property = function(state, next) {
            state.model.option1 = true;

            next();
        }

        const addOption2Property = function(state, next) {
            state.model.option2 = true;

            next();
        }

        const jobLogic = function(state, next) {
            state.model.executed = true;

            next();
        }

        const job = {
            name: name,
            preLogicTransformers: [modelCreationTransformer, ageTransformer, addOption1Property, addOption2Property],
            validators: [],
            jobLogic: [jobLogic],
        };

        const g = gabriela.createBasicJob();

        g.addJob(job);

        g.runJob(g.getJob(name)).then((jobResult) => {
            expect(jobResult.model.name).to.be.equal(model.name);
            expect(jobResult.model.lastName).to.be.equal(model.lastName);
            expect(jobResult.model.age).to.be.equal(32);
            expect(jobResult.model).to.not.have.property('executed');
            expect(jobResult.model).to.not.have.property('option1');
            expect(jobResult.model).to.not.have.property('option2');

            done();
        });
    });

    it('should assert that preLogicTransformers create and modify the model', () => {
        const name = 'jobName';
        const model = {
            name: 'name',
            lastName: 'lastName',
            age: 32
        }

        const modelCreationTransformer = function(state, next) {
            state.model = model;

            next();
        }

        const ageTransformer = function(state, next) {
            state.model.age = 25;

            next();
        }

        const job = {
            name: name,
            preLogicTransformers: [modelCreationTransformer, ageTransformer],
            validators: [],
            jobLogic: [],
        };

        const g = gabriela.createBasicJob();

        g.addJob(job);

        g.runJob(g.getJob(name)).then((jobResult) => {
            expect(jobResult.model.name).to.be.equal(model.name);
            expect(jobResult.model.lastName).to.be.equal(model.lastName);
            expect(jobResult.model.age).to.be.equal(25);
        });
    })

    it('should assert that validators validate the model', () => {
        const name = 'jobName';
        const model = {
            name: 'name',
            lastName: 'lastName',
            age: 32
        }

        const modelCreationTransformer = function(state, next) {
            state.model = model;

            next();
        }

        const ageValidator = function(state, next) {
            if (state.model.age > 25) {
                throw new Error('Invalid models age');
            }

            return next();
        }

        const job = {
            name: name,
            preLogicTransformers: [modelCreationTransformer],
            validators: [ageValidator],
            jobLogic: [],
        };

        const g = gabriela.createBasicJob();

        g.addJob(job);

        g.runJob(g.getJob(name)).then(() => assert.fail('This test should be an error')).catch((err) => {
            expect(err.message).to.be.equal('Invalid models age');
        });
    });

    it('should assert that the main logic execution is executed', function() {
        const name = 'jobName';
        const model = {
            name: 'name',
            lastName: 'lastName',
            age: 32
        }

        const modelCreationTransformer = function(state, next) {
            state.model = model;

            next();
        }

        const logicExec = function(state, next) {
            state.model.executed = true;

            next();
        }

        const job = {
            name: name,
            preLogicTransformers: [modelCreationTransformer],
            validators: [],
            jobLogic: [logicExec],
        };

        const g = gabriela.createBasicJob();

        g.addJob(job);

        g.runJob(g.getJob(name)).then((jobResult) => {
            expect(jobResult.model.name).to.be.equal(model.name);
            expect(jobResult.model.lastName).to.be.equal(model.lastName);
            expect(jobResult.model.age).to.be.equal(32);
            expect(jobResult.model).to.have.property('executed');
            expect(jobResult.model.executed).to.be.true;
        });
    });

    it('should contain all jobs in a tree', () => {
        const name = 'user';
        const profileJobName = 'profile';
        const userSettingsJobName = 'userSettings';

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
        }

        const colorSettingChange = function(state, next) {
            state.userSettings.colorSetting = 'light';

            next();
        }

        const colorSettingValidator = function(state, next) {
            const valids = ['light', 'dark'];

            if (!valids.includes(state.userSettings.colorSetting)) {
                throw new Error('color setting can only be light or dark');
            }

            next();
        }

        const profileJob = {
            name: profileJobName,
            preLogicTransformers: [profileChanged],
            validators: [timezoneValidator],
            appLogic: [],
        };

        const userSettingsJob = {
            name: userSettingsJobName,
            preLogicTransformers: [colorSettingChange],
            validators: [colorSettingValidator],
            appLogic: []
        }

        const parentJob = {
            name: name,
            jobs: [profileJob, userSettingsJob],
            preLogicTransformers: [userCreationTransformer],
            validators: [],
            jobLogic: [logicExec],
        };

        const g = gabriela.createBasicJob();

        g.addJob(parentJob);

        expect(g.parent).to.be.null;
        expect(g.child).to.be.a('object');
        expect(g.child.parent).to.be.a('object');

        expect(g.hasJob(name)).to.be.true;
        expect(g.child.hasJob(profileJobName)).to.be.true;
        expect(g.child.hasJob(userSettingsJobName)).to.be.true;
    });

    it('should run all parent/child jobs', () => {
        const name = 'user';
        const profileJobName = 'profile';
        const userSettingsJobName = 'userSettings';

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
        }

        const userSettingsCreationTransformer = function(state, next) {
            state.model = userSettings;

            next();
        }

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
        }

        const colorSettingChange = function(state, next) {
            state.model.colorSetting = 'light';

            next();
        }

        const postLogicTransformer = function(state, next) {
            const user = state.model;
            const profile = state.child.profile.model;
            const userSettings = state.child.userSettings.model;

            user.profile = profile;
            user.userSettings = userSettings;

            state.user = user;

            next();
        }

        const colorSettingValidator = function(state, next) {
            const valids = ['light', 'dark'];

            if (!valids.includes(state.model.colorSetting)) {
                throw new Error('color setting can only be light or dark');
            }

            next();
        }

        const profileJob = {
            name: profileJobName,
            preLogicTransformers: [profileCreationTransformer, profileChanged],
            validators: [timezoneValidator],
            jobLogic: [logicExec],
        };

        const userSettingsJob = {
            name: userSettingsJobName,
            preLogicTransformers: [userSettingsCreationTransformer, colorSettingChange],
            validators: [colorSettingValidator],
            jobLogic: [logicExec]
        }

        const parentJob = {
            name: name,
            jobs: [profileJob, userSettingsJob],
            preLogicTransformers: [userCreationTransformer],
            postLogicTransformers: [postLogicTransformer],
            validators: [],
            jobLogic: [logicExec],
        };

        const g = gabriela.createBasicJob();

        g.addJob(parentJob);

        g.runJob(parentJob).then((result) => {
            expect(result).to.have.property('user')
            expect(result.user.executed).to.be.true;
            expect(result.user).to.have.property('profile');
            expect(result.user.profile.executed).to.be.true;
            expect(result.user).to.have.property('userSettings');
            expect(result.user.userSettings.executed).to.be.true;
        });
    });
});