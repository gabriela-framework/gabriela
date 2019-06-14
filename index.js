const {OrderedMap} = require('immutable');

const userModule = {
    name: 'userModule',
};

const commentModule = {
    name: 'commentModule',
};

let map = OrderedMap();

map = map.set('userModule', userModule);
map = map.set('commentModule', commentModule);

commentModule.name = 'mil';

console.log(map.get('commentModule'));





