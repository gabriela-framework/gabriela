const deasync = require('deasync');
const _waitCheck = require('./_waitCheck');

module.exports = function _resolveService(serviceInit, deps, taskRunner) {
    let service;
    if (serviceInit.isAsync) {
        serviceInit.init(...deps);

        let wait = 0;
        while(!(_waitCheck(taskRunner)).success) {
            wait++;

            // todo: handle timeout on resolving services, maybe some config file?
            /*                if (wait === 1000) {
                                throw new Error(`Dependency injection error. Dependency ${name} waited too long to be resolved`);
                            }*/

            deasync.sleep(0);
        }

        service = taskRunner.getValue().call(null);

        taskRunner.resolve();
    } else {

        service = serviceInit.init(...deps);
    }

    return service;
};