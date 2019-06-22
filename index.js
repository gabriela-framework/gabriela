const deepCopy = require('deepcopy');

function outer(obj) {
    function inner() {
        this.innerObj = obj;
    }

    return new inner();
}

let obj = {name: 'name'};

const inner = outer(deepCopy(obj));

console.log(inner);

obj.name = 'othername';

console.log(inner);





