const Job = require('./job');

function factory() {
    this.create = function() {
        return new instance();
    }

    function instance() {
        const jobs = {};

        function addJob(job) {
            if (jobs.hasOwnProperty(job.name)) {
                throw new Error(`Job with name '${job.name}' already exists`);
            }

            if (!jobs.hasOwnProperty(job.name)) {
                jobs[job.name] = Object.assign({}, new Job(job));
            }
        }
    
        function hasJob(nameOrJobObject) {
            return jobs.hasOwnProperty(nameOrJobObject);
        }
    
        function getJob(name) {
            if (!this.hasJob(name)) {
                return undefined;
            }
    
            return Object.assign({}, jobs[name]);
        }

        function getJobs() {
            return jobs;
        }
        
        function removeJob(name) {
            if (!this.hasJob(name)) return false;
    
            // add code for non configurable properties or a try/catch if in strict mode
            delete jobs[name];
    
            return true;
        }

        this.addJob = addJob;
        this.hasJob = hasJob;
        this.getJob = getJob;
        this.getJobs = getJobs;
        this.removeJob = removeJob;
    }
}

module.exports = new factory();