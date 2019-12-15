const gabriela = require('./src/index');
const router = require('./src/gabriela/router/router2');

const routes = [
    {
        name: 'api',
        basePath: '/api',
        routes: [
            {
                name: 'v1',
                basePath: '/v1',
                routes: [
                    {
                        name: 'v1-path-one',
                        path: '/path-1',
                        methods: ['GET']
                    },
                    {
                        name: 'v1-path-two',
                        path: '/path-2',
                        methods: ['GET']
                    },
                    {
                        name: 'v1-path-three',
                        path: '/path-3',
                        methods: ['GET']
                    }
                ]
            },
            {
                name: 'api-1',
                path: '/api-path-1',
                methods: ['GET'],
            },
            {
                name: 'v2',
                basePath: '/v2',
                routes: [
                    {
                        name: 'v2-path-one',
                        path: '/path-1',
                        methods: ['GET']
                    },
                    {
                        name: 'v2-path-two',
                        path: '/path-2',
                        methods: ['GET']
                    },
                    {
                        name: 'v2-path-three',
                        path: '/path-3',
                        methods: ['GET']
                    }
                ]
            }
        ]
    },
    {
        name: 'other-api',
        basePath: '/other-api',
        routes: [
            {
                name: 'v1',
                basePath: '/v1',
                routes: [
                    {
                        name: 'v1-path-one',
                        path: '/path-1',
                        methods: ['GET']
                    },
                    {
                        name: 'v1-path-two',
                        path: '/path-2',
                        methods: ['GET']
                    },
                    {
                        name: 'v1-path-three',
                        path: '/path-3',
                        methods: ['GET']
                    }
                ]
            },
            {
                name: 'api-1',
                path: '/api-path-1',
                methods: ['GET'],
            },
            {
                name: 'v2',
                basePath: '/v2',
                routes: [
                    {
                        name: 'v2-path-one',
                        path: '/path-1',
                        methods: ['GET']
                    },
                    {
                        name: 'v2-path-two',
                        path: '/path-2',
                        methods: ['GET']
                    },
                    {
                        name: 'v2-path-three',
                        path: '/path-3',
                        methods: ['GET']
                    }
                ]
            }
        ]
    }
];

router.injectRoutes(routes);