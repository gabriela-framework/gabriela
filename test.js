const requestPromise = require('request-promise');
const tough = require('tough-cookie');
const music = require('./../personal-js-utility-pack/src/music');


// Easy creation of the cookie - see tough-cookie docs for details
let cookie = new tough.Cookie({
    key: "school_id",
    value: "681",
});

const cookiejar = requestPromise.jar();
cookiejar.setCookie(cookie.toString(), '33.33.33.10');
const options = {
    method: 'POST',
    uri: 'http://33.33.33.10/stories/create/1345',
    form: {
        teacher: '2275',
        story_name: 'sdafasdfsaf',
        keyword_1: 'keyword1',
        keyword_2: 'keyword2',
        children: [4990],
        csrf_name: 'csrf5d891dc8cdb2c',
        csrf_value: '69fc1f2a58d843452f78b971255e37d2',
    },
    jar: cookiejar
};

const tasks = [];
for (let i = 0; i < 10000; i++) {
    tasks.push(function() {
        return requestPromise(options)
            .then(function (body) {
                console.log('Success');
            })
            .catch(function (err) {
                if (!err.response) {
                    console.log('Response does not exist');

                    return;
                }

                const headers = err.response.headers;

                if (headers['custom-header']) {
                } else {
                    console.log('Failed');
                }
            });
    });
}

music.billieHoliday.limitedSequenceQueue({
    limit: 100,
    tasks: tasks,
    onError: (err) => {console.log(err)},
});