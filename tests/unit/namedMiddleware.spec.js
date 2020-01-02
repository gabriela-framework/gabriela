const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const gabriela = require('../../src/gabriela/gabriela');
const config = require('../config/config');

describe('Named middleware tests', function() {
    this.timeout(10000);

    it('should execute all middleware blocks correctly', (done) => {
        let init1 = false;
        let init2 = false;
        let init3 = false;

        let ml1 = false;
        let ml2 = false;
        let ml3 = false;
        let ml4 = false;

        const mdl = {
            name: 'mdl',
            init: [function() {
                init1 = true;
            }, {
                name: 'initfn1',
                middleware() {
                    init2 = true;
                }
            }, {
                name: 'initfn2',
                middleware: function() {
                    init3 = true;
                }
            }],
            moduleLogic: [
                async function() {
                    ml1 = true;
                },
                {
                    name: 'ml1',
                    async middleware() {
                        ml2 = true;
                    }
                },
                {
                    name: 'ml2',
                    middleware: async function() {
                        ml3 = true;
                    }
                },
                {
                    name: 'ml3',
                    middleware() {
                        ml4 = true;
                    }
                }
            ]
        };

        const g = gabriela.asServer({
            config: {
                server: {
                    port: 4000,
                },
                framework: {},
            }
        }, [], {
            events: {
                onAppStarted: function() {
                    expect(init1).to.be.equal(true);
                    expect(init2).to.be.equal(true);
                    expect(init3).to.be.equal(true);

                    expect(ml1).to.be.equal(true);
                    expect(ml2).to.be.equal(true);
                    expect(ml3).to.be.equal(true);
                    expect(ml4).to.be.equal(true);

                    this.gabriela.close();
                    done();
                }
            }
        });

        g.addModule(mdl);

        g.startApp();
    });

    it('should run all middleware with next() middleware handling function', (done) => {
        let init1 = false;
        let init2 = false;
        let init3 = false;

        let ml1 = false;
        let ml2 = false;
        let ml3 = false;
        let ml4 = false;

        const mdl = {
            name: 'mdl',
            init: [function() {
                init1 = true;
            }, {
                name: 'initfn1',
                middleware(next) {
                    setTimeout(() => {
                        expect(init1).to.be.equal(true);
                        expect(init2).to.be.equal(false);

                        init2 = true;

                        next();
                    }, 300);
                }
            }, {
                name: 'initfn2',
                middleware: function() {
                    expect(init1).to.be.equal(true);
                    expect(init2).to.be.equal(true);
                    expect(init3).to.be.equal(false);

                    init3 = true;
                }
            }],
            moduleLogic: [
                async function() {
                    expect(init1).to.be.equal(true);
                    expect(init2).to.be.equal(true);
                    expect(init3).to.be.equal(true);
                    expect(ml1).to.be.equal(false);

                    ml1 = true;
                },
                {
                    name: 'ml1',
                    async middleware() {
                        expect(init1).to.be.equal(true);
                        expect(init2).to.be.equal(true);
                        expect(init3).to.be.equal(true);
                        expect(ml1).to.be.equal(true);
                        expect(ml2).to.be.equal(false);

                        ml2 = true;
                    }
                },
                {
                    name: 'ml2',
                    middleware: async function() {
                        expect(init1).to.be.equal(true);
                        expect(init2).to.be.equal(true);
                        expect(init3).to.be.equal(true);
                        expect(ml1).to.be.equal(true);
                        expect(ml2).to.be.equal(true);
                        expect(ml3).to.be.equal(false);

                        ml3 = true;
                    }
                },
                {
                    name: 'ml3',
                    middleware(next) {
                        setTimeout(() => {
                            expect(init1).to.be.equal(true);
                            expect(init2).to.be.equal(true);
                            expect(init3).to.be.equal(true);
        
                            expect(ml1).to.be.equal(true);
                            expect(ml2).to.be.equal(true);
                            expect(ml3).to.be.equal(true);
                            expect(ml4).to.be.equal(false);

                            ml4 = true;

                            next();
                        }, 300);
                    }
                }
            ]
        };

        const g = gabriela.asServer({
            config: {
                server: {
                    port: 4000,
                },
                framework: {},
            }
        }, [], {
            events: {
                onAppStarted: function() {
                    expect(init1).to.be.equal(true);
                    expect(init2).to.be.equal(true);
                    expect(init3).to.be.equal(true);

                    expect(ml1).to.be.equal(true);
                    expect(ml2).to.be.equal(true);
                    expect(ml3).to.be.equal(true);
                    expect(ml4).to.be.equal(true);

                    this.gabriela.close();
                    done();
                }
            }
        });

        g.addModule(mdl);

        g.startApp();
    });

    it('should run named middleware properly using done() middleware function', (done) => {
        let init1 = false;
        let init2 = false;
        let init3 = false;

        let ml1 = false;
        let ml2 = false;
        let ml3 = false;
        let ml4 = false;

        const mdl = {
            name: 'mdl',
            init: [function() {
                init1 = true;
            }, {
                name: 'initfn1',
                middleware(done) {
                    setTimeout(() => {
                        expect(init1).to.be.equal(true);
                        expect(init2).to.be.equal(false);

                        init2 = true;

                        done();
                    }, 500);
                }
            }, {
                name: 'initfn2',
                middleware: function() {
                    init3 = true;
                }
            }],
            moduleLogic: [
                async function() {
                    expect(init1).to.be.equal(true);
                    expect(init2).to.be.equal(true);
                    expect(init3).to.be.equal(false);
                    expect(ml1).to.be.equal(false);

                    ml1 = true;
                },
                {
                    name: 'ml1',
                    async middleware(done) {
                        setTimeout(() => {
                            expect(init1).to.be.equal(true);
                            expect(init2).to.be.equal(true);
                            expect(init3).to.be.equal(false);
                            expect(ml1).to.be.equal(true);
                            expect(ml2).to.be.equal(false);
    
                            ml2 = true;

                            done();
                        });
                    }
                },
                {
                    name: 'ml2',
                    middleware: async function() {
                        ml3 = true;
                    }
                },
                {
                    name: 'ml3',
                    middleware() {
                        ml4 = true;
                    }
                }
            ]
        };

        const g = gabriela.asServer({
            config: {
                server: {
                    port: 4000,
                },
                framework: {},
            }
        }, [], {
            events: {
                onAppStarted: function() {
                    expect(init1).to.be.equal(true);
                    expect(init2).to.be.equal(true);
                    expect(init3).to.be.equal(false);
                    expect(ml1).to.be.equal(false);
                    expect(ml2).to.be.equal(false);
                    expect(ml3).to.be.equal(false);
                    expect(ml4).to.be.equal(false);

                    this.gabriela.close();
                    done();
                }
            }
        });

        g.addModule(mdl);

        g.startApp();
    });

    it('should properly run named middleware with done() and next() with async functions', (done) => {
        let init1 = false;
        let init2 = false;
        let init3 = false;

        let ml1 = false;
        let ml2 = false;
        let ml3 = false;
        let ml4 = false;

        const mdl = {
            name: 'mdl',
            init: [function() {
                init1 = true;
            }, {
                name: 'initfn1',
                middleware(next) {
                    setTimeout(() => {
                        expect(init1).to.be.equal(true);
                        expect(init2).to.be.equal(false);

                        init2 = true;

                        next();
                    }, 500);
                }
            }, {
                name: 'initfn2',
                middleware: function() {
                    init3 = true;
                }
            }],
            moduleLogic: [
                async function(done) {
                    expect(init1).to.be.equal(true);
                    expect(init2).to.be.equal(true);
                    expect(init3).to.be.equal(true);
                    expect(ml1).to.be.equal(false);
                    ml1 = true;

                    done();
                },
                {
                    name: 'ml1',
                    async middleware(done) {
                        setTimeout(() => {
                            expect(init1).to.be.equal(true);
                            expect(init2).to.be.equal(true);
                            expect(init3).to.be.equal(true);
                            expect(ml1).to.be.equal(true);
                            expect(ml2).to.be.equal(false);
    
                            ml2 = true;

                            done();
                        });
                    }
                },
                {
                    name: 'ml2',
                    middleware: async function() {
                        ml3 = true;
                    }
                },
                {
                    name: 'ml3',
                    middleware() {
                        ml4 = true;
                    }
                }
            ]
        };

        const g = gabriela.asServer({
            config: {
                server: {
                    port: 4000,
                },
                framework: {},
            }
        }, [], {
            events: {
                onAppStarted: function() {
                    expect(init1).to.be.equal(true);
                    expect(init2).to.be.equal(true);
                    expect(init3).to.be.equal(true);
                    expect(ml1).to.be.equal(true);
                    expect(ml2).to.be.equal(false);
                    expect(ml3).to.be.equal(false);
                    expect(ml4).to.be.equal(false);

                    this.gabriela.close();
                    done();
                }
            }
        });

        g.addModule(mdl);

        g.startApp();
    });

    it('should properly run named middleware with done() and next() with async functions', (done) => {
        let init1 = false;
        let init2 = false;
        let init3 = false;

        let ml1 = false;
        let ml2 = false;
        let ml3 = false;
        let ml4 = false;

        const mdl = {
            name: 'mdl',
            init: [function() {
                init1 = true;
            }, {
                name: 'initfn1',
                middleware(skip) {
                    setTimeout(() => {
                        expect(init1).to.be.equal(true);
                        expect(init2).to.be.equal(false);

                        init2 = true;

                        skip();
                    }, 500);
                }
            }, {
                name: 'initfn2',
                middleware: function() {
                    init3 = true;
                }
            }],
            moduleLogic: [
                async function() {
                    expect(init1).to.be.equal(true);
                    expect(init2).to.be.equal(true);
                    expect(init3).to.be.equal(false);
                    expect(ml1).to.be.equal(false);
                    ml1 = true;
                },
                {
                    name: 'ml1',
                    middleware(skip) {
                        setTimeout(() => {
                            expect(init1).to.be.equal(true);
                            expect(init2).to.be.equal(true);
                            expect(init3).to.be.equal(false);
                            expect(ml1).to.be.equal(true);
                            expect(ml2).to.be.equal(false);
    
                            ml2 = true;

                            skip();
                        }, 300);
                    }
                },
                {
                    name: 'ml2',
                    middleware: async function() {
                        ml3 = true;
                    }
                },
                {
                    name: 'ml3',
                    middleware() {
                        ml4 = true;
                    }
                }
            ]
        };

        const g = gabriela.asServer({
            config: {
                server: {
                    port: 4000,
                },
                framework: {},
            }
        }, [], {
            events: {
                onAppStarted: function() {
                    expect(init1).to.be.equal(true);
                    expect(init2).to.be.equal(true);
                    expect(init3).to.be.equal(false);
                    expect(ml1).to.be.equal(true);
                    expect(ml2).to.be.equal(true);
                    expect(ml3).to.be.equal(false);
                    expect(ml4).to.be.equal(false);

                    this.gabriela.close();
                    done();
                }
            }
        });

        g.addModule(mdl);

        g.startApp();
    });
});