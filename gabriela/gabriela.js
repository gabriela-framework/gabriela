const BasicModule = require('./basicModule');

function factory() {
    this.createModule = function() {
        return new BasicModule();
    }

    this.asServer = function() {
        
    }
}

module.exports = new factory();