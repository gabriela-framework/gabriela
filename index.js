require('./src/gabriela/global');


const Default = {
    strictNext: false,
};

const opts = {
    spdy: true,
    https: true,
    something: 'something',
    strictNext: true,
};

const filtered = Object.filter(opts, (key, val) => {
    return key !== 'strictNext' && key !== 'port' && key !== 'host';
});

console.log({...Default, ...filtered});