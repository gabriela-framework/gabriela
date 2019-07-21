function instance() {

}

function factory() {
    this.create = function() {
        return new instance();
    }
}

module.exports = new factory();