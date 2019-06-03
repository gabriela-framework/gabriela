const BasicJob = require('./basicJob');

function factory() {
    this.createBasicJob = function() {
        return new BasicJob();
    }

    this.asServer = function() {
        
    }
}

module.exports = new factory();