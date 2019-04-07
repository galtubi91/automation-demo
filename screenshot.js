console.log("screenshot file!!!!!!");


const path = require('path');
const mkdirp = require('mkdirp');
const { WebClient } = require('@slack/client');
const fs = require('fs');
const stripAnsi = require('strip-ansi');

const token = process.env.SLACK_TOKEN;
const slack = new WebClient(token);
const slackChannel = 'regression-test';
const isSlackMessageEnabled = process.env.ENABLE_SLACK_MESSAGE === 'true';
const screenshotsPath = path.resolve('./screenshots');

let screenshotPromise = Promise.resolve();
beforeEach(() => screenshotPromise);
afterAll(() => screenshotPromise);


const toFilename = s => s.replace(/[^a-z0-9.-]+/gi, '_');

async function takeScreenshot(testName, pageInstance = page) {
    mkdirp.sync(screenshotsPath);
    const filePath = path.join(screenshotsPath, toFilename(`${testName}.png`));
    if (pageInstance._closed === true) {
        if (isSlackMessageEnabled) {
            await slack.chat.postMessage({
                channel: 'regression-test',
                text: testName,
                attachments: [{
                    color: '#B60909',
                    text: 'The test failed because the browser was closed',
                }],
            });
        }
    } else {
        return pageInstance.screenshot({
            path: filePath,
        });
    }
    return true;
}

function message(name, text) {
    const msg = {
        channel: slackChannel,
        text: name,
        attachments: [{
            color: '#B60909',
            text: text,
        }],
        icon_emoji: ':fire:',
    };
    slack.chat.postMessage(msg).then((res) => {
        console.log('message sent: ', res.ok);
    });
}

function slackUploadScreenshot(result) {
    return slack.files.upload({
        title: result.fullName,
        file: fs.createReadStream(
            `./screenshots/${result.fullName.replace(/[^a-z0-9.-]+/gi, '_')}.png`,
        ),
        channels: slackChannel,
    });
}

// eslint-disable-next-line no-undef
jasmine.getEnv().addReporter({
    specDone: async (result) => {
        if (result.status === 'failed') {
            screenshotPromise = screenshotPromise
                .catch()
                .then(() => takeScreenshot(result.fullName))
                .then(() => {
                    if (isSlackMessageEnabled) {
                        slackUploadScreenshot(result)
                            .then(() => {
                                message(
                                    result.fullName,
                                    stripAnsi(result.failedExpectations[0].message),
                                );
                            })
                            .catch((err) => {
                                console.log('the error is: ', err);
                                message(
                                    result.fullName,
                                    stripAnsi(result.failedExpectations[0].message),
                                );
                            });
                    }
                });
        }
    },
});

module.exports = {
    takeScreenshot,
};